<?php

namespace App\Providers;

use App\Events\TicketAssigned;
use App\Events\TicketCreated;
use App\Events\TicketMessageCreated;
use App\Events\TicketStatusChanged;
use App\Listeners\SendNewMessageNotification;
use App\Listeners\SendTicketAssignedMail;
use App\Listeners\SendTicketCreatedNotification;
use App\Listeners\SendTicketStatusChangedNotification;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        Event::listen(TicketCreated::class, SendTicketCreatedNotification::class);
        Event::listen(TicketAssigned::class, SendTicketAssignedMail::class);
        Event::listen(TicketMessageCreated::class, SendNewMessageNotification::class);
        Event::listen(TicketStatusChanged::class, SendTicketStatusChangedNotification::class);
    }
}
