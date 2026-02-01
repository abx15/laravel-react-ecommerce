<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Order;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AdminDashboardController extends Controller
{
    public function dashboard()
    {
        $stats = [
            'total_orders' => Order::count(),
            'revenue' => Order::where('status', 'delivered')
                ->whereHas('user', function($query) {
                    $query->where('is_verified', true);
                })
                ->sum('total_amount'),
            'total_products' => Product::count(),
            'pending_sellers' => User::role('seller')->where('is_verified', false)->count(),
        ];

        // Daily/Weekly Orders
        $dailyOrders = Order::where('created_at', '>=', Carbon::now()->subDays(7))
            ->selectRaw('DATE(created_at) as date, COUNT(*) as orders')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Revenue Trend (Last 30 days)
        $revenueTrend = Order::where('status', 'delivered')
            ->where('created_at', '>=', Carbon::now()->subDays(30))
            ->selectRaw('DATE(created_at) as date, SUM(total_amount) as revenue')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Product Performance
        $productPerformance = Product::withCount('orderItems')
            ->with('category')
            ->orderBy('order_items_count', 'desc')
            ->take(10)
            ->get();

        return response()->json([
            'stats' => $stats,
            'charts' => [
                'daily_orders' => $dailyOrders,
                'revenue_trend' => $revenueTrend,
                'product_performance' => $productPerformance,
            ]
        ]);
    }

    public function getSellerRequests()
    {
        $sellers = User::role('seller')
            ->where('is_verified', false)
            ->get(['id', 'name', 'email', 'created_at']);

        return response()->json($sellers);
    }

    public function approveSeller($id)
    {
        $seller = User::findOrFail($id);
        
        if (!$seller->hasRole('seller')) {
            return response()->json(['message' => 'User is not a seller'], 400);
        }

        $seller->update(['is_verified' => true]);

        return response()->json(['message' => 'Seller approved successfully']);
    }

    public function rejectSeller($id)
    {
        $seller = User::findOrFail($id);
        
        if (!$seller->hasRole('seller')) {
            return response()->json(['message' => 'User is not a seller'], 400);
        }

        $seller->update(['is_verified' => false]);

        return response()->json(['message' => 'Seller rejected']);
    }

    public function getOrders()
    {
        $orders = Order::with(['user', 'orderItems.product'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($orders);
    }

    public function getProducts()
    {
        $products = Product::with('category')
            ->withCount('orderItems')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($products);
    }

    public function getCategories()
    {
        $categories = Category::withCount('products')
            ->orderBy('name')
            ->get();

        return response()->json($categories);
    }
}
