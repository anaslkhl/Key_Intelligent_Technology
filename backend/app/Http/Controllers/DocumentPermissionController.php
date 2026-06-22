<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDocumentPermissionRequest;
use App\Http\Requests\UpdateDocumentPermissionRequest;
use App\Models\Document;
use App\Models\DocumentPermission;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class DocumentPermissionController extends Controller
{
    public function index(Document $document): JsonResponse
    {
        Gate::authorize('managePermissions', Document::class);

        return $this->success(
            $document->permissions()->with(['user:id,name,email', 'grantor:id,name'])->latest()->get(),
            'Document permissions retrieved successfully.',
        );
    }

    public function store(Document $document, StoreDocumentPermissionRequest $request): JsonResponse
    {
        $data = $this->normalizePermissions($request->validated());
        $permission = DB::transaction(fn () => $document->permissions()->updateOrCreate(
            ['user_id' => $data['user_id']],
            [
                'can_view' => $data['can_view'],
                'can_download' => $data['can_download'],
                'granted_by' => $request->user()->id,
            ],
        ));

        return $this->success(
            $permission->load(['user:id,name,email', 'grantor:id,name']),
            'Document permission saved successfully.',
            201,
        );
    }

    public function update(DocumentPermission $permission, UpdateDocumentPermissionRequest $request): JsonResponse
    {
        $data = $this->normalizePermissions(array_merge([
            'can_view' => $permission->can_view,
            'can_download' => $permission->can_download,
        ], $request->validated()));

        $permission->update([
            'can_view' => $data['can_view'],
            'can_download' => $data['can_download'],
            'granted_by' => $request->user()->id,
        ]);

        return $this->success(
            $permission->refresh()->load(['user:id,name,email', 'grantor:id,name']),
            'Document permission updated successfully.',
        );
    }

    public function destroy(DocumentPermission $permission): JsonResponse
    {
        Gate::authorize('managePermissions', Document::class);
        $permission->delete();

        return $this->success(null, 'Document permission removed successfully.');
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function normalizePermissions(array $data): array
    {
        $data['can_view'] = (bool) ($data['can_view'] ?? true);
        $data['can_download'] = $data['can_view'] && (bool) ($data['can_download'] ?? true);

        return $data;
    }
}
