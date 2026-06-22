<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\URL;

class DocumentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $canDownload = $request->user() && Gate::allows('download', $this->resource);

        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'category' => $this->whenLoaded('category', fn () => [
                'id' => $this->category->id,
                'name' => $this->category->name,
                'slug' => $this->category->slug,
            ]),
            'document_type' => $this->document_type,
            'visibility' => $this->visibility,
            'is_published' => $this->is_published,
            'published_at' => $this->published_at,
            'version' => $this->version,
            'language' => $this->language,
            'uploaded_by' => $this->whenLoaded('uploadedBy', fn () => [
                'id' => $this->uploadedBy->id,
                'name' => $this->uploadedBy->name,
            ]),
            'download_count' => $this->download_count,
            'view_count' => $this->view_count,
            'thumbnail' => $this->thumbnail,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'products' => $this->whenLoaded('products', fn () => $this->products->map(fn ($product) => [
                'id' => $product->id,
                'model' => $product->model,
                'name' => $product->name,
            ])->values()),
            'families' => $this->whenLoaded('productFamilies', fn () => $this->productFamilies->map(fn ($family) => [
                'id' => $family->id,
                'name' => $family->name,
            ])->values()),
            'solution_types' => $this->whenLoaded('solutionTypes', fn () => $this->solutionTypes->map(fn ($solutionType) => [
                'id' => $solutionType->id,
                'name' => $solutionType->name,
                'slug' => $solutionType->slug,
            ])->values()),
            'upload' => $this->whenLoaded('upload', fn () => [
                'id' => $this->upload->id,
                'original_name' => $this->upload->original_name,
                'size' => $this->upload->file_size,
                'mime' => $this->upload->mime_type,
                'url' => $canDownload ? URL::temporarySignedRoute(
                    'documents.download',
                    now()->addMinutes(15),
                    ['document' => $this->id],
                ) : null,
            ]),
        ];
    }
}
