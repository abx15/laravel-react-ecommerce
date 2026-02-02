<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductImage;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = Product::with(['category', 'images'])->where('is_active', true);

        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $products = $query->paginate(12);

        return $this->success($products);
    }

    public function show(Product $product)
    {
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
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
            'original_price' => 'nullable|numeric|min:0',
            'discount_percentage' => 'nullable|integer|min:0|max:100'
        ]);

        $product = Product::create([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']) . '-' . uniqid(),
            'description' => $validated['description'],
            'price' => $validated['price'],
            'original_price' => $validated['original_price'] ?? null,
            'discount_percentage' => $validated['discount_percentage'] ?? 0,
            'stock' => $validated['stock'],
            'category_id' => $validated['category_id'],
            'is_active' => true,
            'seller_id' => $request->user()->id,
        ]);

        if ($request->hasFile('images')) {
            $category = \App\Models\Category::find($validated['category_id']);
            $categoryName = $category ? Str::slug($category->name) : 'uncategorized';

            foreach ($request->file('images') as $index => $image) {
                // Generate a unique filename
                $filename = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();

                // Define the destination path: public/assets/products/{category}
                $destinationPath = public_path('assets/products/' . $categoryName);

                // Move the file
                $image->move($destinationPath, $filename);

                ProductImage::create([
                    'product_id' => $product->id,
                    'image_path' => '/assets/products/' . $categoryName . '/' . $filename,
                    'is_primary' => $index === 0
                ]);
            }
        }

        return $this->success($product->load('images'), 'Product created successfully', 201);
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
            'is_active' => 'boolean'
        ]);

        if (isset($validated['name'])) {
            $validated['slug'] = Str::slug($validated['name']) . '-' . uniqid();
        }

        $product->update($validated);

        // Handle Image Uploads (Append to existing)
        if ($request->hasFile('images')) {
            $product->load('category'); // Ensure category is loaded
            $category = $product->category;
            $categoryName = $category ? Str::slug($category->name) : 'uncategorized';

            foreach ($request->file('images') as $image) {
                $filename = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
                $destinationPath = public_path('assets/products/' . $categoryName);
                $image->move($destinationPath, $filename);

                ProductImage::create([
                    'product_id' => $product->id,
                    'image_path' => '/assets/products/' . $categoryName . '/' . $filename,
                    'is_primary' => false // Appended images are not primary by default
                ]);
            }
        }

        return $this->success($product->load('images'), 'Product updated successfully');
    }

    public function deleteImage($imageId)
    {
        $image = ProductImage::find($imageId);
        if (!$image) return $this->error('Image not found', 404);

        // Optional: Delete from storage
        // if(file_exists(public_path($image->image_path))) { unlink(public_path($image->image_path)); }

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
            ->orderBy('created_at', 'desc')
            ->get();

        return $this->success($products);
    }
}
