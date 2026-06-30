<?php

namespace App\Http\Controllers;

use App\Models\PageView;
use App\Services\StatisticsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminStatisticsController extends Controller
{
    public function __construct(
        private readonly StatisticsService $statisticsService,
    ) {}

    public function trackPageView(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'path' => ['required', 'string', 'max:2048', 'not_regex:/^\/?api(\/|$)/i'],
            'referer' => ['nullable', 'string', 'max:2048'],
            'session_id' => ['nullable', 'string', 'max:255'],
            'response_time' => ['nullable', 'integer', 'min:0', 'max:600000'],
        ], [
            'path.not_regex' => 'API routes cannot be recorded as page views.',
        ]);

        $path = '/' . ltrim($validated['path'], '/');

        PageView::query()->create([
            'user_id' => $request->user('sanctum')?->id ?? $request->user()?->id,
            'path' => $path,
            'method' => 'SPA',
            'ip_address' => $request->ip() ?? '127.0.0.1',
            'user_agent' => $request->userAgent(),
            'session_id' => $validated['session_id'] ?? null,
            'referer' => $validated['referer'] ?? $request->headers->get('referer'),
            'response_time' => $validated['response_time'] ?? 0,
            'status_code' => 200,
            'created_at' => now(),
        ]);

        return $this->success(null, 'Page view recorded.', 201);
    }

    public function overview(): JsonResponse
    {
        Gate::authorize('viewAdminDashboard');

        $data = $this->statisticsService->getOverview();

        return $this->success($data, 'Overview statistics retrieved successfully.');
    }

    public function pageViews(Request $request): JsonResponse
    {
        Gate::authorize('viewAdminDashboard');

        $validated = $request->validate([
            'days' => ['nullable', 'integer', 'min:1', 'max:365'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $data = $this->statisticsService->getPageViews(
            $validated['days'] ?? 30,
            $validated['page'] ?? 1,
            $validated['per_page'] ?? 15,
        );

        return $this->success($data, 'Page view statistics retrieved successfully.');
    }

    public function userActivity(Request $request): JsonResponse
    {
        Gate::authorize('viewAdminDashboard');

        $validated = $request->validate([
            'days' => ['nullable', 'integer', 'min:1', 'max:365'],
        ]);

        $data = $this->statisticsService->getUserActivity($validated['days'] ?? 30);

        return $this->success($data, 'User activity statistics retrieved successfully.');
    }

    public function sessions(): JsonResponse
    {
        Gate::authorize('viewAdminDashboard');

        $data = $this->statisticsService->getSessions();

        return $this->success($data, 'Session statistics retrieved successfully.');
    }

    public function aiUsage(Request $request): JsonResponse
    {
        Gate::authorize('viewAdminDashboard');

        $validated = $request->validate([
            'days' => ['nullable', 'integer', 'min:1', 'max:365'],
        ]);

        $data = $this->statisticsService->getAIUsage($validated['days'] ?? 30);

        return $this->success($data, 'AI usage statistics retrieved successfully.');
    }

    public function visitorsChart(Request $request): JsonResponse
    {
        Gate::authorize('viewAdminDashboard');

        $validated = $request->validate([
            'days' => ['nullable', 'integer', 'min:1', 'max:365'],
        ]);

        $data = $this->statisticsService->getVisitorsChart($validated['days'] ?? 30);

        return $this->success($data, 'Visitors chart data retrieved successfully.');
    }

    public function pageViewsChart(Request $request): JsonResponse
    {
        Gate::authorize('viewAdminDashboard');

        $validated = $request->validate([
            'days' => ['nullable', 'integer', 'min:1', 'max:365'],
        ]);

        $data = $this->statisticsService->getPageViewsChart($validated['days'] ?? 30);

        return $this->success($data, 'Page views chart data retrieved successfully.');
    }

    public function export(Request $request): StreamedResponse
    {
        Gate::authorize('viewAdminDashboard');

        $validated = $request->validate([
            'type' => ['required', 'in:page-views,user-activity'],
        ]);

        $filename = $validated['type'] === 'page-views' ? 'page-views.csv' : 'user-activity.csv';

        return response()->streamDownload(function () use ($validated) {
            $handle = fopen('php://output', 'w');
            $rows = $this->statisticsService->exportData($validated['type']);

            $headersWritten = false;
            foreach ($rows as $row) {
                if (!$headersWritten) {
                    fputcsv($handle, array_keys($row));
                    $headersWritten = true;
                }
                fputcsv($handle, $row);
            }

            fclose($handle);
        }, $filename, ['Content-Type' => 'text/csv']);
    }
}
