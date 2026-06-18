<?php

namespace App\Mail;

use App\Models\Ticket;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class TicketAssignedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public Ticket $ticket)
    {
    }

    public function build(): self
    {
        return $this->subject('A ticket has been assigned to you')
            ->html(sprintf(
                '<h1>Ticket assigned</h1><p><strong>%s</strong></p><p>Priority: %s</p>',
                e($this->ticket->title),
                e($this->ticket->priority),
            ));
    }
}
