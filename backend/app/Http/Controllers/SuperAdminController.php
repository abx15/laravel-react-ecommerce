<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

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

    /**
     * Create New Admin
     */
    public function createAdmin(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:8'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $admin = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'user_type' => 'admin', // Using user_type
                'status' => 'active'
            ]);

            // Assign Spatie role if available
            if (method_exists($admin, 'assignRole')) {
                try {
                    $admin->assignRole('admin');
                } catch (\Exception $e) {
                    // Ignore if role doesn't exist
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Admin created successfully',
                'data' => $admin
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error creating admin',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update User Role
     */
    public function updateUserRole(Request $request, $id)
    {
        try {
            $validator = Validator::make($request->all(), [
                'role' => 'required|string|in:user,admin,seller,super_admin'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = User::findOrFail($id);
            $user->user_type = $request->role; // Update user_type
            $user->save();

            // Sync Spatie roles if available
            if (method_exists($user, 'syncRoles')) {
                try {
                    $user->syncRoles([$request->role]);
                } catch (\Exception $e) {
                    // Ignore
                }
            }

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
            if ($user->user_type === 'super_admin' || $user->user_type === 'superadmin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete Super Admin account'
                ], 403);
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
