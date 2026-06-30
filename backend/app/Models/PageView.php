<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PageView extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'path',
        'method',
        'ip_address',
        'user_agent',
        'session_id',
        'referer',
        'response_time',
        'status_code',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'response_time' => 'integer',
            'status_code' => 'integer',
            'created_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
