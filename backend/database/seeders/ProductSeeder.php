<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Category;
use App\Models\ProductImage;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            // Electronics
            [
                'name' => 'iPhone 15 Pro',
                'slug' => 'iphone-15-pro',
                'description' => 'Latest iPhone with A17 Pro chip, titanium design, and advanced camera system.',
                'price' => 999.99,
                'stock' => 50,
                'category_id' => 6, // Smartphones
                'is_active' => true,
                'images' => [
                    ['image_path' => 'https://via.placeholder.com/400x400/000000/FFFFFF?text=iPhone+15+Pro', 'is_primary' => true],
                    ['image_path' => 'https://via.placeholder.com/400x400/333333/FFFFFF?text=iPhone+15+Pro+Back', 'is_primary' => false],
                ]
            ],
            [
                'name' => 'Samsung Galaxy S24',
                'slug' => 'samsung-galaxy-s24',
                'description' => 'Flagship Android phone with AI features and stunning display.',
                'price' => 899.99,
                'stock' => 30,
                'category_id' => 6,
                'is_active' => true,
                'images' => [
                    ['image_path' => 'https://via.placeholder.com/400x400/1e40af/FFFFFF?text=Galaxy+S24', 'is_primary' => true],
                ]
            ],
            [
                'name' => 'MacBook Pro 14"',
                'slug' => 'macbook-pro-14',
                'description' => 'Powerful laptop with M3 Pro chip, perfect for professionals.',
                'price' => 1999.99,
                'stock' => 25,
                'category_id' => 7, // Laptops
                'is_active' => true,
                'images' => [
                    ['image_path' => 'https://via.placeholder.com/400x400/silver/000000?text=MacBook+Pro', 'is_primary' => true],
                ]
            ],
            [
                'name' => 'Sony WH-1000XM5',
                'slug' => 'sony-wh1000xm5',
                'description' => 'Industry-leading noise canceling headphones with exceptional sound quality.',
                'price' => 399.99,
                'stock' => 40,
                'category_id' => 8, // Headphones
                'is_active' => true,
                'images' => [
                    ['image_path' => 'https://via.placeholder.com/400x400/000000/FFFFFF?text=Sony+Headphones', 'is_primary' => true],
                ]
            ],
            // Clothing
            [
                'name' => 'Men\'s Premium T-Shirt',
                'slug' => 'mens-premium-tshirt',
                'description' => 'High-quality cotton t-shirt, comfortable and stylish.',
                'price' => 29.99,
                'stock' => 100,
                'category_id' => 9, // Men's Clothing
                'is_active' => true,
                'images' => [
                    ['image_path' => 'https://via.placeholder.com/400x400/3b82f6/FFFFFF?text=Men+T-Shirt', 'is_primary' => true],
                ]
            ],
            [
                'name' => 'Women\'s Summer Dress',
                'slug' => 'womens-summer-dress',
                'description' => 'Elegant summer dress perfect for any occasion.',
                'price' => 59.99,
                'stock' => 60,
                'category_id' => 10, // Women's Clothing
                'is_active' => true,
                'images' => [
                    ['image_path' => 'https://via.placeholder.com/400x400/ec4899/FFFFFF?text=Summer+Dress', 'is_primary' => true],
                ]
            ],
            [
                'name' => 'Kids Sports Jersey',
                'slug' => 'kids-sports-jersey',
                'description' => 'Comfortable sports jersey for active kids.',
                'price' => 24.99,
                'stock' => 80,
                'category_id' => 11, // Kids Clothing
                'is_active' => true,
                'images' => [
                    ['image_path' => 'https://via.placeholder.com/400x400/10b981/FFFFFF?text=Kids+Jersey', 'is_primary' => true],
                ]
            ],
            // Home & Garden
            [
                'name' => 'Smart LED Bulb Set',
                'slug' => 'smart-led-bulb-set',
                'description' => 'WiFi-enabled LED bulbs with color changing capabilities.',
                'price' => 49.99,
                'stock' => 45,
                'category_id' => 3, // Home & Garden
                'is_active' => true,
                'images' => [
                    ['image_path' => 'https://via.placeholder.com/400x400/fbbf24/000000?text=Smart+Bulb', 'is_primary' => true],
                ]
            ],
            [
                'name' => 'Indoor Plant Collection',
                'slug' => 'indoor-plant-collection',
                'description' => 'Set of 3 low-maintenance indoor plants with pots.',
                'price' => 79.99,
                'stock' => 35,
                'category_id' => 3,
                'is_active' => true,
                'images' => [
                    ['image_path' => 'https://via.placeholder.com/400x400/22c55e/FFFFFF?text=Indoor+Plants', 'is_primary' => true],
                ]
            ],
            // Sports
            [
                'name' => 'Professional Yoga Mat',
                'slug' => 'professional-yoga-mat',
                'description' => 'Extra thick, non-slip yoga mat for all fitness levels.',
                'price' => 34.99,
                'stock' => 70,
                'category_id' => 4, // Sports
                'is_active' => true,
                'images' => [
                    ['image_path' => 'https://via.placeholder.com/400x400/a855f7/FFFFFF?text=Yoga+Mat', 'is_primary' => true],
                ]
            ],
            [
                'name' => 'Running Shoes Pro',
                'slug' => 'running-shoes-pro',
                'description' => 'Lightweight running shoes with advanced cushioning.',
                'price' => 129.99,
                'stock' => 55,
                'category_id' => 4,
                'is_active' => true,
                'images' => [
                    ['image_path' => 'https://via.placeholder.com/400x400/ef4444/FFFFFF?text=Running+Shoes', 'is_primary' => true],
                ]
            ],
            // Books
            [
                'name' => 'JavaScript: The Complete Guide',
                'slug' => 'javascript-complete-guide',
                'description' => 'Comprehensive guide to modern JavaScript development.',
                'price' => 44.99,
                'stock' => 90,
                'category_id' => 5, // Books
                'is_active' => true,
                'images' => [
                    ['image_path' => 'https://via.placeholder.com/400x400/f59e0b/000000?text=JavaScript+Book', 'is_primary' => true],
                ]
            ],
            [
                'name' => 'Digital Marketing Mastery',
                'slug' => 'digital-marketing-mastery',
                'description' => 'Learn modern digital marketing strategies and techniques.',
                'price' => 39.99,
                'stock' => 75,
                'category_id' => 5,
                'is_active' => true,
                'images' => [
                    ['image_path' => 'https://via.placeholder.com/400x400/8b5cf6/FFFFFF?text=Marketing+Book', 'is_primary' => true],
                ]
            ],
        ];

        // Get available seller User IDs
        $sellerIds = \App\Models\User::role('seller')->pluck('id')->toArray();
        if (empty($sellerIds)) {
            // Fallback if no sellers exist (though SampleSellerSeeder should run first)
            $sellerIds = [\App\Models\User::first()->id ?? null];
        }

        foreach ($products as $productData) {
            $images = $productData['images'];
            unset($productData['images']);

            // Assign a random seller to the product
            $productData['seller_id'] = $sellerIds[array_rand($sellerIds)];

            $product = Product::create($productData);

            foreach ($images as $imageData) {
                $product->images()->create($imageData);
            }
        }
    }
}
