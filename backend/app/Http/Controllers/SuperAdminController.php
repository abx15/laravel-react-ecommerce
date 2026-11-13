<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Order;
use App\Models\Product;
use App\Models\Seller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class SuperAdminController extends Controller
{
    /**
     * Get Dashboard Statistics
     */
    public function getDashboardStats()
    {
        $now = now();
        $currentStart = $now->copy()->subDays(30);
        $previousStart = $now->copy()->subDays(60);

        $growth = static function (float|int $current, float|int $previous): float {
            if ($previous <= 0) {
                return $current > 0 ? 100.0 : 0.0;
            }

            return round((($current - $previous) / $previous) * 100, 1);
        };

        $totalUsers = User::where('user_type', 'user')->count();
        $totalAdmins = User::where('user_type', 'admin')->count();
        $totalSellers = User::where('user_type', 'seller')->count();

        $currentRevenue = (float) Order::where('payment_status', 'paid')
            ->where('created_at', '>=', $currentStart)
            ->sum('total_amount');
        $previousRevenue = (float) Order::where('payment_status', 'paid')
            ->whereBetween('created_at', [$previousStart, $currentStart])
            ->sum('total_amount');

        $stats = [
            'total_users' => $totalUsers,
            'total_admins' => $totalAdmins,
            'total_sellers' => $totalSellers,
            'total_revenue' => (float) Order::where('payment_status', 'paid')->sum('total_amount'),
            'user_growth' => $growth(
                User::where('user_type', 'user')->where('created_at', '>=', $currentStart)->count(),
                User::where('user_type', 'user')->whereBetween('created_at', [$previousStart, $currentStart])->count()
            ),
            'admin_growth' => $growth(
                User::where('user_type', 'admin')->where('created_at', '>=', $currentStart)->count(),
                User::where('user_type', 'admin')->whereBetween('created_at', [$previousStart, $currentStart])->count()
            ),
            'seller_growth' => $growth(
                User::where('user_type', 'seller')->where('created_at', '>=', $currentStart)->count(),
                User::where('user_type', 'seller')->whereBetween('created_at', [$previousStart, $currentStart])->count()
            ),
            'revenue_growth' => $growth($currentRevenue, $previousRevenue),
        ];

        return response()->json([
            'success' => true,
            'message' => 'Platform statistics fetched successfully',
            'data' => [
                'stats' => $stats,
                'charts' => [],
            ],
        ]);
    }

    /**
     * Get All Admins
     */
    public function getAllAdmins()
    {
        try {
            $admins = User::whereIn('user_type', ['admin', 'Admin'])
                ->select('id', 'name', 'email', 'user_type', 'status', 'created_at', 'updated_at')
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($user) {
                    $user->role = $user->user_type; // Map user_type to role for frontend compatibility
                    return $user;
                });

            return response()->json([
                'success' => true,
                'message' => 'Admins fetched successfully',
                'count' => $admins->count(),
                'data' => $admins
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching admins',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get All Users
     */
    public function getAllUsers()
    {
        try {
            $users = User::whereIn('user_type', ['user', 'User'])
                ->select('id', 'name', 'email', 'user_type', 'status', 'created_at', 'updated_at')
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($user) {
                    $user->role = $user->user_type;
                    return $user;
                });

            return response()->json([
                'success' => true,
                'message' => 'Users fetched successfully',
                'count' => $users->count(),
                'data' => $users
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching users',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get All Sellers
     */
    public function getAllSellers()
    {
        try {
            $sellers = User::whereIn('user_type', ['seller', 'Seller'])
                ->select('id', 'name', 'email', 'user_type', 'status', 'created_at', 'updated_at')
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($user) {
                    $user->role = $user->user_type;
                    return $user;
                });

            return response()->json([
                'success' => true,
                'message' => 'Sellers fetched successfully',
                'count' => $sellers->count(),
                'data' => $sellers
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching sellers',
                'error' => $e->getMessage()
            ], 500);
        }
    }



    public function approveSeller($sellerId)
    {
        $seller = Seller::with('user')->findOrFail($sellerId);
        $seller->update(['status' => 'approved']);
        if ($seller->user) {
            $seller->user->update([
                'is_seller_verified' => true,
                'seller_verified_at' => now(),
            ]);
        }

        return response()->json(['success' => true, 'message' => 'Seller approved successfully']);
    }

    public function getAllOrders()
    {
        $orders = Order::with(['user', 'items.product', 'payment'])
            ->latest()
            ->paginate(25);

        return response()->json(['success' => true, 'data' => $orders]);
    }

    public function getAllProducts()
    {
        $products = Product::with(['category', 'seller', 'images'])
            ->latest()
            ->paginate(25);

        return response()->json(['success' => true, 'data' => $products]);
    }

    /**
     * Create New Admin
     */
    public function createAdmin(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:12',
        ]);

        $admin = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'user_type' => 'admin', // Using user_type
                'status' => 'active'
            ]);

            $admin->assignRole('admin');

            return response()->json([
                'success' => true,
                'message' => 'Admin created successfully',
                'data' => $admin
            ], 201);
    }


    /**
     * Update an administrator account.
     */
    public function updateAdmin(Request $request, $id)
    {
        $admin = User::where('user_type', 'admin')->findOrFail($id);
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|max:255|unique:users,email,' . $admin->id,
            'password' => 'sometimes|nullable|string|min:8',
            'status' => 'sometimes|required|in:active,inactive',
        ]);

        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $admin->fill($validated);
        $admin->save();

        return response()->json([
            'success' => true,
            'message' => 'Administrator updated successfully',
            'data' => $admin->only(['id', 'name', 'email', 'user_type', 'status', 'updated_at']),
        ]);
    }

    /**
     * Delete an administrator account.
     */
    public function deleteAdmin(Request $request, $id)
    {
        $admin = User::where('user_type', 'admin')->findOrFail($id);
        if ((int) $request->user()->id === (int) $admin->id) {
            return response()->json(['success' => false, 'message' => 'You cannot delete your own active administrator account.'], 422);
        }
        $admin->delete();

        return response()->json([
            'success' => true,
            'message' => 'Administrator deleted successfully',
        ]);
    }

    /**
     * Update User Role
     */
    public function updateUserRole(Request $request, $id)
    {
        $validated = $request->validate([
            'role' => 'required|string|in:user,admin',
        ]);

        $user = User::findOrFail($id);

        if ($user->isSuperAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Super Admin roles cannot be changed through user management.',
            ], 403);
        }

        if ((int) $request->user()->id === (int) $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot change your own role.',
            ], 422);
        }

        $user->user_type = $validated['role'];
        $user->save();
        $user->syncRoles($validated['role'] === 'seller' ? ['user', 'seller'] : [$validated['role']]);

        return response()->json([
            'success' => true,
            'message' => 'User role updated successfully',
            'data' => $user->fresh()->load('roles'),
        ]);
    }

    /**
     * Delete User
     */
    public function deleteUser($id)
    {
        try {
            $user = User::findOrFail($id);

            // Prevent deleting super admin
            if ($user->isSuperAdmin()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete Super Admin account'
                ], 403);
            }

            if ((int) request()->user()->id === (int) $user->id) {
                return response()->json(['success' => false, 'message' => 'You cannot delete your own account.'], 422);
            }

            $user->delete();

            return response()->json([
                'success' => true,
                'message' => 'User deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting user',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
