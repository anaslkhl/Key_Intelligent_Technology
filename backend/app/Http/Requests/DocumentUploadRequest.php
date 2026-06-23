<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DocumentUploadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAgent() || $this->user()?->isAdmin();
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $fileRules = [
            'file',
            'max:20480',
            'mimes:pdf,jpg,jpeg,png,gif,webp,mp4,pptx',
            'mimetypes:application/pdf,image/jpeg,image/png,image/gif,image/webp,video/mp4,application/vnd.openxmlformats-officedocument.presentationml.presentation',
        ];

        return [
            $this->uploadField() => ['required', ...$fileRules],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'document.required_without' => 'Choose a document file to upload.',
            'file.required_without' => 'Choose a document file to upload.',
            'document.max' => 'Documents may not be larger than 20 MB.',
            'file.max' => 'Documents may not be larger than 20 MB.',
            'document.mimes' => 'Documents must be a PDF, image, MP4 video, or PPTX presentation.',
            'file.mimes' => 'Documents must be a PDF, image, MP4 video, or PPTX presentation.',
        ];
    }

    private function uploadField(): string
    {
        if (array_key_exists('document', $this->allFiles()) || $this->has('document')) {
            return 'document';
        }

        return 'file';
    }
}
