<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KbSearchLog extends Model
{
    use HasUuids;

    protected $fillable = ['user_id', 'query', 'normalized_query', 'results_count'];

    protected function casts(): array
    {
        return ['results_count' => 'integer'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
