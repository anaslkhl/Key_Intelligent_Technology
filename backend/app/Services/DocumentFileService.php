<?php

namespace App\Services;

use App\Models\Document;
use App\Models\Upload;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class DocumentFileService
{
    /**
     * @return array{original_name: string, size: int, mime_type: string, extension: string, document_type: string}
     */
    public function validateFile(UploadedFile $file): array
    {
        Validator::make(['file' => $file], [
            'file' => [
                'required',
                'file',
                'max:20480',
                'mimes:pdf,jpg,jpeg,png,gif,webp,mp4,pptx',
                'mimetypes:application/pdf,image/jpeg,image/png,image/gif,image/webp,video/mp4,application/vnd.openxmlformats-officedocument.presentationml.presentation',
            ],
        ], [
            'file.max' => 'Documents may not be larger than 20 MB.',
            'file.mimes' => 'Documents must be a PDF, image, MP4 video, or PPTX presentation.',
        ])->validate();

        $extension = strtolower($file->getClientOriginalExtension());

        return [
            'original_name' => $file->getClientOriginalName(),
            'size' => (int) $file->getSize(),
            'mime_type' => $file->getMimeType() ?: 'application/octet-stream',
            'extension' => $extension,
            'document_type' => $this->documentTypeFor($extension),
        ];
    }

    public function generatePreview(Document $document): ?string
    {
        if ($document->thumbnail) {
            return Storage::disk($document->upload->disk)->url($document->thumbnail);
        }

        if (in_array($document->document_type, ['pdf', 'image', 'video'], true)) {
            return Storage::disk($document->upload->disk)->url($document->upload->file_path);
        }

        return null;
    }

    public function store(UploadedFile $file, User $user): Upload
    {
        $metadata = $this->validateFile($file);
        $directory = 'uploads/documents/'.now()->format('Y/m');
        $filename = Str::uuid()->toString().'.'.$metadata['extension'];
        $path = $file->storeAs($directory, $filename, 'public');

        return DB::transaction(fn () => Upload::query()->create([
            'user_id' => $user->id,
            'original_name' => Str::limit(basename($metadata['original_name']), 255, ''),
            'file_path' => $path,
            'file_size' => $metadata['size'],
            'mime_type' => $metadata['mime_type'],
            'disk' => 'public',
        ]));
    }

    private function documentTypeFor(string $extension): string
    {
        return match ($extension) {
            'pdf' => 'pdf',
            'jpg', 'jpeg', 'png', 'gif', 'webp' => 'image',
            'mp4' => 'video',
            'pptx' => 'presentation',
            default => 'other',
        };
    }
}
