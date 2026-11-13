<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, string $role)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }

        if ($user->is_blocked || $user->status !== 'active') {
            return response()->json(['success' => false, 'message' => 'This account is inactive or blocked.'], 403);
        }

        $allowed = match ($role) {
            'user' => $user->isUser(),
            'seller' => $user->isSeller(),
            'admin' => $user->isAdmin() || $user->isSuperAdmin(),
            'super_admin', 'superadmin' => $user->isSuperAdmin(),
            default => $user->hasRole($role),
        };

        if (!$allowed) {
            return response()->json([
                'success' => false,
                'message' => 'Forbidden: insufficient role permissions.',
            ], 403);
        }

        return $next($request);
    }
}
