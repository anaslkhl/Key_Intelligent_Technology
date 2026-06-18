<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminTicketResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'status' => $this->status,
            'priority' => $this->priority,
            'user' => $this->whenLoaded('user', fn () => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
            ]),
            'robot' => $this->whenLoaded('robot', fn () => [
                'id' => $this->robot->id,
                'name' => $this->robot->name,
                'serial_number' => $this->robot->serial_number,
                'product' => $this->robot->relationLoaded('product') && $this->robot->product ? [
                    'id' => $this->robot->product->id,
                    'model' => $this->robot->product->model,
                    'name' => $this->robot->product->name,
                ] : null,
            ]),
            'assigned_to' => $this->whenLoaded('assignee', fn () => $this->assignee ? [
                'id' => $this->assignee->id,
                'name' => $this->assignee->name,
                'email' => $this->assignee->email,
            ] : null),
            'created_at' => $this->created_at,
        ];
    }
}
