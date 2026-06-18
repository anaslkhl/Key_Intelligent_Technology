<?php

namespace App\Mail;

use App\Models\Ticket;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class TicketCreatedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public Ticket $ticket)
    {
    }

    public function build(): self
    {
        return $this->subject('New support ticket created')
            ->html($this->htmlBody());
    }

    private function htmlBody(): string
    {
        return sprintf(
            '<h1>New support ticket</h1><p><strong>%s</strong></p><p>Priority: %s</p><p>Status: %s</p>',
            e($this->ticket->title),
            e($this->ticket->priority),
            e($this->ticket->status),
        );
    }
}
