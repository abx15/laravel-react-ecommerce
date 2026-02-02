<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SellerVerifiedMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user || !$user->isSeller()) {
            return response()->json(['message' => 'Access denied. Seller role required.'], 403);
        }

        if (!$user->is_seller_verified) {
            return response()->json(['message' => 'Seller account not verified. Please wait for admin approval.'], 403);
        }

        return $next($request);
    }
}
