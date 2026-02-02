<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;
use App\Policies\ProductPolicy;
use App\Policies\SellerPolicy;
use App\Models\Product;
use App\Models\Seller;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Product::class => ProductPolicy::class,
        Seller::class => SellerPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();

        // Define gates for role-based access
        Gate::define('is-user', function ($user) {
            return $user->hasRole('user');
        });

        Gate::define('is-seller', function ($user) {
            return $user->hasRole('seller');
        });

        Gate::define('is-admin', function ($user) {
            return $user->hasRole('admin');
        });

        Gate::define('is-super-admin', function ($user) {
            return $user->hasRole('super_admin');
        });

        Gate::define('seller-verified', function ($user) {
            return $user->isSeller() && $user->is_seller_verified;
        });

        Gate::define('manage-sellers', function ($user) {
            return $user->isAdmin() || $user->isSuperAdmin();
        });

        Gate::define('manage-admins', function ($user) {
            return $user->isSuperAdmin();
        });

        Gate::define('access-admin-dashboard', function ($user) {
            return $user->isAdmin() || $user->isSuperAdmin();
        });

        Gate::define('access-seller-dashboard', function ($user) {
            return $user->isSeller() && $user->is_seller_verified;
        });
    }
}
