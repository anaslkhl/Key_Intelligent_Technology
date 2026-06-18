<?php

namespace App\Listeners;

use App\Events\TicketCreated;
use App\Models\User;
use App\Notifications\TicketCreatedNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;

class SendTicketCreatedNotification implements ShouldQueue
{
    public function handle(TicketCreated $event): void
    {
        if (! RateLimiter::attempt("ticket-created-mail:{$event->ticket->id}", 1, fn () => true, 60)) {
            return;
        }

        User::query()
            ->where('role', 'agent')
            ->where('is_active', true)
            ->each(fn (User $agent) => $agent->notify(new TicketCreatedNotification($event->ticket)));

        Log::info('Ticket created notifications queued.', ['ticket_id' => $event->ticket->id]);
    }
}
