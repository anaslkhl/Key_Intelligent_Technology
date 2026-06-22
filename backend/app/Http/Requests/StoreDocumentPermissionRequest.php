<?php

namespace App\Http\Requests;

use App\Models\Document;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;

class StoreDocumentPermissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Gate::allows('managePermissions', Document::class);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'user_id' => ['required', 'uuid', 'exists:users,id'],
            'can_view' => ['sometimes', 'boolean'],
            'can_download' => ['sometimes', 'boolean'],
        ];
    }
}
