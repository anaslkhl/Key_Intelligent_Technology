<?php

namespace App\Http\Controllers;

use App\Models\ErrorCode;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ErrorCodeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'q' => ['nullable', 'string', 'max:255'],
            'product_id' => ['nullable', 'uuid', 'exists:products,id'],
            'family_id' => ['nullable', 'uuid', 'exists:product_families,id'],
            'severity' => ['nullable', Rule::in(ErrorCode::SEVERITIES)],
        ]);

        $codes = ErrorCode::query()
            ->with(['product:id,family_id,model,name', 'product.family:id,name', 'article' => fn ($query) => $query->where('is_published', true)->select(['id', 'title', 'slug', 'is_published'])])
            ->when($validated['q'] ?? null, function (Builder $query, string $term): void {
                $query->where(function (Builder $query) use ($term): void {
                    $query->where('code', 'ilike', "%{$term}%")
                        ->orWhere('meaning', 'ilike', "%{$term}%")
                        ->orWhere('cause', 'ilike', "%{$term}%")
                        ->orWhere('solution', 'ilike', "%{$term}%");
                });
            })
            ->when($validated['product_id'] ?? null, fn (Builder $query, string $productId) => $query->where('product_id', $productId))
            ->when($validated['family_id'] ?? null, fn (Builder $query, string $familyId) => $query->whereHas('product', fn (Builder $query) => $query->where('family_id', $familyId)))
            ->when($validated['severity'] ?? null, fn (Builder $query, string $severity) => $query->where('severity', $severity))
            ->orderByRaw('lower(code)')
            ->paginate($this->perPage(12));

        return $this->paginatedPayload($codes, 'Error codes retrieved successfully.');
    }

    public function show(string $id): JsonResponse
    {
        $code = ErrorCode::query()
            ->with(['product.family', 'article' => fn ($query) => $query->where('is_published', true)])
            ->findOrFail($id);

        return $this->success($code, 'Error code retrieved successfully.');
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorizeWriter($request);
        $code = ErrorCode::query()->create($this->validatedData($request));

        return $this->success($code->load(['product.family', 'article']), 'Error code created successfully.', 201);
    }

    public function update(Request $request, ErrorCode $errorCode): JsonResponse
    {
        $this->authorizeWriter($request);
        $errorCode->update($this->validatedData($request, true));

        return $this->success($errorCode->load(['product.family', 'article']), 'Error code updated successfully.');
    }

    public function destroy(Request $request, ErrorCode $errorCode): JsonResponse
    {
        abort_unless($request->user()?->role === 'admin', 403, 'Only admins can delete error codes.');
        $errorCode->delete();

        return $this->success(null, 'Error code deleted successfully.');
    }

    private function validatedData(Request $request, bool $updating = false): array
    {
        $required = $updating ? 'sometimes' : 'required';

        return $request->validate([
            'code' => [$required, 'string', 'max:100'],
            'meaning' => [$required, 'string', 'max:255'],
            'severity' => [$required, Rule::in(ErrorCode::SEVERITIES)],
            'cause' => [$required, 'string'],
            'solution' => [$required, 'string'],
            'product_id' => ['nullable', 'uuid', 'exists:products,id'],
            'article_id' => ['nullable', 'uuid', 'exists:kb_articles,id'],
        ]);
    }

    private function authorizeWriter(Request $request): void
    {
        abort_unless(in_array($request->user()?->role, ['agent', 'admin'], true), 403, 'Only agents and admins can manage error codes.');
    }

    private function paginatedPayload($paginator, string $message): JsonResponse
    {
        return response()->json([
            'data' => $paginator->items(),
            'links' => ['first' => $paginator->url(1), 'last' => $paginator->url($paginator->lastPage()), 'prev' => $paginator->previousPageUrl(), 'next' => $paginator->nextPageUrl()],
            'meta' => ['current_page' => $paginator->currentPage(), 'from' => $paginator->firstItem(), 'last_page' => $paginator->lastPage(), 'path' => $paginator->path(), 'per_page' => $paginator->perPage(), 'to' => $paginator->lastItem(), 'total' => $paginator->total()],
            'message' => $message,
            'status' => 200,
        ]);
    }
}
