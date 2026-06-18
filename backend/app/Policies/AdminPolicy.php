<?php

namespace App\Policies;

use App\Models\User;

class AdminPolicy
{
    /**
     * Allow only admins to access dashboard APIs.
     */
    public function viewAdminDashboard(User $user): bool
    {
        return $user->role === 'admin';
    }
}
