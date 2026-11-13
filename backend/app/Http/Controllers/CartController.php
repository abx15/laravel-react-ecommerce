<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $cart = Cart::with(['items.product.images'])->firstOrCreate([
            'user_id' => $request->user()->id,
        ]);

        return $this->success($cart);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1|max:99',
        ]);

        $cart = Cart::firstOrCreate([
            'user_id' => $request->user()->id,
        ]);

        $product = Product::where('is_active', true)->findOrFail($validated['product_id']);
        $existing = CartItem::where('cart_id', $cart->id)
            ->where('product_id', $product->id)
            ->first();

        $nextQuantity = ($existing?->quantity ?? 0) + $validated['quantity'];

        if ($product->stock < $nextQuantity) {
            return $this->error('Only ' . $product->stock . ' item(s) are available in stock.', 422);
        }

        if ($existing) {
            $existing->update(['quantity' => $nextQuantity]);
        } else {
            CartItem::create([
                'cart_id' => $cart->id,
                'product_id' => $product->id,
                'quantity' => $validated['quantity'],
            ]);
        }

        return $this->success(
            $cart->load('items.product.images'),
            'Item added to cart'
        );
    }

    public function update(Request $request, CartItem $cartItem)
    {
        if ($cartItem->cart->user_id !== $request->user()->id) {
            return $this->error('Unauthorized', 403);
        }

        $validated = $request->validate([
            'quantity' => 'required|integer|min:1|max:99',
        ]);

        if ($cartItem->product->stock < $validated['quantity']) {
            return $this->error('Requested quantity is not available in stock.', 422);
        }

        $cartItem->update(['quantity' => $validated['quantity']]);

        return $this->success(
            $cartItem->cart->load('items.product.images'),
            'Cart updated'
        );
    }

    public function destroy(Request $request, CartItem $cartItem)
    {
        if ($cartItem->cart->user_id !== $request->user()->id) {
            return $this->error('Unauthorized', 403);
        }

        $cartItem->delete();

        return $this->success([], 'Item removed from cart');
    }
}
