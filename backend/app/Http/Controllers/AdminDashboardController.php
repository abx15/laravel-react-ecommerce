<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Order;
use App\Models\Product;
use App\Models\Category;
use App\Models\Seller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\Traits\ApiResponse;

class AdminDashboardController extends Controller
{
    use AuthorizesRequests, ApiResponse;

    public function dashboard(Request $request)
    {
        $this->authorize('access-admin-dashboard', $request->user());

        try {
            $stats = [
                'total_users' => User::where('user_type', 'user')->count(),
                'total_sellers' => User::where('user_type', 'seller')->count(),
                'verified_sellers' => User::where('user_type', 'seller')->where('is_seller_verified', true)->count(),
                'pending_sellers' => Seller::where('status', 'pending')->count(),
                'total_products' => Product::count(),
                'total_orders' => Order::count(),
                'revenue' => Order::where('status', 'completed')->sum('total') ?? 0,
            ];

            // Daily/Weekly Orders
            $dailyOrders = Order::where('created_at', '>=', Carbon::now()->subDays(7))
                ->selectRaw('DATE(created_at) as date, COUNT(*) as orders')
                ->groupBy('date')
                ->orderBy('date')
                ->get();

            // Revenue Trend (Last 30 days)
            $revenueTrend = Order::where('status', 'completed')
                ->where('created_at', '>=', Carbon::now()->subDays(30))
                ->selectRaw('DATE(created_at) as date, SUM(total) as revenue')
                ->groupBy('date')
                ->orderBy('date')
                ->get();

            // Seller Activity
            $sellerActivity = Seller::with('user')
                ->orderBy('created_at', 'desc')
                ->take(10)
                ->get();

            return $this->success([
                'stats' => $stats,
                'charts' => [
                    'daily_orders' => $dailyOrders,
                    'revenue_trend' => $revenueTrend,
                    'seller_activity' => $sellerActivity,
                ]
            ]);
        } catch (\Exception $e) {
            // Return fallback data if there's an error
            return $this->success([
                'stats' => [
                    'total_users' => 0,
                    'total_sellers' => 0,
                    'verified_sellers' => 0,
                    'pending_sellers' => 0,
                    'total_products' => 0,
                    'total_orders' => 0,
                    'revenue' => 0,
                ],
                'charts' => [
                    'daily_orders' => [],
                    'revenue_trend' => [],
                    'seller_activity' => [],
                ]
            ]);
        }
    }

    public function getSellers(Request $request)
    {
        $this->authorize('manage-sellers', $request->user());

        $sellers = Seller::with('user')->get();
        return $this->success($sellers);
    }

    public function getSellerRequests(Request $request)
    {
        $this->authorize('manage-sellers', $request->user());

        $sellers = Seller::with('user')
            ->where('status', 'pending')
            ->get();

        return $this->success($sellers);
    }

    public function approveSeller(Request $request, Seller $seller)
    {
        $this->authorize('verify', $seller);

        $seller->update(['status' => 'approved']);
        $seller->user->update([
            'is_seller_verified' => true,
            'seller_verified_at' => now(),
        ]);

        return $this->success($seller->load('user'), 'Seller approved successfully');
    }

    public function rejectSeller(Request $request, Seller $seller)
    {
        $this->authorize('verify', $seller);

        $validated = $request->validate([
            'rejection_reason' => 'required|string',
        ]);

        $seller->update([
            'status' => 'rejected',
        ]);
        
        $seller->user->update([
            'is_seller_verified' => false,
            'seller_verified_at' => null,
        ]);

        return $this->success($seller->load('user'), 'Seller rejected');
    }

    public function blockSeller(Request $request, User $user)
    {
        $this->authorize('manage-sellers', $request->user());

        if (!$user->isSeller()) {
            return $this->error('User is not a seller', 400);
        }

        $user->update(['is_blocked' => true]);
        return $this->success([], 'Seller blocked successfully');
    }

    public function unblockSeller(Request $request, User $user)
    {
        $this->authorize('manage-sellers', $request->user());

        if (!$user->isSeller()) {
            return $this->error('User is not a seller', 400);
        }

        $user->update(['is_blocked' => false]);
        return $this->success([], 'Seller unblocked successfully');
    }

    public function getProducts(Request $request)
    {
        $this->authorize('access-admin-dashboard', $request->user());

        $products = Product::with(['category', 'seller'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return $this->success($products);
    }

    public function getOrders(Request $request)
    {
        $this->authorize('access-admin-dashboard', $request->user());

        $orders = Order::with(['user', 'items.product'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return $this->success($orders);
    }

    public function getAnalytics(Request $request)
    {
        $this->authorize('access-admin-dashboard', $request->user());

        // Top selling products
        $topProducts = DB::table('order_items')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->select('products.name', DB::raw('SUM(order_items.quantity) as total_sold'))
            ->groupBy('products.id', 'products.name')
            ->orderBy('total_sold', 'desc')
            ->limit(10)
            ->get();

        // Seller performance
        $sellerPerformance = User::where('user_type', 'seller')
            ->where('is_seller_verified', true)
            ->withCount(['products', 'orders' => function($query) {
                $query->where('status', 'completed');
            }])
            ->withSum(['orders' => function($query) {
                $query->where('status', 'completed');
            }], 'total')
            ->orderBy('orders_sum_total', 'desc')
            ->limit(10)
            ->get();

        return $this->success([
            'top_products' => $topProducts,
            'seller_performance' => $sellerPerformance,
        ]);
    }
}
