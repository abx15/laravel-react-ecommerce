<?php

namespace App\Policies;

use App\Models\Product;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ProductPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // All authenticated users can view products
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Product $product): bool
    {
        // All authenticated users can view products
        return true;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Only verified sellers and admins can create products
        return ($user->isSeller() && $user->is_seller_verified) || $user->isAdmin() || $user->isSuperAdmin();
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Product $product): bool
    {
        // Sellers can only update their own products
        if ($user->isSeller() && $user->is_seller_verified) {
            return $product->seller_id === $user->id;
        }
        
        // Admins and super admins can update any product
        return $user->isAdmin() || $user->isSuperAdmin();
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Product $product): bool
    {
        // Sellers can only delete their own products
        if ($user->isSeller() && $user->is_seller_verified) {
            return $product->seller_id === $user->id;
        }
        
        // Admins and super admins can delete any product
        return $user->isAdmin() || $user->isSuperAdmin();
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Product $product): bool
    {
        return $user->isAdmin() || $user->isSuperAdmin();
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Product $product): bool
    {
        return $user->isSuperAdmin();
    }
}
