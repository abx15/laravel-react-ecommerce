<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'user_type',
        'is_verified',
        'is_blocked',
        'is_seller_verified',
        'seller_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'seller_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_verified' => 'boolean',
            'is_blocked' => 'boolean',
            'is_seller_verified' => 'boolean',
        ];
    }

    public function products()
    {
        return $this->hasMany(Product::class, 'seller_id');
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function sellerProducts()
    {
        return $this->hasMany(Product::class, 'seller_id');
    }

    public function sellerProfile()
    {
        return $this->hasOne(Seller::class);
    }

    // Role helper methods
    public function isUser()
    {
        return $this->user_type === 'user';
    }

    public function isSeller()
    {
        return $this->user_type === 'seller';
    }

    public function isAdmin()
    {
        return $this->user_type === 'admin';
    }

    public function isSuperAdmin()
    {
        return $this->user_type === 'super_admin';
    }

    public function hasSellerAccess()
    {
        return $this->isSeller() && $this->is_seller_verified;
    }
}
