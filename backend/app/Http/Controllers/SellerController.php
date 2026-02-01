<?php

namespace App\Http\Controllers;

use App\Models\Seller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class SellerController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'shop_name' => 'required|string|max:255',
            'shop_address' => 'required|string',
            'city' => 'required|string',
            'pincode' => 'required|string',
            'gst_number' => 'nullable|string',
            'id_proof' => 'required|file|mimes:jpg,jpeg,png,pdf|max:2048',
            'bank_details' => 'required|array',
            'bank_details.account_holder_name' => 'required|string',
            'bank_details.account_number' => 'required|string',
            'bank_details.ifsc_code' => 'required|string',
            'bank_details.bank_name' => 'required|string',
        ]);

        if ($request->user()->seller) {
            return response()->json(['message' => 'You are already registered as a seller.'], 400);
        }

        $idProofPath = $request->file('id_proof')->store('seller_proofs', 'public');

        $seller = Seller::create([
            'user_id' => $request->user()->id,
            'shop_name' => $request->shop_name,
            'shop_address' => $request->shop_address,
            'city' => $request->city,
            'pincode' => $request->pincode,
            'gst_number' => $request->gst_number,
            'id_proof_path' => $idProofPath,
            'bank_details' => $request->bank_details,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Seller registration submitted successfully. Please wait for approval.',
            'seller' => $seller,
        ], 201);
    }
}
