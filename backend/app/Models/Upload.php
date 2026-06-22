<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Upload extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'original_name',
        'file_path',
        'file_size',
        'mime_type',
        'disk',
        'attachable_type',
        'attachable_id',
    ];

    protected function casts(): array
    {
        return [
            'file_size' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function attachable(): MorphTo
    {
        return $this->morphTo();
    }

    public function document(): HasOne
    {
        return $this->hasOne(Document::class);
    }

    public function documentVersions(): HasMany
    {
        return $this->hasMany(DocumentVersion::class);
    }
}
