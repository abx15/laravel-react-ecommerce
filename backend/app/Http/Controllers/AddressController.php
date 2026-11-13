<?php

namespace App\Http\Controllers;

use App\Models\Address;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class AddressController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        return $this->success(
            Address::where('user_id', $request->user()->id)->latest()->paginate(20)
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'address_line_1' => 'required|string|max:255',
            'address_line_2' => 'nullable|string|max:255',
            'city' => 'required|string|max:120',
            'state' => 'required|string|max:120',
            'zip_code' => 'required|string|max:20',
            'country' => 'required|string|max:100',
        ]);

        $address = Address::create([
            ...$validated,
            'user_id' => $request->user()->id,
        ]);

        return $this->success($address, 'Address saved successfully', 201);
    }

    public function update(Request $request, Address $address)
    {
        if ((int) $address->user_id !== (int) $request->user()->id) {
            return $this->error('You cannot update another customer address.', 403);
        }

        $validated = $request->validate([
            'address_line_1' => 'sometimes|required|string|max:255',
            'address_line_2' => 'sometimes|nullable|string|max:255',
            'city' => 'sometimes|required|string|max:120',
            'state' => 'sometimes|required|string|max:120',
            'zip_code' => 'sometimes|required|string|max:20',
            'country' => 'sometimes|required|string|max:100',
        ]);

        $address->update($validated);

        return $this->success($address->fresh(), 'Address updated successfully');
    }

    public function destroy(Request $request, Address $address)
    {
        if ((int) $address->user_id !== (int) $request->user()->id) {
            return $this->error('You cannot delete another customer address.', 403);
        }

        $address->delete();

        return $this->success([], 'Address deleted successfully');
    }
}
