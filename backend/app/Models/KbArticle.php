<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class KbArticle extends Model
{
    use HasFactory, HasUuids;

    public const CATEGORIES = [
        'getting_started',
        'troubleshooting',
        'maintenance',
        'product_guides',
        'faqs',
        'video_tutorials',
    ];

    protected $attributes = [
        'category' => 'getting_started',
    ];

    protected $fillable = [
        'title',
        'slug',
        'content',
        'category',
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

    public function errorCodes(): HasMany
    {
        return $this->hasMany(ErrorCode::class, 'article_id');
    }

    public function recentViews(): HasMany
    {
        return $this->hasMany(KbRecentView::class, 'article_id');
    }

    public function readingTime(): int
    {
        $plainText = trim(strip_tags((string) Str::markdown($this->content)));
        $words = $plainText === '' ? 0 : count(preg_split('/\s+/u', $plainText) ?: []);

        return max(1, (int) ceil($words / 200));
    }
}
