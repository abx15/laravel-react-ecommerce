<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\Hash;

class RoleBasedUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create roles
        $roles = [
            'super_admin',
            'admin', 
            'seller',
            'user'
        ];

        foreach ($roles as $role) {
            Role::firstOrCreate(['name' => $role]);
        }

        // Create Super Admin
        $superAdmin = User::firstOrCreate(
            ['email' => 'superadmin@example.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('password'),
                'is_verified' => true,
                'is_blocked' => false,
            ]
        );
        $superAdmin->assignRole('super_admin');

        // Create Admin
        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password'),
                'is_verified' => true,
                'is_blocked' => false,
            ]
        );
        $admin->assignRole('admin');

        // Create Sellers
        $sellers = [
            [
                'email' => 'seller1@example.com',
                'name' => 'John Seller',
                'is_verified' => true,
            ],
            [
                'email' => 'seller2@example.com', 
                'name' => 'Jane Seller',
                'is_verified' => false, // Pending verification
            ]
        ];

        foreach ($sellers as $sellerData) {
            $seller = User::firstOrCreate(
                ['email' => $sellerData['email']],
                [
                    'name' => $sellerData['name'],
                    'password' => Hash::make('password'),
                    'is_verified' => $sellerData['is_verified'],
                    'is_blocked' => false,
                ]
            );
            $seller->assignRole('seller');
        }

        // Create Regular Users
        $users = [
            ['email' => 'user1@example.com', 'name' => 'Regular User'],
            ['email' => 'user2@example.com', 'name' => 'Test User'],
        ];

        foreach ($users as $userData) {
            $user = User::firstOrCreate(
                ['email' => $userData['email']],
                [
                    'name' => $userData['name'],
                    'password' => Hash::make('password'),
                    'is_verified' => true,
                    'is_blocked' => false,
                ]
            );
            $user->assignRole('user');
        }

        $this->command->info('Role-based users created successfully!');
        $this->command->info('Login credentials:');
        $this->command->info('Super Admin: superadmin@example.com / password');
        $this->command->info('Admin: admin@example.com / password');
        $this->command->info('Seller (Verified): seller1@example.com / password');
        $this->command->info('Seller (Pending): seller2@example.com / password');
        $this->command->info('User: user1@example.com / password');
    }
}
