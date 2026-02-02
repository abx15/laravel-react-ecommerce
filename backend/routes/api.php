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

// Public Product Routes (no authentication required)
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{product}', [ProductController::class, 'show']);
Route::get('/categories', [CategoryController::class, 'index']);

// Protected Routes (require authentication)
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::delete('/product-images/{id}', [ProductController::class, 'deleteImage']);

    // Cart Routes (require authentication)
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart/add', [CartController::class, 'add']);
    Route::put('/cart/update', [CartController::class, 'update']);
    Route::delete('/cart/remove', [CartController::class, 'remove']);
    Route::delete('/cart/clear', [CartController::class, 'clear']);

    // Order Routes (require authentication)
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{order}', [OrderController::class, 'show']);

    // Payment Routes (require authentication)
    Route::post('/payments', [PaymentController::class, 'store']);
    Route::get('/payments/{payment}', [PaymentController::class, 'show']);

    // Seller Registration (require authentication)
    Route::post('/sellers', [SellerController::class, 'store']);
    Route::get('/sellers/my-profile', [SellerController::class, 'myProfile']);
    Route::put('/sellers/my-profile', [SellerController::class, 'update']);

    // User Dashboard Routes
    Route::middleware(['role:user'])->group(function () {
        Route::get('/dashboard', [UserDashboardController::class, 'dashboard']);
        Route::get('/user/orders', [UserDashboardController::class, 'getOrders']);
        Route::get('/user/profile', [UserDashboardController::class, 'getProfile']);
        Route::put('/user/profile', [UserDashboardController::class, 'updateProfile']);
    });

    // Seller Dashboard Routes
    Route::middleware(['role:seller'])->group(function () {
        Route::get('/seller/dashboard', [SellerDashboardController::class, 'dashboard']);
        Route::get('/seller/products', [ProductController::class, 'sellerProducts']);
        Route::post('/seller/products', [ProductController::class, 'store']);
        Route::put('/seller/products/{product}', [ProductController::class, 'update']);
        Route::delete('/seller/products/{product}', [ProductController::class, 'destroy']);
        Route::get('/seller/orders', [SellerDashboardController::class, 'getOrders']);
        Route::get('/seller/products-list', [SellerDashboardController::class, 'getProducts']);
        Route::get('/seller/analytics', [SellerDashboardController::class, 'getAnalytics']);
    });

    // Verified Seller Routes
    Route::middleware(['role:seller', 'seller.verified'])->group(function () {
        Route::get('/seller/dashboard', [SellerDashboardController::class, 'dashboard']);
        Route::get('/seller/products', [ProductController::class, 'sellerProducts']);
        Route::post('/seller/products', [ProductController::class, 'store']);
        Route::put('/seller/products/{product}', [ProductController::class, 'update']);
        Route::delete('/seller/products/{product}', [ProductController::class, 'destroy']);
        Route::get('/seller/orders', [SellerDashboardController::class, 'getOrders']);
        Route::get('/seller/products-list', [SellerDashboardController::class, 'getProducts']);
        Route::get('/seller/analytics', [SellerDashboardController::class, 'getAnalytics']);
    });

    // Admin Dashboard Routes
    Route::middleware(['role:admin'])->group(function () {
        Route::get('/admin/dashboard', [AdminDashboardController::class, 'dashboard']);
        Route::get('/admin/products-list', [AdminDashboardController::class, 'getProducts']);
        Route::get('/admin/orders-list', [AdminDashboardController::class, 'getOrders']);
        Route::get('/admin/sellers', [AdminDashboardController::class, 'getSellers']);
        Route::get('/admin/users', [AdminDashboardController::class, 'getUsers']);
        Route::get('/admin/seller-requests', [AdminDashboardController::class, 'getSellerRequests']);
        Route::get('/admin/analytics', [AdminDashboardController::class, 'getAnalytics']);

        Route::post('/admin/products', [AdminDashboardController::class, 'storeProduct']);
        Route::put('/admin/products/{product}', [AdminDashboardController::class, 'updateProduct']);
        Route::delete('/admin/products/{product}', [AdminDashboardController::class, 'deleteProduct']);
        Route::patch('/admin/sellers/{seller}/approve', [AdminDashboardController::class, 'approveSeller']);
        Route::patch('/admin/sellers/{seller}/reject', [AdminDashboardController::class, 'rejectSeller']);
        Route::patch('/admin/sellers/{user}/block', [AdminDashboardController::class, 'blockSeller']);
        Route::patch('/admin/sellers/{user}/unblock', [AdminDashboardController::class, 'unblockSeller']);
    });

    // Super Admin Dashboard Routes
    Route::middleware(['auth:sanctum', 'superadmin'])->prefix('super-admin')->group(function () {
        // Dashboard
        Route::get('/dashboard', [SuperAdminController::class, 'getDashboardStats']);

        // Get Users by Role
        Route::get('/admins', [SuperAdminController::class, 'getAllAdmins']);
        Route::get('/users', [SuperAdminController::class, 'getAllUsers']);
        Route::get('/sellers', [SuperAdminController::class, 'getAllSellers']);

        // User Management
        Route::post('/admins', [SuperAdminController::class, 'createAdmin']);
        Route::put('/users/{id}/role', [SuperAdminController::class, 'updateUserRole']);
        Route::delete('/users/{id}', [SuperAdminController::class, 'deleteUser']);
    });
});
