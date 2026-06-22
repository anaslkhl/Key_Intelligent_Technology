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
        return [
            'file' => [
                'required',
                'file',
                'max:20480',
                'mimes:pdf,jpg,jpeg,png,gif,webp,mp4,pptx',
                'mimetypes:application/pdf,image/jpeg,image/png,image/gif,image/webp,video/mp4,application/vnd.openxmlformats-officedocument.presentationml.presentation',
            ],
        ];
    }
}
