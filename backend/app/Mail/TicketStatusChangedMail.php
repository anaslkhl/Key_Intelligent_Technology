<?php

namespace App\Mail;

use App\Models\Ticket;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class TicketStatusChangedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public Ticket $ticket, public ?string $oldStatus = null)
    {
    }

    public function build(): self
    {
        return $this->subject('Your support ticket status changed')
            ->html(sprintf(
                '<h1>Ticket status changed</h1><p><strong>%s</strong></p><p>Old status: %s</p><p>New status: %s</p>',
                e($this->ticket->title),
                e($this->oldStatus ?? 'unknown'),
                e($this->ticket->status),
            ));
    }
}
