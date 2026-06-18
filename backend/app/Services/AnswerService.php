<?php

namespace App\Services;

use App\Models\ForumAnswer;
use App\Models\ForumQuestion;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class AnswerService
{
    public function create(ForumQuestion $question, User $user, array $data): ForumAnswer
    {
        return $question->answers()->create([
            'user_id' => $user->id,
            'content' => $data['content'],
        ]);
    }

    public function update(ForumAnswer $answer, array $data): ForumAnswer
    {
        $answer->update($data);

        return $answer;
    }

    public function toggleVote(ForumAnswer $answer, User $user, string $vote): ForumAnswer
    {
        try {
            DB::transaction(function () use ($answer, $user, $vote): void {
                $answer->votes()->create([
                    'user_id' => $user->id,
                    'vote_type' => $vote,
                ]);

                $answer->increment($vote === 'up' ? 'upvotes' : 'downvotes');
            });
        } catch (QueryException) {
            throw new RuntimeException('You have already voted on this answer.');
        }

        return $answer->refresh();
    }

    public function acceptAnswer(ForumAnswer $answer): ForumAnswer
    {
        DB::transaction(function () use ($answer): void {
            $answer->question->answers()->where('is_accepted', true)->update(['is_accepted' => false]);
            $answer->update(['is_accepted' => true]);
            $answer->question->update(['is_solved' => true]);
        });

        return $answer->refresh();
    }
}
