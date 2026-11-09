<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $permissions = [
            'catalog.read',
            'cart.manage-own',
            'orders.manage-own',
            'profile.manage-own',
            'wishlist.manage-own',
            'seller.apply',
            'seller.products.manage-own',
            'seller.orders.read-own',
            'seller.analytics.read-own',
            'admin.dashboard.read',
            'admin.catalog.manage',
            'admin.categories.manage',
            'admin.orders.manage',
            'admin.customers.manage',
            'admin.sellers.manage',
            'admin.refunds.manage',
            'admin.analytics.read',
            'platform.admins.manage',
            'platform.roles.manage',
            'platform.settings.manage',
            'platform.audit.read',
            'platform.overview.read',
        ];

        $permissionModels = collect($permissions)->mapWithKeys(
            fn (string $permission) => [$permission => Permission::firstOrCreate([
                'name' => $permission,
                'guard_name' => 'web',
            ])]
        );

        $rolePermissions = [
            'user' => [
                'catalog.read', 'cart.manage-own', 'orders.manage-own',
                'profile.manage-own', 'wishlist.manage-own', 'seller.apply',
            ],
            'seller' => [
                'catalog.read', 'cart.manage-own', 'orders.manage-own',
                'profile.manage-own', 'wishlist.manage-own', 'seller.apply', 'seller.products.manage-own',
                'seller.orders.read-own', 'seller.analytics.read-own',
            ],
            'admin' => [
                'catalog.read', 'admin.dashboard.read', 'admin.catalog.manage',
                'admin.categories.manage', 'admin.orders.manage',
                'admin.customers.manage', 'admin.sellers.manage',
                'admin.refunds.manage', 'admin.analytics.read',
            ],
            'super_admin' => $permissions,
        ];

        foreach ($rolePermissions as $name => $grants) {
            $role = Role::firstOrCreate(['name' => $name, 'guard_name' => 'web']);
            $role->syncPermissions($permissionModels->only($grants)->values());
        }

        User::whereIn('email', ['admin@example.com', 'superadmin@example.com', 'test@example.com'])
            ->update(['status' => 'inactive', 'is_blocked' => true]);

        User::query()->select(['id', 'user_type'])->chunkById(200, function ($users) {
            foreach ($users as $user) {
                $roles = match ($user->user_type) {
                    'seller' => ['user', 'seller'],
                    'admin' => ['admin'],
                    'super_admin', 'superadmin' => ['super_admin'],
                    default => ['user'],
                };

                $user->syncRoles($roles);
            }
        });

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
