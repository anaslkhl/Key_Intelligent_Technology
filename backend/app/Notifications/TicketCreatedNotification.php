<?php

namespace App\Notifications;

use App\Mail\TicketCreatedMail;
use App\Models\Ticket;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class TicketCreatedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public Ticket $ticket)
    {
    }

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        $preferences = $notifiable->notification_preferences ?? ['email' => true, 'in_app' => true];

        return array_values(array_filter([
            ($preferences['in_app'] ?? true) ? 'database' : null,
            ($preferences['email'] ?? true) ? 'mail' : null,
        ]));
    }

    public function toMail(object $notifiable): TicketCreatedMail
    {
        return new TicketCreatedMail($this->ticket);
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'ticket_id' => $this->ticket->id,
            'title' => $this->ticket->title,
            'priority' => $this->ticket->priority,
            'status' => $this->ticket->status,
            'message' => 'A new support ticket was created.',
        ];
    }
}
