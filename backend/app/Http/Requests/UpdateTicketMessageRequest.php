<?php

namespace App\Http\Requests;

use App\Models\Upload;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UpdateTicketMessageRequest extends FormRequest
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
            'content' => ['sometimes', 'required', 'string', 'max:5000'],
            'is_internal' => ['sometimes', 'boolean'],
            'attachments' => ['sometimes', 'array'],
            'attachments.*' => ['string', 'max:2048', 'exists:uploads,file_path'],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $paths = array_unique($this->input('attachments', []));

                if ($paths === []) {
                    return;
                }

                $ownedUploads = Upload::query()
                    ->where('user_id', $this->user()?->id)
                    ->whereIn('file_path', $paths)
                    ->count();

                if ($ownedUploads !== count($paths)) {
                    $validator->errors()->add('attachments', 'All attachments must belong to the authenticated user.');
                }
            },
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'content.required' => 'Please enter a message.',
            'content.max' => 'Messages may not be greater than 5000 characters.',
            'attachments.array' => 'Attachments must be provided as an array of file paths.',
        ];
    }
}
