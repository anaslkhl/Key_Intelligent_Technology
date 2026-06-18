<?php

namespace App\Notifications;

use App\Mail\TicketClosedMail;
use App\Mail\TicketResolvedMail;
use App\Mail\TicketStatusChangedMail;
use App\Models\Ticket;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Notifications\Notification;

class TicketStatusChangedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public Ticket $ticket, public ?string $oldStatus = null)
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

    public function toMail(object $notifiable): Mailable
    {
        return match ($this->ticket->status) {
            'resolved' => new TicketResolvedMail($this->ticket),
            'closed' => new TicketClosedMail($this->ticket),
            default => new TicketStatusChangedMail($this->ticket, $this->oldStatus),
        };
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'ticket_id' => $this->ticket->id,
            'title' => $this->ticket->title,
            'old_status' => $this->oldStatus,
            'new_status' => $this->ticket->status,
            'message' => 'A support ticket status changed.',
        ];
    }
}
