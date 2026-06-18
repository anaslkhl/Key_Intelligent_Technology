<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ForumQuestion extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'title',
        'content',
        'tags',
        'upvotes',
        'downvotes',
        'is_solved',
    ];

    protected function casts(): array
    {
        return [
            'tags' => 'array',
            'upvotes' => 'integer',
            'downvotes' => 'integer',
            'is_solved' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function answers(): HasMany
    {
        return $this->hasMany(ForumAnswer::class, 'question_id');
    }

    public function votes(): HasMany
    {
        return $this->hasMany(ForumQuestionVote::class, 'question_id');
    }
}
