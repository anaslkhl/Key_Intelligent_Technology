<?php

namespace App\Http\Controllers;

use App\Http\Requests\MultipleUploadRequest;
use App\Http\Requests\UploadRequest;
use App\Http\Resources\UploadResource;
use App\Models\Upload;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    /**
     * Upload a single file.
     */
    public function upload(UploadRequest $request): JsonResponse
    {
        $upload = DB::transaction(fn () => $this->storeFile($request->file('file'), $request->user()->id));

        return $this->success(new UploadResource($upload), 'File uploaded successfully', 201);
    }

    /**
     * Upload up to five files.
     */
    public function uploadMultiple(MultipleUploadRequest $request): JsonResponse
    {
        $uploads = DB::transaction(function () use ($request) {
            return collect($request->file('files'))
                ->map(fn (UploadedFile $file) => $this->storeFile($file, $request->user()->id))
                ->values();
        });

        return $this->success(UploadResource::collection($uploads), 'Files uploaded successfully', 201);
    }

    /**
     * Show upload metadata for the owner.
     */
    public function show(string $id): JsonResponse
    {
        $upload = Upload::query()->where('user_id', request()->user()->id)->findOrFail($id);

        return $this->success(new UploadResource($upload), 'File details retrieved successfully');
    }

    /**
     * Delete an uploaded file owned by the authenticated user.
     */
    public function destroy(string $id): JsonResponse
    {
        $upload = Upload::query()->where('user_id', request()->user()->id)->findOrFail($id);

        DB::transaction(function () use ($upload): void {
            Storage::disk($upload->disk)->delete($upload->file_path);
            $upload->delete();
        });

        return $this->success(null, 'File deleted successfully');
    }

    /**
     * Persist a file to public storage and record its metadata.
     */
    private function storeFile(UploadedFile $file, string $userId): Upload
    {
        $year = now()->format('Y');
        $month = now()->format('m');
        $extension = strtolower($file->getClientOriginalExtension());
        $filename = Str::uuid()->toString().'.'.$extension;
        $directory = "uploads/{$year}/{$month}";
        $path = $file->storeAs($directory, $filename, 'public');

        return Upload::query()->create([
            'user_id' => $userId,
            'original_name' => basename($file->getClientOriginalName()),
            'file_path' => $path,
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType() ?: 'application/octet-stream',
            'disk' => 'public',
        ]);
    }
}
