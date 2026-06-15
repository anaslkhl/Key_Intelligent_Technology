<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ForumAnswer extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'question_id',
        'user_id',
        'content',
        'upvotes',
        'is_accepted',
    ];

    protected function casts(): array
    {
        return [
            'upvotes' => 'integer',
            'is_accepted' => 'boolean',
        ];
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(ForumQuestion::class, 'question_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
