<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;

class UserDashboardController extends Controller
{
    public function dashboard(Request $request)
    {
        $user = $request->user();
        
        $stats = [
            'total_orders' => Order::where('user_id', $user->id)->count(),
            'pending_orders' => Order::where('user_id', $user->id)
                ->whereIn('status', ['pending', 'processing', 'shipped'])
                ->count(),
            'completed_orders' => Order::where('user_id', $user->id)
                ->where('status', 'delivered')
                ->count(),
            'total_spent' => Order::where('user_id', $user->id)
                ->where('status', 'delivered')
                ->sum('total_amount'),
        ];

        return response()->json([
            'stats' => $stats,
            'user' => $user
        ]);
    }

    public function getOrders(Request $request)
    {
        $user = $request->user();
        
        $orders = Order::where('user_id', $user->id)
            ->with(['orderItems.product', 'orderItems.product.category'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($orders);
    }

    public function getOrder(Request $request, $orderId)
    {
        $user = $request->user();
        
        $order = Order::where('user_id', $user->id)
            ->with(['user', 'orderItems.product', 'orderItems.product.category'])
            ->findOrFail($orderId);

        return response()->json($order);
    }

    public function getProfile(Request $request)
    {
        $user = $request->user();
        
        return response()->json([
            'user' => $user,
            'addresses' => [] // This would come from an addresses table
        ]);
    }

    public function updateProfile(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $request->user()->id,
            'phone' => 'nullable|string|max:20',
        ]);

        $user = $request->user();
        $user->update($validated);

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user
        ]);
    }
}
