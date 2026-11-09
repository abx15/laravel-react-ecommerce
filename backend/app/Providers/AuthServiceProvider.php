<?php

namespace App\Providers;

use App\Models\Product;
use App\Models\Seller;
use App\Policies\ProductPolicy;
use App\Policies\SellerPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        Product::class => ProductPolicy::class,
        Seller::class => SellerPolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();

        // Platform super administrators inherit all explicitly registered abilities.
        Gate::before(fn ($user) => $user->isSuperAdmin() ? true : null);

        Gate::define('is-user', fn ($user) => $user->hasRole('user'));
        Gate::define('is-seller', fn ($user) => $user->isSeller());
        Gate::define('is-admin', fn ($user) => $user->isAdmin());
        Gate::define('is-super-admin', fn ($user) => $user->isSuperAdmin());
        Gate::define('seller-verified', fn ($user) => $user->isSeller() && $user->is_seller_verified);
        Gate::define('manage-sellers', fn ($user) => $user->isAdmin() || $user->isSuperAdmin());
        Gate::define('manage-admins', fn ($user) => $user->isSuperAdmin());
        Gate::define('access-admin-dashboard', fn ($user) => $user->isAdmin() || $user->isSuperAdmin());
        Gate::define('access-seller-dashboard', fn ($user) => $user->isSeller() && $user->is_seller_verified);
    }
}
