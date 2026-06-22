<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Document extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'title',
        'slug',
        'description',
        'category_id',
        'upload_id',
        'document_type',
        'visibility',
        'is_published',
        'published_at',
        'uploaded_by',
        'version',
        'language',
        'download_count',
        'view_count',
        'thumbnail',
    ];

    protected function casts(): array
    {
        return [
            'is_published' => 'boolean',
            'published_at' => 'datetime',
            'download_count' => 'integer',
            'view_count' => 'integer',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(DocumentCategory::class, 'category_id');
    }

    public function upload(): BelongsTo
    {
        return $this->belongsTo(Upload::class);
    }

    public function uploadedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function productFamilies(): BelongsToMany
    {
        return $this->belongsToMany(ProductFamily::class, 'document_product_family');
    }

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'document_product');
    }

    public function solutionTypes(): BelongsToMany
    {
        return $this->belongsToMany(SolutionType::class, 'document_solution_type');
    }

    public function permissions(): HasMany
    {
        return $this->hasMany(DocumentPermission::class);
    }

    public function versions(): HasMany
    {
        return $this->hasMany(DocumentVersion::class);
    }
}
