<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\SellerController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\SuperAdminController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\SellerDashboardController;
use App\Http\Controllers\UserDashboardController;

// Public Routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{product}', [ProductController::class, 'show']);
Route::get('/categories', [CategoryController::class, 'index']);

// Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Cart
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart/add', [CartController::class, 'store']);
    Route::put('/cart/{cartItem}', [CartController::class, 'update']);
    Route::delete('/cart/{cartItem}', [CartController::class, 'destroy']);

    // Orders
    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/{order}', [OrderController::class, 'show']);

    // Payments
    Route::post('/payment/create-order', [PaymentController::class, 'createRazorpayOrder']);
    Route::post('/payment/verify', [PaymentController::class, 'verifyPayment']);

    // Admin Routes
    Route::middleware(['role:admin|super_admin'])->group(function () {
        Route::apiResource('admin/products', ProductController::class)->except(['index', 'show']);
        Route::apiResource('admin/categories', CategoryController::class)->except(['index']);
        Route::get('admin/orders', [OrderController::class, 'adminIndex']);
        Route::patch('admin/orders/{order}/status', [OrderController::class, 'updateStatus']);
        Route::get('admin/sellers', [AdminController::class, 'getSellers']);
        Route::patch('admin/sellers/{id}/approve', [AdminController::class, 'approveSeller']);
        Route::patch('admin/sellers/{id}/reject', [AdminController::class, 'rejectSeller']);
    });

    // Seller Routes
    Route::post('/seller/register', [SellerController::class, 'store']);
    Route::middleware(['role:seller'])->group(function () {
        Route::get('/seller/products', [ProductController::class, 'sellerProducts']);
        Route::post('/seller/products', [ProductController::class, 'store']);
        Route::put('/seller/products/{product}', [ProductController::class, 'update']);
        Route::delete('/seller/products/{product}', [ProductController::class, 'destroy']);
        
        // Seller Dashboard Routes
        Route::get('/seller/dashboard', [SellerDashboardController::class, 'dashboard']);
        Route::get('/seller/orders', [SellerDashboardController::class, 'getOrders']);
        Route::get('/seller/products-list', [SellerDashboardController::class, 'getProducts']);
        Route::patch('/seller/orders/{order}/status', [SellerDashboardController::class, 'updateOrderStatus']);
    });

    // User Dashboard Routes
    Route::middleware(['role:user'])->group(function () {
        Route::get('/user/dashboard', [UserDashboardController::class, 'dashboard']);
        Route::get('/user/orders', [UserDashboardController::class, 'getOrders']);
        Route::get('/user/orders/{order}', [UserDashboardController::class, 'getOrder']);
        Route::get('/user/profile', [UserDashboardController::class, 'getProfile']);
        Route::put('/user/profile', [UserDashboardController::class, 'updateProfile']);
    });

    // Admin Dashboard Routes
    Route::middleware(['role:admin'])->group(function () {
        Route::get('/admin/dashboard', [AdminDashboardController::class, 'dashboard']);
        Route::get('/admin/seller-requests', [AdminDashboardController::class, 'getSellerRequests']);
        Route::get('/admin/orders-list', [AdminDashboardController::class, 'getOrders']);
        Route::get('/admin/products-list', [AdminDashboardController::class, 'getProducts']);
        Route::get('/admin/categories-list', [AdminDashboardController::class, 'getCategories']);
        Route::patch('/admin/sellers/{id}/approve', [AdminDashboardController::class, 'approveSeller']);
        Route::patch('/admin/sellers/{id}/reject', [AdminDashboardController::class, 'rejectSeller']);
    });

    // Super Admin Dashboard Routes
    Route::middleware(['role:super_admin'])->group(function () {
        Route::get('/super-admin/dashboard', [SuperAdminController::class, 'dashboard']);
        Route::get('/super-admin/users', [SuperAdminController::class, 'getUsers']);
        Route::get('/super-admin/admins', [SuperAdminController::class, 'getAdmins']);
        Route::get('/super-admin/sellers', [SuperAdminController::class, 'getSellers']);
        Route::get('/super-admin/all-orders', [SuperAdminController::class, 'getAllOrders']);
        Route::get('/super-admin/system-settings', [SuperAdminController::class, 'getSystemSettings']);
        
        Route::post('/super-admin/admins', [SuperAdminController::class, 'createAdmin']);
        Route::patch('/super-admin/sellers/{id}/approve', [SuperAdminController::class, 'approveSeller']);
        Route::patch('/super-admin/sellers/{id}/reject', [SuperAdminController::class, 'rejectSeller']);
        Route::patch('/super-admin/users/{id}/block', [SuperAdminController::class, 'blockUser']);
        Route::patch('/super-admin/users/{id}/unblock', [SuperAdminController::class, 'unblockUser']);
        Route::delete('/super-admin/admins/{id}', [SuperAdminController::class, 'deleteAdmin']);
    });
});
