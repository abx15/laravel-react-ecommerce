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
        try {
            // Count users by user_type (robust check)
            $totalUsers = User::whereIn('user_type', ['user', 'User'])->count();
            $totalAdmins = User::whereIn('user_type', ['admin', 'Admin'])->count();
            $totalSellers = User::whereIn('user_type', ['seller', 'Seller'])->count();

            // Calculate total revenue (if Order model exists)
            $totalRevenue = 0;
            if (class_exists(Order::class)) {
                $totalRevenue = Order::where('status', 'delivered')
                    ->sum('total_amount');
            }

            // Mock growth percentages (you can calculate real growth later)
            $stats = [
                'total_users' => $totalUsers, // Changed key to match frontend expectation snake_case
                'total_admins' => $totalAdmins,
                'total_sellers' => $totalSellers,
                'total_revenue' => $totalRevenue,
                'user_growth' => 18.2,
                'admin_growth' => 5.4,
                'seller_growth' => 12.3,
                'revenue_growth' => -22.1
            ];

            return response()->json([
                'success' => true,
                'message' => 'Dashboard stats fetched successfully',
                'data' => [
                    'stats' => $stats,
                    'charts' => []
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching dashboard statistics',
                'error' => $e->getMessage()
            ], 500);
        }
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
        try {
            $validated = $request->validate([
                'role' => 'required|string|in:user,seller,admin',
            ]);

            $user = User::findOrFail($id);
            if ($user->isSuperAdmin()) {
                return response()->json(['success' => false, 'message' => 'Super Admin roles cannot be changed through user management.'], 403);
            }
            if ((int) $request->user()->id === (int) $user->id) {
                return response()->json(['success' => false, 'message' => 'You cannot change your own role.'], 422);
            }

            $user->user_type = $validated['role'];
            $user->save();
            $user->syncRoles($validated['role'] === 'seller' ? ['user', 'seller'] : [$validated['role']]);

            return response()->json([
                'success' => true,
                'message' => 'User role updated successfully',
                'data' => $user
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating user role',
                'error' => $e->getMessage()
            ], 500);
        }
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
