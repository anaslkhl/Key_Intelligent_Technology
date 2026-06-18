<?php

namespace App\Mail;

use App\Models\TicketMessage;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class NewMessageMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public TicketMessage $message)
    {
    }

    public function build(): self
    {
        return $this->subject('New support ticket message')
            ->html(sprintf(
                '<h1>New ticket message</h1><p><strong>Ticket:</strong> %s</p><p>%s</p>',
                e($this->message->ticket?->title),
                nl2br(e($this->message->content)),
            ));
    }
}
