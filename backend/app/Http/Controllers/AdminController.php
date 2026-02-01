<?php

namespace App\Http\Controllers;

use App\Models\Seller;
use App\Models\User;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    // List all sellers (pending/approved/rejected)
    public function getSellers()
    {
        $sellers = Seller::with('user')->orderBy('created_at', 'desc')->get();
        return response()->json($sellers);
    }

    // Approve a seller
    public function approveSeller($id)
    {
        $seller = Seller::findOrFail($id);
        $seller->update(['status' => 'approved']);

        // Assign 'seller' role to the user
        $seller->user->assignRole('seller');

        return response()->json([
            'message' => 'Seller approved successfully.',
            'seller' => $seller
        ]);
    }

    // Reject a seller
    public function rejectSeller($id)
    {
        $seller = Seller::findOrFail($id);
        $seller->update(['status' => 'rejected']);

        // Optionally remove role if they had it
        $seller->user->removeRole('seller');

        return response()->json([
            'message' => 'Seller rejected.',
            'seller' => $seller
        ]);
    }
}
