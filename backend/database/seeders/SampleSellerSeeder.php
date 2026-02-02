<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Seller;
use Illuminate\Support\Facades\Hash;

class SampleSellerSeeder extends Seeder
{
    public function run(): void
    {
        // Define 5 distinct sellers
        $sellers = [
            [
                'name' => 'John Tech',
                'email' => 'seller1@example.com',
                'shop_name' => 'John Electronics',
                'status' => 'approved',
                'is_verified' => true,
            ],
            [
                'name' => 'Sarah Fashion',
                'email' => 'seller2@example.com',
                'shop_name' => 'Sarah Styles',
                'status' => 'approved',
                'is_verified' => true,
            ],
            [
                'name' => 'Mike Sports',
                'email' => 'seller3@example.com',
                'shop_name' => 'Mike Activewear',
                'status' => 'pending',
                'is_verified' => false,
            ],
            [
                'name' => 'Emily Decor',
                'email' => 'seller4@example.com',
                'shop_name' => 'Emily Home',
                'status' => 'approved',
                'is_verified' => true,
            ],
            [
                'name' => 'David Books',
                'email' => 'seller5@example.com',
                'shop_name' => 'Davids Reader Haven',
                'status' => 'pending',
                'is_verified' => false,
            ],
        ];

        foreach ($sellers as $data) {
            $user = User::firstOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['name'],
                    'password' => Hash::make('password'),
                    'user_type' => 'seller',
                    'is_seller_verified' => $data['is_verified'],
                    'seller_verified_at' => $data['is_verified'] ? now() : null,
                ]
            );
            $user->assignRole('seller');

            Seller::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'shop_name' => $data['shop_name'],
                    'shop_address' => '123 Market St',
                    'city' => 'Cityville',
                    'pincode' => '123456',
                    'gst_number' => 'GST' . rand(1000, 9999),
                    'id_proof_path' => 'seller_proofs/default.jpg',
                    'bank_details' => [
                        'account_holder_name' => $data['name'],
                        'account_number' => '123456789' . rand(0, 9),
                        'ifsc_code' => 'BANK0001234',
                        'bank_name' => 'Test Bank'
                    ],
                    'status' => $data['status'],
                ]
            );
        }
    }
}
