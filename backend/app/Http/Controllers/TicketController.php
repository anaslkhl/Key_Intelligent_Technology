<?php

namespace App\Http\Controllers;

use App\Events\TicketCreated;
use App\Http\Resources\TicketResource;
use App\Models\Robot;
use App\Models\Ticket;
use App\Models\TicketCategory;
use App\Models\TicketMessage;
use App\Models\Upload;
use App\Models\UserActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class TicketController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorizeClient($request);

        $validated = $request->validate([
            'status' => ['nullable', Rule::in(['new', 'open', 'in_progress', 'waiting_client', 'resolved', 'closed'])],
            'category_id' => ['nullable', 'uuid', 'exists:ticket_categories,id'],
            'family_id' => ['nullable', 'uuid', 'exists:product_families,id'],
        ]);

        $baseQuery = Ticket::query()
            ->where('user_id', $request->user()->id);

        $filters = $this->ticketFilters($request->user()->id);

        $tickets = (clone $baseQuery)
            ->when($validated['status'] ?? null, fn ($query, string $status) => $query->where('status', $status))
            ->when($validated['category_id'] ?? null, fn ($query, string $categoryId) => $query->where('category_id', $categoryId))
            ->when($validated['family_id'] ?? null, fn ($query, string $familyId) => $query->whereHas(
                'robot.product',
                fn ($productQuery) => $productQuery->where('family_id', $familyId)
            ))
            ->with([
                'robot.product.family',
                'category',
                'assignee:id,name,email',
            ])
            ->withCount('messages')
            ->latest()
            ->paginate($this->perPage());

        return response()->json([
            'data' => TicketResource::collection($tickets->items()),
            'filters' => $filters,
            'links' => [
                'first' => $tickets->url(1),
                'last' => $tickets->url($tickets->lastPage()),
                'prev' => $tickets->previousPageUrl(),
                'next' => $tickets->nextPageUrl(),
            ],
            'meta' => [
                'current_page' => $tickets->currentPage(),
                'from' => $tickets->firstItem(),
                'last_page' => $tickets->lastPage(),
                'path' => $tickets->path(),
                'per_page' => $tickets->perPage(),
                'to' => $tickets->lastItem(),
                'total' => $tickets->total(),
            ],
            'message' => 'Tickets retrieved successfully.',
            'status' => 200,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorizeClient($request);

        $validated = $request->validate([
            'robot_id' => [
                'required',
                'uuid',
                Rule::exists('robots', 'id')->where(
                    fn ($query) => $query->where('user_id', $request->user()->id)
                ),
            ],
            'category_id' => ['required', 'uuid', 'exists:ticket_categories,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'priority' => ['required', 'string', Rule::in(['low', 'medium', 'high', 'urgent'])],
            'attachments' => ['sometimes', 'array'],
            'attachments.*' => ['string', 'max:2048', 'exists:uploads,file_path'],
        ], [
            'robot_id.exists' => 'The selected robot does not exist or does not belong to your account.',
            'category_id.exists' => 'The selected ticket category does not exist.',
        ]);

        $this->ensureAttachmentsBelongToUser($validated['attachments'] ?? [], $request->user()->id);

        $robot = Robot::query()
            ->with('product')
            ->find($validated['robot_id']);

        $category = TicketCategory::query()->find($validated['category_id']);

        if (! $robot || ! $category) {
            return $this->error('The selected robot or ticket category is no longer available.', [], 422);
        }

        if ($category->family_id !== $robot->product->family_id) {
            return $this->error('The selected ticket category does not belong to this robot product family.', [
                'category_id' => ['Choose a category from the selected robot product family.'],
            ], 422);
        }

        $ticket = DB::transaction(function () use ($request, $robot, $category, $validated): Ticket {
            $ticket = Ticket::query()->create([
                'user_id' => $request->user()->id,
                'robot_id' => $robot->id,
                'category_id' => $category->id,
                'title' => $validated['title'],
                'description' => $validated['description'],
                'priority' => $validated['priority'],
                'status' => 'new',
            ]);

            if (! empty($validated['attachments'])) {
                $message = $ticket->messages()->create([
                    'user_id' => $request->user()->id,
                    'content' => $validated['description'],
                    'attachments' => $validated['attachments'],
                    'is_internal' => false,
                ]);

                Upload::query()
                    ->where('user_id', $request->user()->id)
                    ->whereIn('file_path', $validated['attachments'])
                    ->update([
                        'attachable_type' => TicketMessage::class,
                        'attachable_id' => $message->id,
                    ]);
            }

            return $ticket;
        });

        $ticket->load([
            'robot.product.family',
            'category',
            'messages.user:id,name,email,role',
        ]);

        UserActivityLog::query()->create([
            'user_id' => $request->user()->id,
            'action' => 'ticket_created',
            'ip_address' => $request->ip() ?? '127.0.0.1',
            'user_agent' => $request->userAgent(),
            'details' => ['priority' => $validated['priority'], 'ticket_id' => $ticket->id],
            'created_at' => now(),
        ]);

        TicketCreated::dispatch($ticket);

        return $this->success(new TicketResource($ticket), 'Ticket created successfully.', 201);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $this->authorizeClient($request);

        $ticket = Ticket::query()
            ->where('id', $id)
            ->where('user_id', $request->user()->id)
            ->with([
                'robot.product.family',
                'category',
                'assignee:id,name,email',
                'messages' => fn ($query) => $query
                    ->where('is_internal', false)
                    ->oldest(),
                'messages.user:id,name,email,role',
            ])
            ->firstOrFail();

        return $this->success(new TicketResource($ticket), 'Ticket retrieved successfully.');
    }

    public function close(Request $request, string $id): JsonResponse
    {
        $this->authorizeClient($request);

        $validated = $request->validate([
            'csat_rating' => ['required', 'integer', 'between:1,5'],
        ]);

        $ticket = Ticket::query()
            ->where('user_id', $request->user()->id)
            ->where('id', $id)
            ->firstOrFail();

        if ($ticket->status === 'closed') {
            return $this->error('This ticket is already closed.', [], 422);
        }

        $ticket->update([
            'status' => 'closed',
            'csat_rating' => $validated['csat_rating'],
        ]);

        $ticket->load(['robot.product.family', 'category', 'assignee:id,name']);

        return $this->success(new TicketResource($ticket), 'Ticket closed successfully.');
    }

    private function authorizeClient(Request $request): void
    {
        abort_unless($request->user()?->is_active, 403, 'Your account is inactive.');
        abort_unless($request->user()?->role === 'client', 403, 'Only authenticated clients can access tickets.');
    }

    /**
     * @return array{categories: array<int, array<string, mixed>>, families: array<int, array<string, mixed>>}
     */
    private function ticketFilters(string $userId): array
    {
        $categories = TicketCategory::query()
            ->with('family:id,name')
            ->withCount([
                'tickets as tickets_count' => fn ($query) => $query->where('user_id', $userId),
            ])
            ->orderBy('name')
            ->get()
            ->filter(fn (TicketCategory $category) => (int) $category->tickets_count > 0)
            ->map(fn (TicketCategory $category) => [
                'id' => $category->id,
                'name' => $category->name,
                'family_id' => $category->family_id,
                'family_name' => $category->family?->name,
                'count' => (int) $category->tickets_count,
            ])
            ->values()
            ->all();

        $families = DB::table('tickets')
            ->join('robots', 'tickets.robot_id', '=', 'robots.id')
            ->join('products', 'robots.product_id', '=', 'products.id')
            ->join('product_families', 'products.family_id', '=', 'product_families.id')
            ->where('tickets.user_id', $userId)
            ->select([
                'product_families.id',
                'product_families.name',
                DB::raw('COUNT(tickets.id) as tickets_count'),
            ])
            ->groupBy('product_families.id', 'product_families.name', 'product_families.sort_order')
            ->orderBy('product_families.sort_order')
            ->orderBy('product_families.name')
            ->get()
            ->map(fn ($family) => [
                'id' => $family->id,
                'name' => $family->name,
                'count' => (int) $family->tickets_count,
            ])
            ->values()
            ->all();

        return [
            'categories' => $categories,
            'families' => $families,
        ];
    }

    /**
     * @param array<int, string> $paths
     */
    private function ensureAttachmentsBelongToUser(array $paths, string $userId): void
    {
        $paths = array_unique($paths);

        if ($paths === []) {
            return;
        }

        $ownedUploads = Upload::query()
            ->where('user_id', $userId)
            ->whereIn('file_path', $paths)
            ->count();

        abort_unless($ownedUploads === count($paths), 403, 'All attachments must belong to the authenticated user.');
    }
}
