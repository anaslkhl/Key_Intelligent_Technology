<?php

namespace App\Mail;

use App\Models\Ticket;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class TicketClosedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public Ticket $ticket)
    {
    }

    public function build(): self
    {
        return $this->subject('Your support ticket has been closed')
            ->html(sprintf(
                '<h1>Ticket closed</h1><p><strong>%s</strong></p><p>Thank you for working with KIT Support Hub.</p>',
                e($this->ticket->title),
            ));
    }
}
