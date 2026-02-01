<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create Permissions
        $permissions = [
            'view admin dashboard',
            'manage users',
            'verify sellers',
            'manage products',
            'manage categories',
            'view sales',
            'manage own products',
            'view own sales',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Create Roles and Assign Permissions

        // Customer
        $customerRole = Role::firstOrCreate(['name' => 'customer']);

        // Seller
        $sellerRole = Role::firstOrCreate(['name' => 'seller']);
        $sellerRole->givePermissionTo(['manage own products', 'view own sales']);

        // Admin
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $adminRole->givePermissionTo([
            'view admin dashboard',
            'manage users',
            'verify sellers',
            'manage products',
            'manage categories',
            'view sales'
        ]);

        // Super Admin
        $superAdminRole = Role::firstOrCreate(['name' => 'super_admin']);
        // Super admin gets all permissions via Gate::before rule or just give all
        $superAdminRole->givePermissionTo(Permission::all());
    }
}
