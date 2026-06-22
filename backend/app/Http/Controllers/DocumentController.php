<?php

namespace App\Http\Controllers;

use App\Http\Requests\DocumentUploadRequest;
use App\Http\Requests\StoreDocumentRequest;
use App\Http\Requests\UpdateDocumentRequest;
use App\Http\Resources\DocumentCollection;
use App\Http\Resources\DocumentResource;
use App\Models\Document;
use App\Models\User;
use App\Services\DocumentFileService;
use App\Services\DocumentSearchService;
use App\Services\DocumentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class DocumentController extends Controller
{
    public function __construct(
        private readonly DocumentService $documentService,
        private readonly DocumentSearchService $searchService,
        private readonly DocumentFileService $fileService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'family_id' => ['nullable', 'uuid', 'exists:product_families,id'],
            'product_id' => ['nullable', 'uuid', 'exists:products,id'],
            'category_id' => ['nullable', 'uuid', 'exists:document_categories,id'],
            'document_type' => ['nullable', 'in:pdf,image,video,presentation,other'],
            'visibility' => ['nullable', 'in:client,internal,restricted'],
            'is_published' => ['nullable', 'boolean'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        $query = trim((string) ($validated['search'] ?? ''));
        unset($validated['search']);
        $validated['user'] = Auth::guard('sanctum')->user();
        $validated['per_page'] = (int) ($validated['per_page'] ?? 15);

        return (new DocumentCollection($this->searchService->search($query, $validated)))->response();
    }

    public function show(string $slug): JsonResponse
    {
        $document = Document::query()
            ->with(['category', 'upload', 'uploadedBy:id,name', 'productFamilies', 'products', 'solutionTypes'])
            ->where(function ($query) use ($slug): void {
                $query->where('slug', $slug);

                if (Str::isUuid($slug)) {
                    $query->orWhere('id', $slug);
                }
            })
            ->firstOrFail();
        $user = Auth::guard('sanctum')->user();

        if ($user instanceof User) {
            Gate::forUser($user)->authorize('view', $document);
        } else {
            abort_unless($this->isPublicDocument($document), 404);
        }

        $this->documentService->incrementView($document);

        return $this->success(
            new DocumentResource($document->refresh()->load(['category', 'upload', 'uploadedBy:id,name', 'productFamilies', 'products', 'solutionTypes'])),
            'Document retrieved successfully.',
        );
    }

    public function store(StoreDocumentRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['uploaded_by'] = $request->user()->id;
        $document = $this->documentService->create($data);

        return $this->success(new DocumentResource($document), 'Document created successfully.', 201);
    }

    public function upload(DocumentUploadRequest $request): JsonResponse
    {
        $upload = $this->fileService->store($request->file('file'), $request->user());

        return $this->success([
            'id' => $upload->id,
            'original_name' => $upload->original_name,
            'file_size' => $upload->file_size,
            'mime_type' => $upload->mime_type,
        ], 'Document file uploaded successfully.', 201);
    }

    public function update(UpdateDocumentRequest $request, Document $document): JsonResponse
    {
        $data = $request->validated();
        $data['updated_by'] = $request->user()->id;
        $document = $this->documentService->update($document, $data);

        return $this->success(new DocumentResource($document), 'Document updated successfully.');
    }

    public function destroy(Document $document): JsonResponse
    {
        Gate::authorize('delete', $document);
        $this->documentService->delete($document);

        return $this->success(null, 'Document deleted successfully.');
    }

    public function publish(Document $document): JsonResponse
    {
        Gate::authorize('update', $document);
        $this->documentService->publish($document);

        return $this->success(
            new DocumentResource($document->refresh()->load(['category', 'upload', 'uploadedBy:id,name', 'productFamilies', 'products', 'solutionTypes'])),
            'Document published successfully.',
        );
    }

    public function download(Document $document): BinaryFileResponse
    {
        Gate::authorize('download', $document);

        $upload = $document->upload;
        abort_unless(Storage::disk($upload->disk)->exists($upload->file_path), 404, 'Document file not found.');
        $this->documentService->incrementDownload($document);

        return response()->download(
            Storage::disk($upload->disk)->path($upload->file_path),
            $upload->original_name,
            ['Content-Type' => $upload->mime_type],
        );
    }

    public function preview(Document $document): JsonResponse
    {
        Gate::authorize('view', $document);
        $document->loadMissing('upload');
        $canDownload = Gate::allows('download', $document);

        return $this->success([
            'id' => $document->id,
            'title' => $document->title,
            'document_type' => $document->document_type,
            'mime_type' => $document->upload->mime_type,
            'file_size' => $document->upload->file_size,
            'preview_url' => $this->fileService->generatePreview($document),
            'download_url' => $canDownload ? URL::temporarySignedRoute(
                'documents.download',
                now()->addMinutes(15),
                ['document' => $document->id],
            ) : null,
            'expires_in' => $canDownload ? 900 : null,
        ], 'Document preview retrieved successfully.');
    }

    private function isPublicDocument(Document $document): bool
    {
        return $document->is_published
            && $document->visibility === 'client'
            && ! $document->products()->exists()
            && ! $document->productFamilies()->exists();
    }
}
