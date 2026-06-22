<?php

namespace App\Http\Requests;

use App\Models\Document;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class StoreDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Gate::allows('create', Document::class);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'alpha_dash', Rule::unique('documents', 'slug')],
            'description' => ['nullable', 'string', 'max:10000'],
            'category_id' => ['required', 'uuid', 'exists:document_categories,id'],
            'upload_id' => ['required', 'uuid', 'exists:uploads,id'],
            'document_type' => ['required', Rule::in(['pdf', 'image', 'video', 'presentation', 'other'])],
            'visibility' => ['sometimes', Rule::in(['client', 'internal', 'restricted'])],
            'is_published' => ['sometimes', 'boolean'],
            'version' => ['sometimes', 'string', 'max:50'],
            'language' => ['sometimes', 'string', 'max:10', 'regex:/^[a-z]{2,3}(?:-[A-Z]{2})?$/'],
            'thumbnail' => ['nullable', 'string', 'max:2048'],
            'product_family_ids' => ['sometimes', 'array'],
            'product_family_ids.*' => ['uuid', 'distinct', 'exists:product_families,id'],
            'product_ids' => ['sometimes', 'array'],
            'product_ids.*' => ['uuid', 'distinct', 'exists:products,id'],
            'solution_type_ids' => ['sometimes', 'array'],
            'solution_type_ids.*' => ['uuid', 'distinct', 'exists:solution_types,id'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'category_id.exists' => 'The selected document category does not exist.',
            'upload_id.exists' => 'The selected upload does not exist.',
            'document_type.in' => 'The document type must be PDF, image, video, presentation, or other.',
            'visibility.in' => 'Visibility must be client, internal, or restricted.',
            'language.regex' => 'Language must use a code such as en, fr, or en-US.',
        ];
    }
}
