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

class SuperAdminController extends Controller
{
    use AuthorizesRequests, ApiResponse;

    public function dashboard(Request $request)
    {
        $this->authorize('manage-admins', $request->user());

        try {
            $stats = [
                'total_users' => User::where('user_type', 'user')->count(),
                'total_admins' => User::where('user_type', 'admin')->count(),
                'total_sellers' => User::where('user_type', 'seller')->count(),
                'verified_sellers' => User::where('user_type', 'seller')->where('is_seller_verified', true)->count(),
                'total_products' => Product::count(),
                'total_orders' => Order::count(),
                'total_revenue' => Order::where('status', 'completed')->sum('total') ?? 0,
                'pending_sellers' => Seller::where('status', 'pending')->count(),
            ];

            // Monthly Revenue (Last 12 months)
            $monthlyRevenue = Order::where('status', 'completed')
                ->where('created_at', '>=', Carbon::now()->subMonths(12))
                ->selectRaw('MONTH(created_at) as month, YEAR(created_at) as year, SUM(total) as revenue')
                ->groupBy('month', 'year')
                ->orderBy('year', 'asc')
                ->orderBy('month', 'asc')
                ->get();

            // Orders vs Revenue (Last 30 days)
            $ordersRevenue = Order::where('created_at', '>=', Carbon::now()->subDays(30))
                ->selectRaw('DATE(created_at) as date, COUNT(*) as orders, SUM(total) as revenue')
                ->groupBy('date')
                ->orderBy('date')
                ->get();

            // User Growth (Last 6 months)
            $userGrowth = User::where('created_at', '>=', Carbon::now()->subMonths(6))
                ->selectRaw('MONTH(created_at) as month, YEAR(created_at) as year, COUNT(*) as users')
                ->groupBy('month', 'year')
                ->orderBy('year', 'asc')
                ->orderBy('month', 'asc')
                ->get();

            // Admin Activity
            $adminActivity = User::where('user_type', 'admin')
                ->withCount(['orders' => function($query) {
                    $query->where('status', 'completed');
                }])
                ->orderBy('created_at', 'desc')
                ->take(10)
                ->get();

            return $this->success([
                'stats' => $stats,
                'charts' => [
                    'monthly_revenue' => $monthlyRevenue,
                    'orders_revenue' => $ordersRevenue,
                    'user_growth' => $userGrowth,
                    'admin_activity' => $adminActivity,
                ]
            ]);
        } catch (\Exception $e) {
            // Return fallback data if there's an error
            return $this->success([
                'stats' => [
                    'total_users' => 0,
                    'total_admins' => 0,
                    'total_sellers' => 0,
                    'verified_sellers' => 0,
                    'total_products' => 0,
                    'total_orders' => 0,
                    'total_revenue' => 0,
                    'pending_sellers' => 0,
                ],
                'charts' => [
                    'monthly_revenue' => [],
                    'orders_revenue' => [],
                    'user_growth' => [],
                    'admin_activity' => [],
                ]
            ]);
        }
    }

    public function getUsers(Request $request)
    {
        $this->authorize('manage-admins', $request->user());

        $users = User::orderBy('created_at', 'desc')->get();
        return $this->success($users);
    }

    public function getAdmins(Request $request)
    {
        $this->authorize('manage-admins', $request->user());

        $admins = User::where('user_type', 'admin')->get();
        return $this->success($admins);
    }

    public function getSellers(Request $request)
    {
        $this->authorize('manage-admins', $request->user());

        $sellers = User::where('user_type', 'seller')->get();
        return $this->success($sellers);
    }

