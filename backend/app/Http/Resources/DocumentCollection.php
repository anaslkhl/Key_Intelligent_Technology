<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class DocumentCollection extends ResourceCollection
{
    /** @var class-string */
    public $collects = DocumentResource::class;

    /**
     * @return array<string, mixed>
     */
    public function with(Request $request): array
    {
        return [
            'message' => 'Documents retrieved successfully.',
            'status' => 200,
        ];
    }
}
