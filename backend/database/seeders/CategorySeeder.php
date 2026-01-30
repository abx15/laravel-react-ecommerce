<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Electronics',
                'slug' => 'electronics',
                'parent_id' => null,
            ],
            [
                'name' => 'Clothing',
                'slug' => 'clothing',
                'parent_id' => null,
            ],
            [
                'name' => 'Home & Garden',
                'slug' => 'home-garden',
                'parent_id' => null,
            ],
            [
                'name' => 'Sports',
                'slug' => 'sports',
                'parent_id' => null,
            ],
            [
                'name' => 'Books',
                'slug' => 'books',
                'parent_id' => null,
            ],
            // Electronics Subcategories
            [
                'name' => 'Smartphones',
                'slug' => 'smartphones',
                'parent_id' => 1,
            ],
            [
                'name' => 'Laptops',
                'slug' => 'laptops',
                'parent_id' => 1,
            ],
            [
                'name' => 'Headphones',
                'slug' => 'headphones',
                'parent_id' => 1,
            ],
            // Clothing Subcategories
            [
                'name' => 'Men\'s Clothing',
                'slug' => 'mens-clothing',
                'parent_id' => 2,
            ],
            [
                'name' => 'Women\'s Clothing',
                'slug' => 'womens-clothing',
                'parent_id' => 2,
            ],
            [
                'name' => 'Kids Clothing',
                'slug' => 'kids-clothing',
                'parent_id' => 2,
            ],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
