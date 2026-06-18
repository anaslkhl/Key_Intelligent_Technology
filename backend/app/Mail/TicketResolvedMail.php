<?php

namespace App\Mail;

use App\Models\Ticket;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class TicketResolvedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public Ticket $ticket)
    {
    }

    public function build(): self
    {
        return $this->subject('Your support ticket has been resolved')
            ->html(sprintf(
                '<h1>Ticket resolved</h1><p><strong>%s</strong></p><p>Please review the resolution and share your CSAT rating.</p>',
                e($this->ticket->title),
            ));
    }
}
