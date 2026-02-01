<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Seller extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'shop_name',
        'shop_address',
        'city',
        'pincode',
        'gst_number',
        'id_proof_path',
        'bank_details',
        'status',
    ];

    protected $casts = [
        'bank_details' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
