<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'sometimes|integer|exists:categories,id',
            'search' => 'sometimes|string|max:120',
            'sort' => 'sometimes|in:name,price_asc,price_desc,created_at',
            'limit' => 'sometimes|integer|min:1|max:48',
            'per_page' => 'sometimes|integer|min:1|max:48',
        ]);

        $query = Product::query()
            ->with(['category', 'images'])
            ->where('is_active', true);

        if (!empty($validated['category_id'])) {
            $query->where('category_id', $validated['category_id']);
        }

        if (!empty($validated['search'])) {
            $search = trim($validated['search']);
            $query->where(function ($builder) use ($search) {
                $builder->where('name', 'like', '%' . $search . '%')
                    ->orWhere('description', 'like', '%' . $search . '%');
            });
        }

        match ($validated['sort'] ?? 'created_at') {
            'name' => $query->orderBy('name'),
            'price_asc' => $query->orderBy('price'),
            'price_desc' => $query->orderByDesc('price'),
            default => $query->latest(),
        };

        return $this->success($query->paginate(
            $validated['per_page'] ?? $validated['limit'] ?? 12
        ));
    }

    public function show(Product $product)
    {
        if (!$product->is_active) {
            return $this->error('Product not found', 404);
        }

        return $this->success($product->load(['category', 'images']));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'category_id' => 'required|exists:categories,id',
            'images' => 'sometimes|array|max:8',
            'images.*' => 'image|mimes:jpeg,png,jpg,webp|max:5120',
            'original_price' => 'nullable|numeric|min:0',
            'discount_percentage' => 'nullable|integer|min:0|max:100',
        ]);

        $product = Product::create([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']) . '-' . Str::lower(Str::random(8)),
            'description' => $validated['description'],
            'price' => $validated['price'],
            'original_price' => $validated['original_price'] ?? null,
            'discount_percentage' => $validated['discount_percentage'] ?? 0,
            'stock' => $validated['stock'],
            'category_id' => $validated['category_id'],
            'is_active' => true,
            'seller_id' => $request->user()->id,
        ]);

        $this->storeProductImages($request, $product);

        return $this->success($product->load(['category', 'images']), 'Product created successfully', 201);
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'price' => 'sometimes|numeric|min:0',
            'original_price' => 'nullable|numeric|min:0',
            'discount_percentage' => 'nullable|integer|min:0|max:100',
            'stock' => 'sometimes|integer|min:0',
            'category_id' => 'sometimes|exists:categories,id',
            'is_active' => 'sometimes|boolean',
            'images' => 'sometimes|array|max:8',
            'images.*' => 'image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        if (isset($validated['name'])) {
            $validated['slug'] = Str::slug($validated['name']) . '-' . Str::lower(Str::random(8));
        }

        $product->update(collect($validated)->except('images')->all());
        $this->storeProductImages($request, $product);

        return $this->success($product->load(['category', 'images']), 'Product updated successfully');
    }

    private function storeProductImages(Request $request, Product $product): void
    {
        if (!$request->hasFile('images')) {
            return;
        }

        $category = Category::find($product->category_id);
        $categoryName = $category ? Str::slug($category->name) : 'uncategorized';
        $relativeDirectory = 'assets/products/' . $categoryName;
        $destination = public_path($relativeDirectory);

        File::ensureDirectoryExists($destination);

        foreach ($request->file('images') as $index => $image) {
            $filename = Str::uuid() . '.' . $image->extension();
            $image->move($destination, $filename);

            ProductImage::create([
                'product_id' => $product->id,
                'image_path' => '/' . $relativeDirectory . '/' . $filename,
                'is_primary' => !$product->images()->where('is_primary', true)->exists() && $index === 0,
            ]);
        }
    }

    public function deleteImage(Request $request, $id)
    {
        $image = ProductImage::with('product')->find($id);

        if (!$image) {
            return $this->error('Image not found', 404);
        }

        if ($request->user()->hasRole(['seller']) && $image->product->seller_id !== $request->user()->id) {
            return $this->error('Unauthorized', 403);
        }

        $path = public_path(ltrim($image->image_path, '/'));
        if (is_file($path)) {
            @unlink($path);
        }

        $image->delete();

        return $this->success([], 'Image deleted successfully');
    }

    public function destroy(Product $product)
    {
        $product->delete();

        return $this->success([], 'Product deleted successfully');
    }

    public function sellerProducts(Request $request)
    {
        $products = Product::where('seller_id', $request->user()->id)
            ->with(['category', 'images'])
            ->latest()
            ->paginate(20);

        return $this->success($products);
    }
}
