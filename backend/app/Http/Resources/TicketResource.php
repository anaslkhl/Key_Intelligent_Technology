<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TicketResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'priority' => $this->priority,
            'status' => $this->status,
            'csat_rating' => $this->csat_rating,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'robot' => $this->whenLoaded('robot', fn () => new RobotResource($this->robot)),
            'category' => $this->whenLoaded('category', fn () => [
                'id' => $this->category->id,
                'name' => $this->category->name,
            ]),
            'assignee' => $this->whenLoaded('assignee', fn () => $this->assignee ? [
                'id' => $this->assignee->id,
                'name' => $this->assignee->name,
            ] : null),
            'messages_count' => $this->whenCounted('messages'),
            'messages' => TicketMessageResource::collection($this->whenLoaded('messages')),
        ];
    }
}
