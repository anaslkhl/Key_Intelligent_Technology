<?php

namespace App\Listeners;

use App\Events\TicketAssigned;
use App\Mail\TicketAssignedMail;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendTicketAssignedMail implements ShouldQueue
{
    public function handle(TicketAssigned $event): void
    {
        $ticket = $event->ticket->loadMissing('assignee');

        if (! $ticket->assignee) {
            return;
        }

        Mail::to($ticket->assignee)->queue(new TicketAssignedMail($ticket));

        Log::info('Ticket assigned email queued.', [
            'ticket_id' => $ticket->id,
            'assigned_to' => $ticket->assigned_to,
        ]);
    }
}
