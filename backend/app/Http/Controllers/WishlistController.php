<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\WishlistItem;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $items = WishlistItem::where('user_id', $request->user()->id)
            ->with(['product.category', 'product.images'])
            ->latest()
            ->paginate(20);

        return $this->success($items);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|integer|exists:products,id',
        ]);

        $product = Product::where('is_active', true)->findOrFail($validated['product_id']);

        $item = WishlistItem::firstOrCreate([
            'user_id' => $request->user()->id,
            'product_id' => $product->id,
        ]);

        return $this->success($item->load(['product.category', 'product.images']), 'Product saved to wishlist', 201);
    }

    public function destroy(Request $request, Product $product)
    {
        WishlistItem::where('user_id', $request->user()->id)
            ->where('product_id', $product->id)
            ->delete();

        return $this->success([], 'Product removed from wishlist');
    }
}
