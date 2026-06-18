<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UploadResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'original_name' => $this->original_name,
            'file_path' => $this->file_path,
            'file_size' => $this->file_size,
            'mime_type' => $this->mime_type,
            'disk' => $this->disk,
            'url' => '/storage/'.$this->file_path,
            'attachable_type' => $this->attachable_type,
            'attachable_id' => $this->attachable_id,
            'created_at' => $this->created_at,
        ];
    }
}
