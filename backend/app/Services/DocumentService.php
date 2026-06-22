<?php

namespace App\Services;

use App\Models\Document;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class DocumentService
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Document
    {
        return DB::transaction(function () use ($data): Document {
            $productFamilyIds = Arr::pull($data, 'product_family_ids', []);
            $productIds = Arr::pull($data, 'product_ids', []);
            $solutionTypeIds = Arr::pull($data, 'solution_type_ids', []);

            if (($data['is_published'] ?? false) && empty($data['published_at'])) {
                $data['published_at'] = now();
            }

            $document = Document::query()->create($data);
            $document->productFamilies()->sync($productFamilyIds);
            $document->products()->sync($productIds);
            $document->solutionTypes()->sync($solutionTypeIds);
            $document->versions()->create([
                'upload_id' => $document->upload_id,
                'version' => $document->version,
                'change_notes' => 'Initial version',
                'uploaded_by' => $document->uploaded_by,
            ]);

            return $this->loadRelations($document);
        });
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Document $document, array $data): Document
    {
        return DB::transaction(function () use ($document, $data): Document {
            $syncFamilies = array_key_exists('product_family_ids', $data);
            $syncProducts = array_key_exists('product_ids', $data);
            $syncSolutionTypes = array_key_exists('solution_type_ids', $data);
            $productFamilyIds = Arr::pull($data, 'product_family_ids', []);
            $productIds = Arr::pull($data, 'product_ids', []);
            $solutionTypeIds = Arr::pull($data, 'solution_type_ids', []);
            $changeNotes = Arr::pull($data, 'change_notes');
            $updatedBy = Arr::pull($data, 'updated_by', $document->uploaded_by);
            $previousVersion = $document->version;

            if (($data['is_published'] ?? false) && ! $document->published_at) {
                $data['published_at'] = now();
            }

            if (array_key_exists('is_published', $data) && ! $data['is_published']) {
                $data['published_at'] = null;
            }

            $document->update($data);

            if ($syncFamilies) {
                $document->productFamilies()->sync($productFamilyIds);
            }

            if ($syncProducts) {
                $document->products()->sync($productIds);
            }

            if ($syncSolutionTypes) {
                $document->solutionTypes()->sync($solutionTypeIds);
            }

            if ($document->version !== $previousVersion) {
                $document->versions()->create([
                    'upload_id' => $document->upload_id,
                    'version' => $document->version,
                    'change_notes' => $changeNotes,
                    'uploaded_by' => $updatedBy,
                ]);
            }

            return $this->loadRelations($document->refresh());
        });
    }

    public function publish(Document $document): void
    {
        $document->update([
            'is_published' => true,
            'published_at' => $document->published_at ?? now(),
        ]);
    }

    public function delete(Document $document): void
    {
        DB::transaction(fn () => $document->delete());
    }

    public function incrementView(Document $document): void
    {
        $document->increment('view_count');
    }

    public function incrementDownload(Document $document): void
    {
        $document->increment('download_count');
    }

    private function loadRelations(Document $document): Document
    {
        return $document->load([
            'category',
            'upload',
            'uploadedBy:id,name',
            'productFamilies',
            'products',
            'solutionTypes',
        ]);
    }
}
