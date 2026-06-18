<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MultipleUploadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user();
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'files' => ['required', 'array', 'max:5'],
            'files.*' => ['required', 'file', 'max:5120', 'mimes:jpg,jpeg,png,gif,webp,pdf,mp4'],
        ];
    }
}
