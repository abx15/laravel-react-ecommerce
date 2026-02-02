<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    use ApiResponse;

    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'user_type' => 'sometimes|in:user,seller',
        ]);

        $userType = $validated['user_type'] ?? 'user';

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'user_type' => $userType,
        ]);

        // Assign role based on user type
        $role = match($userType) {
            'seller' => 'seller',
            'admin' => 'admin',
            'super_admin' => 'super_admin',
            default => 'user'
        };
        $user->assignRole($role);

        $token = $user->createToken('auth_token')->plainTextToken;

        return $this->success([
            'user' => $user->load('roles'),
            'token' => $token,
        ], 'User registered successfully', 201);
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($credentials)) {
            return $this->error('Invalid credentials', 401);
        }

        $user = User::where('email', $request->email)->firstOrFail();
        $token = $user->createToken('auth_token')->plainTextToken;

        return $this->success([
            'user' => $user->load('roles'),
            'token' => $token,
        ], 'Login successful');
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return $this->success([], 'Logged out successfully');
    }

    public function user(Request $request)
    {
        return $this->success($request->user()->load('roles'));
    }
}
