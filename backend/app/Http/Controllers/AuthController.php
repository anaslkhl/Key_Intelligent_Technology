<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password as PasswordRule;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register a new user
     */
    public function register(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users|max:255',
            'password' => ['required', 'confirmed', PasswordRule::min(8)->mixedCase()->numbers()->symbols()],
            'company_name' => 'nullable|string|max:255',
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'company_name' => $data['company_name'] ?? null,
            'role' => 'client',
        ]);

        // Generate email verification token
        // $user->sendEmailVerificationNotification();

        $token = $user->createToken('auth_token', ['*'], now()->addHours(24))->plainTextToken;

        return response()->json([
            'data' => [
                'user' => $user->only(['id', 'name', 'email', 'company_name', 'role']),
                'token' => $token,
                'token_type' => 'Bearer',
                'expires_in' => 86400, // 24 hours in seconds
            ],
            'message' => 'Registration successful. Please verify your email.',
            'status' => 201
        ], 201);
    }

    /**
     * Login user
     */
    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        // Rate limiting
        $key = 'login_attempts_' . $request->ip();
        if (RateLimiter::tooManyAttempts($key, 5)) {
            $seconds = RateLimiter::availableIn($key);
            throw ValidationException::withMessages([
                'email' => ['Too many login attempts. Please try again in ' . ceil($seconds / 60) . ' minutes.'],
            ]);
        }

        $user = User::where('email', $data['email'])->first();

        // Check if user exists and password matches
        if (!$user || !Hash::check($data['password'], $user->password)) {
            RateLimiter::hit($key, 300); // 5 minutes cooldown
            return response()->json([
                'message' => 'Invalid credentials',
                'status' => 401
            ], 401);
        }

        // Check if user is active
        if (!$user->is_active) {
            return response()->json([
                'message' => 'Your account has been deactivated. Please contact support.',
                'status' => 403
            ], 403);
        }

        // Check if email is verified (if you enable email verification)
        // if (is_null($user->email_verified_at)) {
        //     return response()->json([
        //         'message' => 'Please verify your email address before logging in.',
        //         'status' => 403
        //     ], 403);
        // }

        RateLimiter::clear($key);

        // Update last login
        $user->update([
            'last_login_at' => now(),
            'last_login_ip' => $request->ip(),
        ]);

        // Revoke previous tokens (optional - keep only one active session)
        // $user->tokens()->where('name', 'auth_token')->delete();

        $token = $user->createToken('auth_token', ['*'], now()->addHours(24))->plainTextToken;

        return response()->json([
            'data' => [
                'user' => $user->only(['id', 'name', 'email', 'company_name', 'role']),
                'token' => $token,
                'token_type' => 'Bearer',
                'expires_in' => 86400,
            ],
            'message' => 'Login successful',
            'status' => 200
        ]);
    }

    /**
     * Logout user
     */
    public function logout(Request $request)
    {
        // Delete current token only
        $request->user()->currentAccessToken()->delete();

        // Or delete all tokens (logout from all devices)
        // $request->user()->tokens()->delete();

        return response()->json([
            'message' => 'Logged out successfully',
            'status' => 200
        ]);
    }

    /**
     * Get authenticated user
     */
    public function me(Request $request)
    {
        return response()->json([
            'data' => $request->user()->only([
                'id', 'name', 'email', 'company_name', 'role', 
                'is_active', 'email_verified_at', 'last_login_at'
            ]),
            'status' => 200
        ]);
    }

    /**
     * Refresh token
     */
    public function refresh(Request $request)
    {
        $user = $request->user();
        
        // Delete current token
        $user->currentAccessToken()->delete();
        
        // Create new token
        $token = $user->createToken('auth_token', ['*'], now()->addHours(24))->plainTextToken;

        return response()->json([
            'data' => [
                'token' => $token,
                'token_type' => 'Bearer',
                'expires_in' => 86400,
            ],
            'message' => 'Token refreshed',
            'status' => 200
        ]);
    }

    /**
     * Forgot password
     */
    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email|exists:users']);

        $status = Password::sendResetLink(
            $request->only('email')
        );

        if ($status === Password::RESET_LINK_SENT) {
            return response()->json([
                'message' => 'Password reset link sent to your email.',
                'status' => 200
            ]);
        }

        return response()->json([
            'message' => 'Unable to send reset link.',
            'status' => 400
        ], 400);
    }

    /**
     * Reset password
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => ['required', 'confirmed', PasswordRule::min(8)->mixedCase()->numbers()->symbols()],
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                ])->save();
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json([
                'message' => 'Password reset successfully.',
                'status' => 200
            ]);
        }

        return response()->json([
            'message' => 'Invalid token or email.',
            'status' => 400
        ], 400);
    }

    /**
     * Change password (authenticated)
     */
    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'new_password' => ['required', 'confirmed', PasswordRule::min(8)->mixedCase()->numbers()->symbols()],
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'Current password is incorrect.',
                'status' => 400
            ], 400);
        }

        $user->update([
            'password' => Hash::make($request->new_password),
        ]);

        // Revoke all tokens after password change (security measure)
        $user->tokens()->delete();

        return response()->json([
            'message' => 'Password changed successfully. Please login again.',
            'status' => 200
        ]);
    }
}