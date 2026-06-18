<?php

namespace App\Models;

use App\Events\TicketAssigned;
use App\Events\TicketStatusChanged;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Ticket extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'robot_id',
        'category_id',
        'title',
        'description',
        'priority',
        'status',
        'assigned_to',
        'csat_rating',
    ];

    protected function casts(): array
    {
        return [
            'csat_rating' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function robot(): BelongsTo
    {
        return $this->belongsTo(Robot::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(TicketCategory::class, 'category_id');
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(TicketMessage::class);
    }

    protected static function booted(): void
    {
        static::updated(function (Ticket $ticket): void {
            if ($ticket->wasChanged('assigned_to') && $ticket->assigned_to) {
                TicketAssigned::dispatch($ticket);
            }

            if ($ticket->wasChanged('status')) {
                TicketStatusChanged::dispatch($ticket, $ticket->getOriginal('status'));
            }
        });
    }
}
