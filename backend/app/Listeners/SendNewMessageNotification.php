<?php

namespace App\Listeners;

use App\Events\TicketMessageCreated;
use App\Models\User;
use App\Notifications\NewMessageNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;

class SendNewMessageNotification implements ShouldQueue
{
    public function handle(TicketMessageCreated $event): void
    {
        $message = $event->message->loadMissing(['ticket.user', 'user']);

        if (! RateLimiter::attempt("ticket-message-mail:{$message->id}", 1, fn () => true, 60)) {
            return;
        }

        if ($message->user?->role === 'client') {
            User::query()
                ->where('role', 'agent')
                ->where('is_active', true)
                ->each(fn (User $agent) => $agent->notify(new NewMessageNotification($message)));
        } elseif (! $message->is_internal && $message->ticket?->user) {
            $message->ticket->user->notify(new NewMessageNotification($message));
        }

        Log::info('Ticket message notifications queued.', ['message_id' => $message->id]);
    }
}
