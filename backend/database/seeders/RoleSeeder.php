<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\DB;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // create roles
        $userRole = Role::firstOrCreate(['name' => 'user']);
        $sellerRole = Role::firstOrCreate(['name' => 'seller']);
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $superAdminRole = Role::firstOrCreate(['name' => 'super_admin']);

        // Update existing users to have proper user_type
        DB::table('users')->where('email', 'test@example.com')->update(['user_type' => 'user']);
        DB::table('users')->where('email', 'admin@example.com')->update(['user_type' => 'admin']);
        DB::table('users')->where('email', 'superadmin@example.com')->update(['user_type' => 'super_admin']);
    }
}
