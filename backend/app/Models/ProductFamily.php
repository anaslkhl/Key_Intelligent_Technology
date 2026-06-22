<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProductFamily extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'name',
        'description',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
        ];
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class, 'family_id');
    }

    public function ticketCategories(): HasMany
    {
        return $this->hasMany(TicketCategory::class, 'family_id');
    }

    public function kbArticles(): HasMany
    {
        return $this->hasMany(KbArticle::class, 'family_id');
    }

    public function documents(): BelongsToMany
    {
        return $this->belongsToMany(Document::class, 'document_product_family');
    }
}
