<?php

namespace App\Policies;

use App\Models\ForumQuestion;
use App\Models\User;

class QuestionPolicy
{
    public function update(User $user, ForumQuestion $question): bool
    {
        return $question->user_id === $user->id;
    }

    public function delete(User $user, ForumQuestion $question): bool
    {
        return $question->user_id === $user->id || $user->role === 'admin';
    }
}
