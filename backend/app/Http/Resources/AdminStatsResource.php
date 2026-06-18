<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminStatsResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'total_users' => $this->resource['total_users'],
            'total_tickets' => $this->resource['total_tickets'],
            'total_robots' => $this->resource['total_robots'],
            'total_articles' => $this->resource['total_articles'],
            'total_reviews' => $this->resource['total_reviews'],
            'pending_reviews' => $this->resource['pending_reviews'],
            'open_tickets' => $this->resource['open_tickets'],
            'csat_average' => $this->resource['csat_average'],
        ];
    }
}