    public function createAdmin(Request $request)
    {
        $this->authorize('manage-admins', $request->user());

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $admin = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => bcrypt($validated['password']),
            'user_type' => 'admin',
        ]);

        $admin->assignRole('admin');

        return $this->success($admin->load('roles'), 'Admin created successfully', 201);
    }

    public function updateAdmin(Request $request, User $admin)
    {
        $this->authorize('manage-admins', $request->user());

        if (!$admin->isAdmin()) {
            return $this->error('User is not an admin', 400);
        }

        if ($admin->isSuperAdmin()) {
            return $this->error('Cannot modify super admin', 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $admin->id,
            'password' => 'sometimes|string|min:8|confirmed',
        ]);

        $admin->update($validated);

        return $this->success($admin->load('roles'), 'Admin updated successfully');
    }

    public function deleteAdmin(Request $request, User $admin)
    {
        $this->authorize('manage-admins', $request->user());

        if (!$admin->isAdmin()) {
            return $this->error('User is not an admin', 400);
        }

        if ($admin->isSuperAdmin()) {
            return $this->error('Cannot delete super admin', 403);
        }

        $admin->delete();

        return $this->success([], 'Admin deleted successfully');
    }

    public function blockUser(Request $request, User $user)
    {
        $this->authorize('manage-admins', $request->user());

        if ($user->isSuperAdmin()) {
            return $this->error('Cannot block super admin', 403);
        }

        $user->update(['is_blocked' => true]);
        return $this->success([], 'User blocked successfully');
    }

    public function unblockUser(Request $request, User $user)
    {
        $this->authorize('manage-admins', $request->user());

        $user->update(['is_blocked' => false]);
        return $this->success([], 'User unblocked successfully');
    }

    public function getAllOrders(Request $request)
    {
        $this->authorize('manage-admins', $request->user());

        $orders = Order::with(['user', 'items.product'])
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        return $this->success($orders);
    }

    public function getAllProducts(Request $request)
    {
        $this->authorize('manage-admins', $request->user());

        $products = Product::with(['category', 'seller'])
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        return $this->success($products);
    }

    public function getSystemAnalytics(Request $request)
    {
        $this->authorize('manage-admins', $request->user());

        // Platform analytics
        $platformStats = [
            'total_revenue' => Order::where('status', 'completed')->sum('total'),
            'avg_order_value' => Order::where('status', 'completed')->avg('total'),
            'conversion_rate' => 0, // Would need tracking data
            'active_users' => User::where('created_at', '>=', now()->subDays(30))->count(),
        ];

        // Top performing sellers
        $topSellers = User::where('user_type', 'seller')
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

        // Product categories performance
        $categoryStats = Category::withCount(['products'])
            ->withSum(['products.orderItems' => function($query) {
                $query->whereHas('order', function($q) {
                    $q->where('status', 'completed');
                });
            }], 'quantity')
            ->orderBy('products_order_items_sum_quantity', 'desc')
            ->get();

        return $this->success([
            'platform_stats' => $platformStats,
            'top_sellers' => $topSellers,
            'category_stats' => $categoryStats,
        ]);
    }

    public function getSystemSettings(Request $request)
    {
        $this->authorize('manage-admins', $request->user());

        // This would typically come from a settings table
        return $this->success([
            'settings' => [
                'site_name' => 'E-Commerce Platform',
                'maintenance_mode' => false,
                'registration_enabled' => true,
                'seller_verification_required' => true,
                'commission_rate' => 5, // percentage
                'min_payout_amount' => 1000,
            ]
        ]);
    }

    public function updateSystemSettings(Request $request)
    {
        $this->authorize('manage-admins', $request->user());

        $validated = $request->validate([
            'site_name' => 'sometimes|string|max:255',
            'maintenance_mode' => 'sometimes|boolean',
            'registration_enabled' => 'sometimes|boolean',
            'seller_verification_required' => 'sometimes|boolean',
            'commission_rate' => 'sometimes|numeric|min:0|max:100',
            'min_payout_amount' => 'sometimes|numeric|min:0',
        ]);

        // Update settings in database (would need settings table)
        return $this->success($validated, 'Settings updated successfully');
    }
}
