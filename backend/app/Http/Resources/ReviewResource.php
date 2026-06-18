<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReviewResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'rating' => $this->rating,
            'title' => $this->title,
            'comment' => $this->comment,
            'pros' => $this->pros,
            'cons' => $this->cons,
            'is_approved' => $this->is_approved,
            'created_at' => $this->created_at,
            'user' => $this->whenLoaded('user', fn () => [
                'id' => $this->user->id,
                'name' => $this->user->name,
            ]),
            'robot' => $this->whenLoaded('robot', fn () => [
                'id' => $this->robot->id,
                'name' => $this->robot->name,
                'product' => $this->robot->relationLoaded('product') && $this->robot->product ? [
                    'id' => $this->robot->product->id,
                    'model' => $this->robot->product->model,
                    'name' => $this->robot->product->name,
                ] : null,
            ]),
        ];
    }
}
