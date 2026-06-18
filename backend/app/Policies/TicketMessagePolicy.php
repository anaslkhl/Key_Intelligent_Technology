<?php

namespace App\Policies;

use App\Models\Ticket;
use App\Models\TicketMessage;
use App\Models\User;

class TicketMessagePolicy
{
    /**
     * Determine whether a user can list messages for a ticket.
     */
    public function viewAny(User $user, Ticket $ticket): bool
    {
        return $this->isStaff($user) || $ticket->user_id === $user->id;
    }

    /**
     * Determine whether a user can create a message on a ticket.
     */
    public function create(User $user, Ticket $ticket): bool
    {
        return $this->isStaff($user) || $ticket->user_id === $user->id;
    }

    /**
     * Determine whether a user can update their own recent message.
     */
    public function update(User $user, TicketMessage $message): bool
    {
        return $message->user_id === $user->id && $message->created_at?->gt(now()->subMinutes(15));
    }

    /**
     * Determine whether a user can delete their own recent message.
     */
    public function delete(User $user, TicketMessage $message): bool
    {
        return $this->update($user, $message);
    }

    private function isStaff(User $user): bool
    {
        return in_array($user->role, ['agent', 'admin'], true);
    }
}
