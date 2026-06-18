<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FeatureVote extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'feature_id',
        'user_id',
    ];

    public function featureRequest(): BelongsTo
    {
        return $this->belongsTo(FeatureRequest::class, 'feature_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
