<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KbArticle extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'title',
        'slug',
        'content',
        'family_id',
        'product_id',
        'tags',
        'author_id',
        'views',
        'helpful_count',
        'not_helpful_count',
        'is_published',
    ];

    protected function casts(): array
    {
        return [
            'tags' => 'array',
            'views' => 'integer',
            'helpful_count' => 'integer',
            'not_helpful_count' => 'integer',
            'is_published' => 'boolean',
        ];
    }

    public function family(): BelongsTo
    {
        return $this->belongsTo(ProductFamily::class, 'family_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }
}
