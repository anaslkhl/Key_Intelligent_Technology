<?php

namespace App\Policies;

use App\Models\Document;
use App\Models\User;
use App\Services\DocumentAccessService;

class DocumentPolicy
{
    public function __construct(private readonly DocumentAccessService $accessService) {}

    public function view(User $user, Document $document): bool
    {
        return $this->accessService->canView($user, $document);
    }

    public function download(User $user, Document $document): bool
    {
        return $this->accessService->canDownload($user, $document);
    }

    public function create(User $user): bool
    {
        return $user->isAgent() || $user->isAdmin();
    }

    public function update(User $user, Document $document): bool
    {
        return $user->isAgent() || $user->isAdmin();
    }

    public function delete(User $user, Document $document): bool
    {
        return $user->isAdmin();
    }

    public function managePermissions(User $user): bool
    {
        return $user->isAdmin();
    }
}
