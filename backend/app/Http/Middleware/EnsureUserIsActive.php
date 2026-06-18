<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsActive
{
    public function handle(Request $request, Closure $next): Response|JsonResponse
    {
        if ($request->user() && !$request->user()->is_active) {
            return response()->json([
                'message' => 'Your account has been deactivated.',
                'errors' => (object) [],
                'status' => 403
            ], 403);
        }

        return $next($request);
    }
}
