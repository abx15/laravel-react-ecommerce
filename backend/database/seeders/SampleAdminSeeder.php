<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class SampleAdminSeeder extends Seeder
{
    public function run(): void
    {
        // Create sample admin users for testing
        $admin1 = User::firstOrCreate(
            ['email' => 'admin1@example.com'],
            [
                'name' => 'Alice Johnson',
                'password' => Hash::make('password'),
                'user_type' => 'admin',
                'is_verified' => true,
                'is_blocked' => false,
            ]
        );
        $admin1->assignRole('admin');

        $admin2 = User::firstOrCreate(
            ['email' => 'admin2@example.com'],
            [
                'name' => 'Bob Smith',
                'password' => Hash::make('password'),
                'user_type' => 'admin',
                'is_verified' => true,
                'is_blocked' => false,
            ]
        );
        $admin2->assignRole('admin');

        // Create some regular users for testing
        $user1 = User::firstOrCreate(
            ['email' => 'user1@example.com'],
            [
                'name' => 'Charlie Brown',
                'password' => Hash::make('password'),
                'user_type' => 'user',
                'is_verified' => true,
                'is_blocked' => false,
            ]
        );
        $user1->assignRole('user');

        $user2 = User::firstOrCreate(
            ['email' => 'user2@example.com'],
            [
                'name' => 'Diana Prince',
                'password' => Hash::make('password'),
                'user_type' => 'user',
                'is_verified' => true,
                'is_blocked' => false,
            ]
        );
        $user2->assignRole('user');

        $user3 = User::firstOrCreate(
            ['email' => 'user3@example.com'],
            [
                'name' => 'Eve Wilson',
                'password' => Hash::make('password'),
                'user_type' => 'user',
                'is_verified' => true,
                'is_blocked' => false,
            ]
        );
        $user3->assignRole('user');
    }
}
