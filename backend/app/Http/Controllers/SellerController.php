<?php

namespace App\Http\Controllers;

use App\Models\Seller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\Traits\ApiResponse;

class SellerController extends Controller
{
    use AuthorizesRequests, ApiResponse;

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

        if ($request->user()->sellerProfile) {
            return $this->error('You are already registered as a seller.', 400);
        }

        $idProofPath = $request->file('id_proof')->store('seller_proofs', 'public');

        $user = $request->user();
        $user->update(['user_type' => 'seller']);
        $user->syncRoles(['user', 'seller']);

        $seller = Seller::create([
            'user_id' => $user->id,
            'shop_name' => $request->shop_name,
            'shop_address' => $request->shop_address,
            'city' => $request->city,
            'pincode' => $request->pincode,
            'gst_number' => $request->gst_number,
            'id_proof_path' => $idProofPath,
            'bank_details' => $request->bank_details,
            'status' => 'pending',
        ]);

        return $this->success([
            'seller' => $seller,
        ], 'Seller registration submitted successfully. Please wait for approval.', 201);
    }

    public function index(Request $request)
    {
        $this->authorize('viewAny', Seller::class);
        
        $sellers = Seller::with('user')->get();
        return $this->success($sellers);
    }

    public function show(Request $request, Seller $seller)
    {
        $this->authorize('view', $seller);
        
        return $this->success($seller->load('user'));
    }

    public function update(Request $request)
    {
        $seller = $request->user()->sellerProfile;

        if (!$seller) {
            return $this->error('Seller profile not found.', 404);
        }

        $validated = $request->validate([
            'shop_name' => 'sometimes|required|string|max:255',
            'shop_address' => 'sometimes|required|string|max:1000',
            'city' => 'sometimes|required|string|max:120',
            'pincode' => 'sometimes|required|string|max:20',
            'gst_number' => 'sometimes|nullable|string|max:30',
            'bank_details' => 'sometimes|array',
            'bank_details.account_holder_name' => 'sometimes|required|string|max:255',
            'bank_details.account_number' => 'sometimes|required|string|max:34',
            'bank_details.ifsc_code' => 'sometimes|required|string|max:20',
            'bank_details.bank_name' => 'sometimes|required|string|max:255',
        ]);

        $seller->update($validated);

        return $this->success($seller->fresh(), 'Seller profile updated successfully');
    }

    public function verify(Request $request, Seller $seller)
    {
        $this->authorize('verify', $seller);

        $validated = $request->validate([
            'status' => 'required|in:approved,rejected',
            'rejection_reason' => 'required_if:status,rejected|string',
        ]);

        $seller->update([
            'status' => $validated['status'],
        ]);

        // Update user's seller verification status
        $seller->user->update([
            'is_seller_verified' => $validated['status'] === 'approved',
            'seller_verified_at' => $validated['status'] === 'approved' ? now() : null,
        ]);

        $message = $validated['status'] === 'approved' 
            ? 'Seller verified successfully' 
            : 'Seller rejected';

        return $this->success($seller->load('user'), $message);
    }

    public function block(Request $request, User $user)
    {
        if (!$user->isSeller()) {
            return $this->error('User is not a seller', 400);
        }

        $user->update(['is_blocked' => true]);
        return $this->success([], 'Seller blocked successfully');
    }

    public function unblock(Request $request, User $user)
    {
        if (!$user->isSeller()) {
            return $this->error('User is not a seller', 400);
        }

        $user->update(['is_blocked' => false]);
        return $this->success([], 'Seller unblocked successfully');
    }

    public function myProfile(Request $request)
    {
        $seller = $request->user()->sellerProfile;
        
        if (!$seller) {
            return $this->error('Seller profile not found', 404);
        }

        return $this->success($seller);
    }
}
