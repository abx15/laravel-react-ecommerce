<?php

namespace App\Http\Controllers;

use App\Models\Address;
use App\Models\Order;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class UserDashboardController extends Controller
{
    use ApiResponse;

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
                ->where('payment_status', 'paid')
                ->sum('total_amount'),
        ];

        return $this->success([
            'stats' => $stats,
            'user' => $user->load('roles'),
        ]);
    }

    public function getOrders(Request $request)
    {
        $orders = Order::where('user_id', $request->user()->id)
            ->with(['items.product.images', 'address', 'payment'])
            ->latest()
            ->paginate(20);

        return $this->success($orders);
    }

    public function getOrder(Request $request, $orderId)
    {
        $order = Order::where('user_id', $request->user()->id)
            ->with(['items.product.images', 'address', 'payment'])
            ->findOrFail($orderId);

        return $this->success($order);
    }

    public function getProfile(Request $request)
    {
        $user = $request->user();

        return $this->success([
            'user' => $user->load('roles'),
            'addresses' => Address::where('user_id', $user->id)->latest()->get(),
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
        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'mobile' => $validated['phone'] ?? null,
        ]);

        return $this->success($user->fresh()->load('roles'), 'Profile updated successfully');
    }
}
