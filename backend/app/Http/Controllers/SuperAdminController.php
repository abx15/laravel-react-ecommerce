<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Order;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SuperAdminController extends Controller
{
    public function dashboard()
    {
        $stats = [
            'total_users' => User::count(),
            'total_admins' => User::role('admin')->count(),
            'total_sellers' => User::role('seller')->count(),
            'total_orders' => Order::count(),
            'total_revenue' => Order::where('status', 'delivered')->sum('total_amount'),
            'pending_sellers' => User::role('seller')->where('is_verified', false)->count(),
        ];

        // Monthly Revenue (Last 12 months)
        $monthlyRevenue = Order::where('status', 'delivered')
            ->where('created_at', '>=', Carbon::now()->subMonths(12))
            ->selectRaw('MONTH(created_at) as month, YEAR(created_at) as year, SUM(total_amount) as revenue')
            ->groupBy('month', 'year')
            ->orderBy('year', 'asc')
            ->orderBy('month', 'asc')
            ->get();

        // Orders vs Revenue (Last 30 days)
        $ordersRevenue = Order::where('created_at', '>=', Carbon::now()->subDays(30))
            ->selectRaw('DATE(created_at) as date, COUNT(*) as orders, SUM(total_amount) as revenue')
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

        // Seller Performance
        $sellerPerformance = User::role('seller')
            ->with(['products' => function($query) {
                $query->withCount('orderItems');
            }])
            ->get()
            ->map(function($seller) {
                return [
                    'name' => $seller->name,
                    'email' => $seller->email,
                    'products_count' => $seller->products->count(),
                    'total_sales' => $seller->products->sum('order_items_count'),
                    'verified' => $seller->is_verified ?? false,
                ];
            })
            ->sortByDesc('total_sales')
            ->take(10);

        return response()->json([
            'stats' => $stats,
            'charts' => [
                'monthly_revenue' => $monthlyRevenue,
                'orders_revenue' => $ordersRevenue,
                'user_growth' => $userGrowth,
                'seller_performance' => $sellerPerformance,
            ]
        ]);
    }

    public function getUsers()
    {
        $users = User::with('roles')->get();
        return response()->json($users);
    }

    public function getAdmins()
    {
        $admins = User::role('admin')->with('roles')->get();
        return response()->json($admins);
    }

    public function getSellers()
    {
        $sellers = User::role('seller')->with('roles')->get();
        return response()->json($sellers);
    }

    public function createAdmin(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $admin = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => bcrypt($validated['password']),
        ]);

        $admin->assignRole('admin');

        return response()->json([
            'message' => 'Admin created successfully',
            'admin' => $admin->load('roles')
        ], 201);
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

    public function blockUser($id)
    {
        $user = User::findOrFail($id);
        $user->update(['is_blocked' => true]);

        return response()->json(['message' => 'User blocked successfully']);
    }

    public function unblockUser($id)
    {
        $user = User::findOrFail($id);
        $user->update(['is_blocked' => false]);

        return response()->json(['message' => 'User unblocked successfully']);
    }

    public function deleteAdmin($id)
    {
        $admin = User::findOrFail($id);
        
        if (!$admin->hasRole('admin')) {
            return response()->json(['message' => 'User is not an admin'], 400);
        }

        if ($admin->hasRole('super_admin')) {
            return response()->json(['message' => 'Cannot delete super admin'], 403);
        }

        $admin->delete();

        return response()->json(['message' => 'Admin deleted successfully']);
    }

    public function getAllOrders()
    {
        $orders = Order::with(['user', 'orderItems.product'])
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        return response()->json($orders);
    }

    public function getSystemSettings()
    {
        // This would typically come from a settings table
        return response()->json([
            'settings' => [
                'site_name' => 'E-Commerce Platform',
                'maintenance_mode' => false,
                'registration_enabled' => true,
                'seller_verification_required' => true,
            ]
        ]);
    }
}
