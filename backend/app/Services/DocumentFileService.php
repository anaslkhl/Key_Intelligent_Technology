<?php

namespace App\Services;

use App\Models\Document;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

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

        if ($document->document_type === 'image') {
            return Storage::disk($document->upload->disk)->url($document->upload->file_path);
        }

        return null;
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
