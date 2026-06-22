<?php

namespace App\Http\Controllers;

use App\Models\KbArticle;
use App\Models\KbSearchLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;

class KbAnalyticsController extends Controller
{
    public function __invoke(): JsonResponse
    {
        Gate::authorize('viewAdminDashboard');

        $articleColumns = ['id', 'title', 'slug', 'category', 'views', 'helpful_count', 'not_helpful_count'];
        $mostViewed = KbArticle::query()->where('is_published', true)->orderByDesc('views')->limit(10)->get($articleColumns);
        $leastHelpful = KbArticle::query()
            ->where('is_published', true)
            ->whereRaw('(helpful_count + not_helpful_count) > 0')
            ->select($articleColumns)
            ->selectRaw('ROUND((helpful_count::numeric / NULLIF(helpful_count + not_helpful_count, 0)) * 100, 1) as helpful_ratio')
            ->orderBy('helpful_ratio')
            ->orderByDesc('not_helpful_count')
            ->limit(10)
            ->get();

        $noResults = KbSearchLog::query()
            ->where('results_count', 0)
            ->selectRaw('normalized_query as keyword, MAX(query) as display_query, COUNT(*) as searches')
            ->groupBy('normalized_query')
            ->orderByDesc('searches')
            ->limit(10)
            ->get();

        $mostSearched = KbSearchLog::query()
            ->selectRaw('normalized_query as keyword, MAX(query) as display_query, COUNT(*) as searches')
            ->groupBy('normalized_query')
            ->orderByDesc('searches')
            ->limit(10)
            ->get();

        return $this->success([
            'most_viewed' => $mostViewed,
            'least_helpful' => $leastHelpful,
            'no_result_searches' => $noResults,
            'most_searched' => $mostSearched,
        ], 'Knowledge base analytics retrieved successfully.');
    }
}
