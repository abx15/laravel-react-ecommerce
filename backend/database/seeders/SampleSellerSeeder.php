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
        // Create a sample seller user
        $sellerUser = User::firstOrCreate(
            ['email' => 'seller@example.com'],
            [
                'name' => 'John Seller',
                'password' => Hash::make('password'),
                'user_type' => 'seller',
                'is_seller_verified' => false,
            ]
        );
        $sellerUser->assignRole('seller');

        // Create seller profile
        Seller::firstOrCreate(
            ['user_id' => $sellerUser->id],
            [
                'shop_name' => 'John Electronics',
                'shop_address' => '123 Main Street',
                'city' => 'New York',
                'pincode' => '10001',
                'gst_number' => 'GST123456789',
                'id_proof_path' => 'seller_proofs/sample.jpg',
                'bank_details' => [
                    'account_holder_name' => 'John Seller',
                    'account_number' => '1234567890',
                    'ifsc_code' => 'SBIN0001234',
                    'bank_name' => 'State Bank of India'
                ],
                'status' => 'pending',
            ]
        );

        // Create another verified seller
        $verifiedSellerUser = User::firstOrCreate(
            ['email' => 'verifiedseller@example.com'],
            [
                'name' => 'Jane Verified',
                'password' => Hash::make('password'),
                'user_type' => 'seller',
                'is_seller_verified' => true,
                'seller_verified_at' => now(),
            ]
        );
        $verifiedSellerUser->assignRole('seller');

        Seller::firstOrCreate(
            ['user_id' => $verifiedSellerUser->id],
            [
                'shop_name' => 'Jane Fashion',
                'shop_address' => '456 Fashion Avenue',
                'city' => 'Los Angeles',
                'pincode' => '90001',
                'gst_number' => 'GST987654321',
                'id_proof_path' => 'seller_proofs/verified.jpg',
                'bank_details' => [
                    'account_holder_name' => 'Jane Verified',
                    'account_number' => '0987654321',
                    'ifsc_code' => 'HDFC0005678',
                    'bank_name' => 'HDFC Bank'
                ],
                'status' => 'approved',
            ]
        );
    }
}
