<?php

namespace App\Services;

use App\Models\PageView;
use App\Models\Ticket;
use App\Models\User;
use App\Models\UserActivityLog;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class StatisticsService
{
    private const CACHE_TTL = 300;
    private const RETENTION_DAYS = 90;

    public function getOverview(): array
    {
        $this->pruneOldData();

        $ttl = self::CACHE_TTL;

        return Cache::remember('admin:stats:overview', $ttl, function () {
            $now = now();
            $todayStart = $now->copy()->startOfDay();
            $twentyFourHoursAgo = $now->copy()->subDay();

            $activeSessions = PageView::query()
                ->where('created_at', '>=', $twentyFourHoursAgo)
                ->distinct('session_id')
                ->count('session_id');

            $pageViewsToday = PageView::query()
                ->where('created_at', '>=', $todayStart)
                ->count();

            $totalVisitors = PageView::query()
                ->distinct('ip_address')
                ->count('ip_address');

            $aiMessagesToday = UserActivityLog::query()
                ->where('action', 'ai_chat_message')
                ->where('created_at', '>=', $todayStart)
                ->count();

            $avgResponseTime = (int) PageView::query()
                ->where('created_at', '>=', $twentyFourHoursAgo)
                ->avg('response_time') ?? 0;

            return [
                'active_sessions' => $activeSessions,
                'page_views_today' => $pageViewsToday,
                'total_visitors' => $totalVisitors,
                'ai_messages_today' => $aiMessagesToday,
                'avg_response_time' => $avgResponseTime,
            ];
        });
    }

    public function getPageViews(int $days = 30, int $page = 1, int $perPage = 15): array
    {
        $since = now()->subDays($days)->startOfDay();
        $page = max(1, $page);
        $perPage = min(max(1, $perPage), 100);

        return Cache::remember("admin:stats:page_views:{$days}:{$page}:{$perPage}", self::CACHE_TTL, function () use ($since, $page, $perPage) {
            $paginator = PageView::query()
                ->select([
                    'path',
                    DB::raw('COUNT(*) as views'),
                    DB::raw("COUNT(DISTINCT COALESCE(user_id::text, ip_address)) as unique_visitors"),
                    DB::raw('AVG(response_time) as avg_time_on_page'),
                    DB::raw('MAX(created_at) as last_viewed'),
                ])
                ->where('created_at', '>=', $since)
                ->groupBy('path')
                ->orderByDesc('views')
                ->paginate($perPage, ['*'], 'page', $page);

            $items = $paginator->getCollection()
                ->map(fn ($row) => [
                    'path' => $row->path,
                    'page_name' => $this->pageNameFromPath($row->path),
                    'views' => (int) $row->views,
                    'unique_visitors' => (int) $row->unique_visitors,
                    'avg_time_on_page' => (int) round((float) $row->avg_time_on_page),
                    'last_viewed' => $row->last_viewed,
                ])
                ->values();

            return [
                'data' => $items->all(),
                'links' => [
                    'first' => $paginator->url(1),
                    'last' => $paginator->url($paginator->lastPage()),
                    'prev' => $paginator->previousPageUrl(),
                    'next' => $paginator->nextPageUrl(),
                ],
                'meta' => [
                    'current_page' => $paginator->currentPage(),
                    'from' => $paginator->firstItem(),
                    'last_page' => $paginator->lastPage(),
                    'path' => $paginator->path(),
                    'per_page' => $paginator->perPage(),
                    'to' => $paginator->lastItem(),
                    'total' => $paginator->total(),
                ],
            ];
        });
    }

    public function getUserActivity(int $days = 30): array
    {
        $since = now()->subDays($days)->startOfDay();

        return Cache::remember("admin:stats:user_activity:{$days}", self::CACHE_TTL, function () use ($since) {
            $logins = UserActivityLog::query()
                ->where('action', 'login')
                ->where('created_at', '>=', $since)
                ->select('user_id', DB::raw('COUNT(*) as total_logins'), DB::raw('MAX(created_at) as last_login'))
                ->groupBy('user_id');

            $actions = UserActivityLog::query()
                ->where('created_at', '>=', $since)
                ->select('user_id', DB::raw('COUNT(*) as total_actions'), DB::raw('MAX(created_at) as last_action_time'))
                ->groupBy('user_id');

            return User::query()
                ->leftJoinSub($logins, 'logins', fn ($join) => $join->on('users.id', '=', 'logins.user_id'))
                ->leftJoinSub($actions, 'actions', fn ($join) => $join->on('users.id', '=', 'actions.user_id'))
                ->select([
                    'users.id',
                    'users.name',
                    'users.email',
                    'users.role',
                    'users.is_active',
                    'users.last_login_at',
                    DB::raw('COALESCE(logins.total_logins, 0) as total_logins'),
                    DB::raw('COALESCE(actions.total_actions, 0) as total_actions'),
                    'actions.last_action_time',
                ])
                ->orderByDesc('actions.total_actions')
                ->limit(100)
                ->get()
                ->map(fn ($user) => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'last_login' => $user->last_login_at?->toIso8601String(),
                    'total_logins' => (int) $user->total_logins,
                    'total_actions' => (int) $user->total_actions,
                    'last_action' => $user->last_action_time ? \Carbon\Carbon::parse($user->last_action_time)->toIso8601String() : null,
                    'status' => $user->is_active ? 'active' : 'inactive',
                ])
                ->toArray();
        });
    }

    public function getSessions(): array
    {
        return Cache::remember('admin:stats:sessions', self::CACHE_TTL, function () {
            $threshold = now()->subMinutes(15);
            $idleThreshold = now()->subMinutes(5);

            $recentViews = PageView::query()
                ->select('session_id', 'user_id', 'ip_address', 'user_agent', DB::raw('MAX(created_at) as last_activity'), DB::raw('MIN(created_at) as first_activity'))
                ->where('created_at', '>=', $threshold)
                ->whereNotNull('session_id')
                ->groupBy('session_id', 'user_id', 'ip_address', 'user_agent')
                ->get();

            $users = User::query()
                ->whereIn('id', $recentViews->pluck('user_id')->filter()->unique()->values())
                ->get(['id', 'name', 'email'])
                ->keyBy('id');

            $sessions = [];
            foreach ($recentViews as $view) {
                $user = $view->user_id ? $users->get($view->user_id) : null;
                $firstActivity = $view->first_activity ? Carbon::parse($view->first_activity) : null;
                $lastActivity = $view->last_activity ? Carbon::parse($view->last_activity) : null;

                $duration = $firstActivity && $lastActivity ? $firstActivity->diffInMinutes($lastActivity) : 0;
                $isActive = $lastActivity?->greaterThanOrEqualTo($idleThreshold) ?? false;

                $sessions[] = [
                    'session_id' => $view->session_id,
                    'user' => $user ? ['id' => $user->id, 'name' => $user->name, 'email' => $user->email] : null,
                    'ip_address' => $view->ip_address,
                    'user_agent' => $view->user_agent,
                    'device' => $this->parseUserAgent($view->user_agent),
                    'duration' => $duration,
                    'last_activity' => $lastActivity?->toIso8601String(),
                    'status' => $isActive ? 'active' : 'idle',
                ];
            }

            usort($sessions, fn ($a, $b) => strtotime($b['last_activity']) - strtotime($a['last_activity']));

            return $sessions;
        });
    }

    public function getAIUsage(int $days = 30): array
    {
        $since = now()->subDays($days)->startOfDay();

        return Cache::remember("admin:stats:ai_usage:{$days}", self::CACHE_TTL, function () use ($since) {
            $messagesPerDay = UserActivityLog::query()
                ->select(DB::raw("DATE(created_at) as date"), DB::raw('COUNT(*) as count'))
                ->where('action', 'ai_chat_message')
                ->where('created_at', '>=', $since)
                ->groupBy(DB::raw('DATE(created_at)'))
                ->orderBy('date')
                ->get()
                ->map(fn ($row) => [
                    'date' => $row->date,
                    'count' => (int) $row->count,
                ])
                ->toArray();

            $totalMessages = UserActivityLog::query()
                ->where('action', 'ai_chat_message')
                ->where('created_at', '>=', $since)
                ->count();

            $avgResponseTime = UserActivityLog::query()
                ->where('action', 'ai_chat_message')
                ->where('created_at', '>=', $since)
                ->whereNotNull('details->response_time')
                ->avg(DB::raw("CAST(details->>'response_time' AS integer)"));

            return [
                'messages_per_day' => $messagesPerDay,
                'total_messages' => $totalMessages,
                'avg_response_time' => (int) round((float) ($avgResponseTime ?? 0)),
            ];
        });
    }

    public function getTicketStats(): array
    {
        return Cache::remember('admin:stats:tickets', self::CACHE_TTL, function () {
            $statusCounts = Ticket::query()
                ->select('status', DB::raw('COUNT(*) as count'))
                ->groupBy('status')
                ->get()
                ->pluck('count', 'status')
                ->toArray();

            $avgResolutionTime = Ticket::query()
                ->whereIn('status', ['resolved', 'closed'])
                ->whereNotNull('updated_at')
                ->select(DB::raw("COALESCE(AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 3600), 0) as hours"))
                ->value('hours');

            return [
                'new' => (int) ($statusCounts['new'] ?? 0),
                'open' => (int) ($statusCounts['open'] ?? 0),
                'in_progress' => (int) ($statusCounts['in_progress'] ?? 0),
                'waiting_client' => (int) ($statusCounts['waiting_client'] ?? 0),
                'resolved' => (int) ($statusCounts['resolved'] ?? 0),
                'closed' => (int) ($statusCounts['closed'] ?? 0),
                'avg_resolution_time_hours' => round((float) $avgResolutionTime, 2),
            ];
        });
    }

    public function pruneOldData(int $days = self::RETENTION_DAYS): void
    {
        $cacheKey = "admin:stats:retention:pruned:{$days}";

        if (! Cache::add($cacheKey, true, now()->addDay())) {
            return;
        }

        $cutoff = now()->subDays($days);

        PageView::query()
            ->where('created_at', '<', $cutoff)
            ->delete();

        UserActivityLog::query()
            ->where('created_at', '<', $cutoff)
            ->delete();
    }

    public function getVisitorsChart(int $days = 30): array
    {
        $since = now()->subDays($days)->startOfDay();

        return Cache::remember("admin:stats:visitors_chart:{$days}", self::CACHE_TTL, function () use ($since) {
            return PageView::query()
                ->select(DB::raw('DATE(created_at) as date'), DB::raw('COUNT(DISTINCT ip_address) as unique_visitors'))
                ->where('created_at', '>=', $since)
                ->groupBy(DB::raw('DATE(created_at)'))
                ->orderBy('date')
                ->get()
                ->map(fn ($row) => [
                    'date' => $row->date,
                    'unique_visitors' => (int) $row->unique_visitors,
                ])
                ->toArray();
        });
    }

    public function getPageViewsChart(int $days = 30): array
    {
        $since = now()->subDays($days)->startOfDay();

        return Cache::remember("admin:stats:page_views_chart:{$days}", self::CACHE_TTL, function () use ($since) {
            return PageView::query()
                ->select('path', DB::raw('COUNT(*) as views'))
                ->where('created_at', '>=', $since)
                ->groupBy('path')
                ->orderByDesc('views')
                ->limit(10)
                ->get()
                ->map(fn ($row) => [
                    'path' => $row->path,
                    'page_name' => $this->pageNameFromPath($row->path),
                    'views' => (int) $row->views,
                ])
                ->toArray();
        });
    }

    public function exportData(string $type): \Illuminate\Support\LazyCollection
    {
        return match ($type) {
            'page-views' => PageView::query()
                ->with('user:id,name,email')
                ->orderByDesc('created_at')
                ->cursor()
                ->map(fn (PageView $view) => [
                    'path' => $view->path,
                    'method' => $view->method,
                    'user' => $view->user?->name ?? 'Guest',
                    'email' => $view->user?->email ?? '',
                    'ip' => $view->ip_address,
                    'response_time' => $view->response_time,
                    'visited_at' => $view->created_at?->toIso8601String(),
                ]),
            'user-activity' => UserActivityLog::query()
                ->with('user:id,name,email')
                ->orderByDesc('created_at')
                ->cursor()
                ->map(fn (UserActivityLog $log) => [
                    'user' => $log->user?->name ?? 'Guest',
                    'email' => $log->user?->email ?? '',
                    'action' => $log->action,
                    'ip' => $log->ip_address,
                    'details' => json_encode($log->details ?? []),
                    'created_at' => $log->created_at?->toIso8601String(),
                ]),
            default => collect([]),
        };
    }

    private function pageNameFromPath(string $path): string
    {
        $path = trim($path, '/');

        if (str_starts_with($path, 'api/')) {
            $path = substr($path, 4);
        }

        $path = preg_replace('/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/?.*/', '', $path);
        $path = preg_replace('/\/\d+.*/', '', $path);

        $map = [
            '' => 'Home',
            'login' => 'Login',
            'register' => 'Register',
            'tickets' => 'Tickets',
            'tickets/create' => 'Create Ticket',
            'knowledge-base' => 'Knowledge Base',
            'knowledge-base/search' => 'Knowledge Base',
            'forum' => 'Forum',
            'forum/questions' => 'Forum',
            'documents' => 'Documents',
            'robots' => 'Robots',
            'error-codes' => 'Error Codes',
            'reviews' => 'Reviews',
            'feature-requests' => 'Features',
            'ai/chat' => 'AI Chat',
            'me' => 'Profile',
            'dashboard' => 'Dashboard',
            'notifications' => 'Notifications',
            'admin/stats' => 'Dashboard',
            'admin/users' => 'Users',
            'admin/tickets' => 'Tickets',
        ];

        return $map[$path] ?? ucwords(str_replace(['-', '_', '/'], ' ', $path));
    }

    private function parseUserAgent(?string $ua): string
    {
        if (!$ua) {
            return 'Unknown';
        }

        if (str_contains($ua, 'Chrome') && !str_contains($ua, 'Edg')) {
            return 'Chrome';
        }
        if (str_contains($ua, 'Firefox')) {
            return 'Firefox';
        }
        if (str_contains($ua, 'Safari') && !str_contains($ua, 'Chrome')) {
            return 'Safari';
        }
        if (str_contains($ua, 'Edg')) {
            return 'Edge';
        }
        if (preg_match('/Postman|curl|python|axios/i', $ua)) {
            return 'API Client';
        }

        return 'Other';
    }
}
