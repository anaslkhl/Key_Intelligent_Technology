<?php

namespace App\Policies;

use App\Models\ForumAnswer;
use App\Models\User;

class AnswerPolicy
{
    public function update(User $user, ForumAnswer $answer): bool
    {
        return $answer->user_id === $user->id;
    }

    public function delete(User $user, ForumAnswer $answer): bool
    {
        return $answer->user_id === $user->id || $user->role === 'admin';
    }

    public function accept(User $user, ForumAnswer $answer): bool
    {
        return $answer->question?->user_id === $user->id;
    }
}
