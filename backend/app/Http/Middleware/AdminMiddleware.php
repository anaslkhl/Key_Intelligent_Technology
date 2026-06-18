<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    /**
     * Ensure the authenticated user is an admin.
     */
    public function handle(Request $request, Closure $next): Response|JsonResponse
    {
        if ($request->user()?->role !== 'admin') {
            return response()->json([
                'message' => 'Admin access is required.',
                'status' => 403,
            ], 403);
        }

        return $next($request);
    }
}
