<?php

namespace App\Http\Requests;

use App\Models\Document;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class UpdateDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        $document = $this->route('document');

        return $document instanceof Document && Gate::allows('update', $document);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        /** @var Document $document */
        $document = $this->route('document');
        $currentVersionId = $document->versions()
            ->where('version', $document->version)
            ->value('id');

        return [
            'title' => ['sometimes', 'string', 'max:255'],
            'slug' => ['sometimes', 'string', 'max:255', 'alpha_dash', Rule::unique('documents', 'slug')->ignore($document)],
            'description' => ['sometimes', 'nullable', 'string', 'max:10000'],
            'category_id' => ['sometimes', 'uuid', 'exists:document_categories,id'],
            'upload_id' => ['sometimes', 'uuid', 'exists:uploads,id'],
            'document_type' => ['sometimes', Rule::in(['pdf', 'image', 'video', 'presentation', 'other'])],
            'visibility' => ['sometimes', Rule::in(['client', 'internal', 'restricted'])],
            'is_published' => ['sometimes', 'boolean'],
            'version' => ['sometimes', 'string', 'max:50', Rule::unique('document_versions', 'version')->where('document_id', $document->id)->ignore($currentVersionId)],
            'change_notes' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'language' => ['sometimes', 'string', 'max:10', 'regex:/^[a-z]{2,3}(?:-[A-Z]{2})?$/'],
            'thumbnail' => ['sometimes', 'nullable', 'string', 'max:2048'],
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
            'version.unique' => 'This document already has the specified version.',
            'language.regex' => 'Language must use a code such as en, fr, or en-US.',
        ];
    }
}
