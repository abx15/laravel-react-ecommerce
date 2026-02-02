<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class SuperAdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if user is authenticated
        if (!Auth::check()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated. Please login first.'
            ], 401);
        }

        // Get authenticated user
        $user = Auth::user();

        // Check if user has super_admin access
        // We check both user_type column and Spatie role for robustness
        $isSuperAdmin = ($user->user_type === 'super_admin' || $user->user_type === 'superadmin');

        if (!$isSuperAdmin && method_exists($user, 'hasRole')) {
            $isSuperAdmin = $user->hasRole('super_admin') || $user->hasRole('superadmin');
        }

        if (!$isSuperAdmin) {
            return response()->json([
                'success' => false,
                'message' => 'Access Denied. Super Admin privileges required.',
                'your_role' => $user->user_type,
                'your_roles' => method_exists($user, 'getRoleNames') ? $user->getRoleNames() : []
            ], 403);
        }

        // User is Super Admin, proceed
        return $next($request);
    }
}
