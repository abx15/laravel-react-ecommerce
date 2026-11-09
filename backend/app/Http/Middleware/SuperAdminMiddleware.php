<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class SuperAdminMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated. Please login first.',
            ], 401);
        }

        if ($user->is_blocked || $user->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'This account is inactive or blocked.',
            ], 403);
        }

        if (!$user->isSuperAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. Super Admin privileges required.',
            ], 403);
        }

        return $next($request);
    }
}
