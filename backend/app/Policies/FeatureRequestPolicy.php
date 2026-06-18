<?php

namespace App\Policies;

use App\Models\FeatureRequest;
use App\Models\User;

class FeatureRequestPolicy
{
    public function updateStatus(User $user, FeatureRequest $featureRequest): bool
    {
        return $user->role === 'admin';
    }
}
