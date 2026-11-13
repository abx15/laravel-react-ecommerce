<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    use ApiResponse;

    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'mobile' => 'nullable|string|max:20|unique:users,mobile',
        ]);

        // Public registration can only create a customer account.
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'mobile' => $validated['mobile'] ?? null,
            'password' => Hash::make($validated['password']),
            'user_type' => 'user',
            'status' => 'active',
        ]);

        $user->assignRole('user');
        $token = $user->createToken('auth_token')->plainTextToken;

        return $this->success([
            'user' => $user->load('roles'),
            'token' => $token,
        ], 'Account registered successfully', 201);
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if (!Auth::attempt($credentials)) {
            return $this->error('Invalid credentials', 401);
        }

        $user = User::where('email', $credentials['email'])->firstOrFail();

        if ($user->is_blocked || $user->status !== 'active') {
            Auth::logout();

            return $this->error('This account is blocked or inactive. Contact support.', 403);
        }

        $role = match ($user->user_type) {
            'superadmin' => 'super_admin',
            'user', 'seller', 'admin', 'super_admin' => $user->user_type,
            default => null,
        };

        if ($role) {
            // Keep the role relation aligned with the authoritative account type.
            $user->syncRoles($role === 'seller' ? ['user', 'seller'] : [$role]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return $this->success([
            'user' => $user->fresh()->load('roles'),
            'token' => $token,
        ], 'Login successful');
    }

    public function logout(Request $request)
    {
        $token = $request->user()->currentAccessToken();
        if ($token) {
            $token->delete();
        }

        return $this->success([], 'Logged out successfully');
    }

    public function user(Request $request)
    {
        return $this->success($request->user()->load('roles'));
    }
}
