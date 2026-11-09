<?php

namespace App\Http\Controllers;

use App\Models\Address;
use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Razorpay\Api\Api;

class OrderController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $orders = Order::where('user_id', $request->user()->id)
            ->with(['items.product.images', 'payment', 'address'])
            ->latest()
            ->paginate(20);

        return $this->success($orders);
    }

    public function adminIndex()
    {
        return $this->success(
            Order::with(['user', 'items.product', 'payment', 'address'])->latest()->paginate(20)
        );
    }

    public function show(Order $order, Request $request)
    {
        if (
            (int) $order->user_id !== (int) $request->user()->id
            && !$request->user()->isAdmin()
            && !$request->user()->isSuperAdmin()
        ) {
            return $this->error('Unauthorized', 403);
        }

        return $this->success($order->load(['items.product.images', 'payment', 'address']));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'address_id' => 'nullable|integer|exists:addresses,id',
            'shipping_address' => 'required_without:address_id|array',
            'shipping_address.address_line_1' => 'required_without:address_id|string|max:255',
            'shipping_address.address_line_2' => 'nullable|string|max:255',
            'shipping_address.city' => 'required_without:address_id|string|max:120',
            'shipping_address.state' => 'required_without:address_id|string|max:120',
            'shipping_address.zip_code' => 'required_without:address_id|string|max:20',
            'shipping_address.country' => 'required_without:address_id|string|max:100',
        ]);

        if (!config('services.razorpay.key') || !config('services.razorpay.secret')) {
            return $this->error('Online payment is not configured yet. Please contact the store administrator.', 503);
        }

        $user = $request->user();

        try {
            $result = DB::transaction(function () use ($validated, $user) {
                $cart = Cart::where('user_id', $user->id)
                    ->with('items.product')
                    ->lockForUpdate()
                    ->first();

                if (!$cart || $cart->items->isEmpty()) {
                    throw ValidationException::withMessages([
                        'cart' => ['Your cart is empty.'],
                    ]);
                }

                $address = null;

                if (!empty($validated['address_id'])) {
                    $address = Address::where('user_id', $user->id)
                        ->find($validated['address_id']);

                    if (!$address) {
                        throw ValidationException::withMessages([
                            'address_id' => ['The selected address does not belong to your account.'],
                        ]);
                    }
                } else {
                    $address = Address::create([
                        'user_id' => $user->id,
                        ...$validated['shipping_address'],
                    ]);
                }

                $total = 0;

                foreach ($cart->items as $item) {
                    $product = $item->product;

                    if (!$product || !$product->is_active || $product->stock < $item->quantity) {
                        throw ValidationException::withMessages([
                            'cart' => [($product?->name ?? 'A product') . ' is no longer available in the requested quantity.'],
                        ]);
                    }

                    $total += (float) $product->price * $item->quantity;
                }

                $order = Order::create([
                    'user_id' => $user->id,
                    'address_id' => $address->id,
                    'total_amount' => $total,
                    'status' => 'pending',
                    'payment_status' => 'pending',
                ]);

                foreach ($cart->items as $item) {
                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $item->product_id,
                        'quantity' => $item->quantity,
                        'price' => $item->product->price,
                    ]);
                }

                $razorpay = new Api(
                    config('services.razorpay.key'),
                    config('services.razorpay.secret')
                );

                $razorpayOrder = $razorpay->order->create([
                    'receipt' => 'order_' . $order->id,
                    'amount' => (int) round($total * 100),
                    'currency' => 'INR',
                ]);

                $order->update(['razorpay_order_id' => $razorpayOrder->id]);

                return [
                    'order' => $order->load(['items.product.images', 'address']),
                    'razorpay_order_id' => $razorpayOrder->id,
                    'amount' => (int) round($total * 100),
                    'currency' => 'INR',
                    'key' => config('services.razorpay.key'),
                ];
            });

            return $this->success($result, 'Order created. Complete payment to confirm it.', 201);
        } catch (ValidationException $e) {
            throw $e;
        } catch (\Throwable $e) {
            report($e);

            return $this->error('We could not create your order. Please try again.', 500);
        }
    }

    public function updateStatus(Request $request, Order $order)
    {
        $this->authorize('access-admin-dashboard', $request->user());

        $validated = $request->validate([
            'status' => 'required|in:pending,processing,shipped,delivered,cancelled',
        ]);

        if ($order->payment_status !== 'paid' && in_array($validated['status'], ['processing', 'shipped', 'delivered'], true)) {
            return $this->error('An order must be paid before it can be processed or fulfilled.', 422);
        }

        if ($order->status === 'delivered' && $validated['status'] !== 'delivered') {
            return $this->error('A delivered order cannot be moved to another status.', 422);
        }

        $order->update(['status' => $validated['status']]);

        return $this->success($order->load(['user', 'items.product', 'payment']), 'Order status updated');
    }
}
