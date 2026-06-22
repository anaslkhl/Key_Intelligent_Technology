<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ErrorCode extends Model
{
    use HasFactory, HasUuids;

    public const SEVERITIES = ['low', 'medium', 'high', 'critical'];

    protected $fillable = [
        'code',
        'meaning',
        'severity',
        'cause',
        'solution',
        'product_id',
        'article_id',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function article(): BelongsTo
    {
        return $this->belongsTo(KbArticle::class, 'article_id');
    }
}
