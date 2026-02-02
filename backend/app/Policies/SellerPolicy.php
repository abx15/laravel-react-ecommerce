<?php

namespace App\Policies;

use App\Models\Seller;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class SellerPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // Admins and super admins can view all sellers
        return $user->isAdmin() || $user->isSuperAdmin();
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Seller $seller): bool
    {
        // Users can view their own seller profile
        if ($user->id === $seller->user_id) {
            return true;
        }
        
        // Admins and super admins can view any seller
        return $user->isAdmin() || $user->isSuperAdmin();
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Any user can create a seller profile (registration)
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Seller $seller): bool
    {
        // Users can update their own seller profile
        if ($user->id === $seller->user_id) {
            return true;
        }
        
        // Admins and super admins can update any seller
        return $user->isAdmin() || $user->isSuperAdmin();
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Seller $seller): bool
    {
        // Only super admins can delete sellers
        return $user->isSuperAdmin();
    }

    /**
     * Determine whether the user can verify the seller.
     */
    public function verify(User $user, Seller $seller): bool
    {
        // Only admins and super admins can verify sellers
        return $user->isAdmin() || $user->isSuperAdmin();
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Seller $seller): bool
    {
        return $user->isSuperAdmin();
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Seller $seller): bool
    {
        return $user->isSuperAdmin();
    }
}
