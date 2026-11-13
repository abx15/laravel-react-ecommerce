<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class SellerVerifiedMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        if (!$user || !$user->isSeller()) {
            return response()->json(['success' => false, 'message' => 'Seller role required.'], 403);
        }

        if ($user->is_blocked || $user->status !== 'active') {
            return response()->json(['success' => false, 'message' => 'Seller account is inactive or blocked.'], 403);
        }

        if (!$user->is_seller_verified) {
            return response()->json(['success' => false, 'message' => 'Seller account is awaiting approval.'], 403);
        }

        return $next($request);
    }
}
