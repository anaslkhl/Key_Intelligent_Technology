<?php

namespace App\Services;

use App\Models\Document;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class DocumentSearchService
{
    public function __construct(private readonly DocumentAccessService $accessService) {}

    /**
     * @param  array<string, mixed>  $filters
     */
    public function search(string $query, array $filters): LengthAwarePaginator
    {
        $builder = Document::query()->with([
            'category',
            'upload',
            'uploadedBy:id,name',
            'productFamilies',
            'products',
            'solutionTypes',
        ]);

        $this->applyAccessScope($builder, $filters['user'] ?? null);

        $builder
            ->when($filters['family_id'] ?? null, fn (Builder $builder, string $id) => $builder
                ->whereHas('productFamilies', fn (Builder $query) => $query->where('product_families.id', $id)))
            ->when($filters['product_id'] ?? null, fn (Builder $builder, string $id) => $builder
                ->whereHas('products', fn (Builder $query) => $query->where('products.id', $id)))
            ->when($filters['category_id'] ?? null, fn (Builder $builder, string $id) => $builder->where('category_id', $id))
            ->when($filters['document_type'] ?? null, fn (Builder $builder, string $type) => $builder->where('document_type', $type))
            ->when($filters['visibility'] ?? null, fn (Builder $builder, string $visibility) => $builder->where('visibility', $visibility))
            ->when(array_key_exists('is_published', $filters), fn (Builder $builder) => $builder->where('is_published', $filters['is_published']));

        if ($query !== '') {
            if (DB::getDriverName() === 'pgsql') {
                $builder
                    ->whereRaw("search_vector @@ websearch_to_tsquery('simple', ?)", [$query])
                    ->orderByRaw("ts_rank(search_vector, websearch_to_tsquery('simple', ?)) DESC", [$query]);
            } else {
                $builder->where(function (Builder $builder) use ($query): void {
                    $builder->where('title', 'like', "%{$query}%")
                        ->orWhere('description', 'like', "%{$query}%");
                });
            }
        }

        return $builder
            ->latest('published_at')
            ->latest('created_at')
            ->paginate((int) ($filters['per_page'] ?? 15))
            ->withQueryString();
    }

    private function applyAccessScope(Builder $builder, ?User $user): void
    {
        if ($user) {
            $builder->whereIn('id', $this->accessService->getAccessibleDocuments($user)->pluck('id'));

            return;
        }

        $builder
            ->where('is_published', true)
            ->where('visibility', 'client')
            ->whereDoesntHave('products')
            ->whereDoesntHave('productFamilies');
    }
}
