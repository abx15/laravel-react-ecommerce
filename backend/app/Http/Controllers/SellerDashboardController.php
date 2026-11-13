<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SellerDashboardController extends Controller
{
    public function dashboard(Request $request)
    {
        $seller = $request->user();
        
        $stats = [
            'my_products_count' => Product::where('seller_id', $seller->id)->count(),
            'my_orders' => Order::whereHas('orderItems.product', function($query) use ($seller) {
                $query->where('seller_id', $seller->id);
            })->count(),
            'my_revenue' => DB::table('order_items')
                ->join('orders', 'orders.id', '=', 'order_items.order_id')
                ->join('products', 'products.id', '=', 'order_items.product_id')
                ->where('products.seller_id', $seller->id)
                ->where('orders.payment_status', 'paid')
                ->sum(DB::raw('order_items.price * order_items.quantity')),
        ];

        // Order Status Breakdown
        $orderStatusBreakdown = Order::whereHas('orderItems.product', function($query) use ($seller) {
                $query->where('seller_id', $seller->id);
            })
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->get();

        // Sales Over Time (Last 30 days)
        $salesOverTime = Order::whereHas('orderItems.product', function($query) use ($seller) {
                $query->where('seller_id', $seller->id);
            })
            ->where('created_at', '>=', Carbon::now()->subDays(30))
            ->selectRaw('DATE(orders.created_at) as date, COUNT(DISTINCT orders.id) as sales, SUM(order_items.price * order_items.quantity) as revenue')
            ->join('order_items', 'orders.id', '=', 'order_items.order_id')
            ->join('products', 'products.id', '=', 'order_items.product_id')
            ->where('products.seller_id', $seller->id)
            ->where('orders.payment_status', 'paid')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Top Selling Products
        $topSellingProducts = Product::where('seller_id', $seller->id)
            ->withCount('orderItems')
            ->orderBy('order_items_count', 'desc')
            ->take(5)
            ->get();

        return response()->json([
            'stats' => $stats,
            'charts' => [
                'order_status_breakdown' => $orderStatusBreakdown,
                'sales_over_time' => $salesOverTime,
                'top_selling_products' => $topSellingProducts,
            ]
        ]);
    }

    public function getOrders(Request $request)
    {
        $seller = $request->user();
        
        $orders = Order::whereHas('orderItems.product', function($query) use ($seller) {
                $query->where('seller_id', $seller->id);
            })
            ->with(['user', 'orderItems.product' => function($query) use ($seller) {
                $query->where('seller_id', $seller->id);
            }])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($orders);
    }

    public function getProducts(Request $request)
    {
        $seller = $request->user();
        
        $products = Product::where('seller_id', $seller->id)
            ->with(['category', 'images'])
            ->withCount('orderItems')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($products);
    }

    public function updateOrderStatus(Request $request, $orderId)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,processing,shipped,delivered,cancelled',
        ]);

        $seller = $request->user();
        
        $order = Order::whereHas('orderItems.product', function($query) use ($seller) {
                $query->where('seller_id', $seller->id);
            })
            ->findOrFail($orderId);

        $order->update(['status' => $validated['status']]);

        return response()->json(['message' => 'Order status updated successfully']);
    }
}
