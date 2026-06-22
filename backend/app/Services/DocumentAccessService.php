<?php

namespace App\Services;

use App\Models\Document;
use App\Models\DocumentPermission;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class DocumentAccessService
{
    public function canView(User $user, Document $document): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        if ($user->isAgent()) {
            return $document->visibility !== 'restricted';
        }

        if (! $user->isClient() || ! $document->is_published || $document->visibility === 'internal') {
            return false;
        }

        $permission = $this->permissionFor($user, $document);

        if ($document->visibility === 'restricted') {
            return (bool) $permission?->can_view;
        }

        if ($permission && ! $permission->can_view) {
            return false;
        }

        $document->loadMissing(['products:id', 'productFamilies:id']);

        if ($document->products->isEmpty() && $document->productFamilies->isEmpty()) {
            return true;
        }

        [$productIds, $familyIds] = $this->ownedProductIds($user);

        return $document->products->pluck('id')->intersect($productIds)->isNotEmpty()
            || $document->productFamilies->pluck('id')->intersect($familyIds)->isNotEmpty();
    }

    public function canDownload(User $user, Document $document): bool
    {
        if (! $this->canView($user, $document)) {
            return false;
        }

        if ($user->isAdmin() || $user->isAgent()) {
            return true;
        }

        $permission = $this->permissionFor($user, $document);

        return ! $permission || (bool) $permission->can_download;
    }

    /**
     * @return Collection<int, Document>
     */
    public function getAccessibleDocuments(User $user): Collection
    {
        $query = Document::query()->with([
            'category',
            'upload',
            'uploadedBy:id,name',
            'productFamilies',
            'products',
            'solutionTypes',
        ]);

        if ($user->isAdmin()) {
            return $query->get();
        }

        if ($user->isAgent()) {
            return $query->where('visibility', '!=', 'restricted')->get();
        }

        if (! $user->isClient()) {
            return collect();
        }

        [$productIds, $familyIds] = $this->ownedProductIds($user);

        return $query
            ->where('is_published', true)
            ->where('visibility', '!=', 'internal')
            ->where(function (Builder $query) use ($user, $productIds, $familyIds): void {
                $query
                    ->where(function (Builder $query) use ($productIds, $familyIds): void {
                        $query
                            ->where('visibility', 'client')
                            ->where(function (Builder $query) use ($productIds, $familyIds): void {
                                $query
                                    ->where(function (Builder $query): void {
                                        $query->whereDoesntHave('products')->whereDoesntHave('productFamilies');
                                    })
                                    ->orWhereHas('products', fn (Builder $query) => $query->whereIn('products.id', $productIds))
                                    ->orWhereHas('productFamilies', fn (Builder $query) => $query->whereIn('product_families.id', $familyIds));
                            });
                    })
                    ->orWhereHas('permissions', fn (Builder $query) => $query
                        ->where('user_id', $user->id)
                        ->where('can_view', true));
            })
            ->get()
            ->filter(fn (Document $document): bool => $this->canView($user, $document))
            ->values();
    }

    private function permissionFor(User $user, Document $document): ?DocumentPermission
    {
        if ($document->relationLoaded('permissions')) {
            return $document->permissions->firstWhere('user_id', $user->id);
        }

        return $document->permissions()->where('user_id', $user->id)->first();
    }

    /**
     * @return array{0: Collection<int, string>, 1: Collection<int, string>}
     */
    private function ownedProductIds(User $user): array
    {
        $products = $user->robots()
            ->join('products', 'robots.product_id', '=', 'products.id')
            ->get(['products.id', 'products.family_id']);

        return [
            $products->pluck('id')->unique()->values(),
            $products->pluck('family_id')->unique()->values(),
        ];
    }
}
