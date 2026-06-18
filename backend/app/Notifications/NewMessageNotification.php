<?php

namespace App\Notifications;

use App\Mail\NewMessageMail;
use App\Models\TicketMessage;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class NewMessageNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public TicketMessage $message)
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

    public function toMail(object $notifiable): NewMessageMail
    {
        return new NewMessageMail($this->message);
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'ticket_id' => $this->message->ticket_id,
            'message_id' => $this->message->id,
            'author_id' => $this->message->user_id,
            'message' => 'A new ticket message was posted.',
        ];
    }
}
