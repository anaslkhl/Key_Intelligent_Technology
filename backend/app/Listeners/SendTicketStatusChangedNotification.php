<?php

namespace App\Listeners;

use App\Events\TicketStatusChanged;
use App\Notifications\TicketStatusChangedNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;

class SendTicketStatusChangedNotification implements ShouldQueue
{
    public function handle(TicketStatusChanged $event): void
    {
        $ticket = $event->ticket->loadMissing('user');

        if (! $ticket->user || ! RateLimiter::attempt("ticket-status-mail:{$ticket->id}:{$ticket->status}", 1, fn () => true, 60)) {
            return;
        }

        $ticket->user->notify(new TicketStatusChangedNotification($ticket, $event->oldStatus));

        Log::info('Ticket status notification queued.', [
            'ticket_id' => $ticket->id,
            'old_status' => $event->oldStatus,
            'new_status' => $ticket->status,
        ]);
    }
}
