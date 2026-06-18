<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuestionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'content' => $this->content,
            'tags' => $this->tags ?? [],
            'upvotes' => $this->upvotes,
            'downvotes' => $this->downvotes,
            'is_solved' => $this->is_solved,
            'created_at' => $this->created_at,
            'user' => $this->whenLoaded('user', fn () => [
                'id' => $this->user->id,
                'name' => $this->user->name,
            ]),
            'answers_count' => $this->whenCounted('answers'),
            'answers' => AnswerResource::collection($this->whenLoaded('answers')),
        ];
    }
}
