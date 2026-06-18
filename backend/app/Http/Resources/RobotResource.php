<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RobotResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'serial_number' => $this->serial_number,
            'name' => $this->name,
            'purchase_date' => $this->purchase_date,
            'warranty_end' => $this->warranty_end,
            'status' => $this->status,
            'created_at' => $this->created_at,
            'product' => $this->whenLoaded('product', fn () => [
                'id' => $this->product->id,
                'model' => $this->product->model,
                'name' => $this->product->name,
                'family' => $this->product->relationLoaded('family') && $this->product->family ? [
                    'id' => $this->product->family->id,
                    'name' => $this->product->family->name,
                ] : null,
            ]),
        ];
    }
}
