<?php

namespace App\Http\Middleware;

use App\Models\PageView;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TrackPageViews
{
    private const EXCLUDED_PATHS = [
        'api/*',
        '_debugbar/*',
        'telescope/*',
        'horizon/*',
        'livewire/*',
        'up',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        if ($this->shouldSkip($request)) {
            return $next($request);
        }

        $start = microtime(true);

        $response = $next($request);

        $duration = (int) ((microtime(true) - $start) * 1000);

        PageView::query()->create([
            'user_id' => $request->user()?->id,
            'path' => $request->path(),
            'method' => $request->method(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'session_id' => $request->session()?->getId(),
            'referer' => $request->header('referer'),
            'response_time' => $duration,
            'status_code' => $response->getStatusCode(),
            'created_at' => now(),
        ]);

        return $response;
    }

    private function shouldSkip(Request $request): bool
    {
        $path = $request->path();

        foreach (self::EXCLUDED_PATHS as $pattern) {
            if ($pattern === $path) {
                return true;
            }
            if (str_ends_with($pattern, '/*') && str_starts_with($path, rtrim($pattern, '/*'))) {
                return true;
            }
        }

        if ($request->isMethod('GET') === false) {
            return false;
        }

        return false;
    }
}
