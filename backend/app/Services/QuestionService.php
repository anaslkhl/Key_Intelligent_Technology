<?php

namespace App\Services;

use App\Models\ForumQuestion;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class QuestionService
{
    public function create(User $user, array $data): ForumQuestion
    {
        return ForumQuestion::query()->create([
            'user_id' => $user->id,
            'title' => $data['title'],
            'content' => $data['content'],
            'tags' => $data['tags'] ?? [],
        ]);
    }

    public function update(ForumQuestion $question, array $data): ForumQuestion
    {
        $question->update($data);

        return $question;
    }

    public function toggleVote(ForumQuestion $question, User $user, string $vote): ForumQuestion
    {
        try {
            DB::transaction(function () use ($question, $user, $vote): void {
                $question->votes()->create([
                    'user_id' => $user->id,
                    'vote_type' => $vote,
                ]);

                $question->increment($vote === 'up' ? 'upvotes' : 'downvotes');
            });
        } catch (QueryException) {
            throw new RuntimeException('You have already voted on this question.');
        }

        return $question->refresh();
    }
}
