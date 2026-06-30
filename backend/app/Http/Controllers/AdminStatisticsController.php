<?php

namespace App\Http\Controllers;

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
        ]);

        $data = $this->statisticsService->getPageViews($validated['days'] ?? 30);

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

    public function tickets(): JsonResponse
    {
        Gate::authorize('viewAdminDashboard');

        $data = $this->statisticsService->getTicketStats();

        return $this->success($data, 'Ticket statistics retrieved successfully.');
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
