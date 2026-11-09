<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Production-safe baseline: create RBAC definitions only.
        // Never seed demo users or known default passwords into production.
        $this->call(RoleSeeder::class);
    }
}
