<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, HasUuids, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'company_name',
        'role',
        'password',
        'is_active',
        'email_verified_at',
        'last_login_at',
        'last_login_ip',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_secret',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'last_login_at' => 'datetime',
        ];
    }

    // Relationships
    public function robots(): HasMany
    {
        return $this->hasMany(Robot::class);
    }

    public function tickets(): HasMany
    {
        return $this->hasMany(Ticket::class);
    }

    public function assignedTickets(): HasMany
    {
        return $this->hasMany(Ticket::class, 'assigned_to');
    }

    public function ticketMessages(): HasMany
    {
        return $this->hasMany(TicketMessage::class);
    }

    public function kbArticles(): HasMany
    {
        return $this->hasMany(KbArticle::class, 'author_id');
    }

    public function forumQuestions(): HasMany
    {
        return $this->hasMany(ForumQuestion::class);
    }

    public function forumAnswers(): HasMany
    {
        return $this->hasMany(ForumAnswer::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function featureRequests(): HasMany
    {
        return $this->hasMany(FeatureRequest::class);
    }

    public function featureVotes(): HasMany
    {
        return $this->hasMany(FeatureVote::class);
    }

    public function forumQuestionVotes(): HasMany
    {
        return $this->hasMany(ForumQuestionVote::class);
    }

    public function forumAnswerVotes(): HasMany
    {
        return $this->hasMany(ForumAnswerVote::class);
    }

    // Security methods
    public function isActive(): bool
    {
        return $this->is_active && !is_null($this->email_verified_at);
    }

    public function hasRole(string $role): bool
    {
        return $this->role === $role;
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isAgent(): bool
    {
        return $this->role === 'agent';
    }

    public function isClient(): bool
    {
        return $this->role === 'client';
    }
}