<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

/**
 * @OA\Tag(name="Auth", description="Authentication")
 */
class AuthController extends Controller
{
    /**
     * @OA\Get(path="/api/v1/auth/google/redirect", tags={"Auth"}, summary="Google OAuth redirect URL")
     */
    /**
     * Local-only: issue a Sanctum token without Google OAuth (for UI dev login).
     */
    public function devLogin(): JsonResponse
    {
        if (! app()->environment('local')) {
            abort(404);
        }

        $user = User::query()->firstOrCreate(
            ['email' => 'dev@english-zero2hero.local'],
            [
                'name' => 'Dev Learner',
                'password' => Hash::make(Str::random(32)),
                'email_verified_at' => now(),
            ]
        );

        $token = $user->createToken('dev')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user,
        ]);
    }

    public function googleRedirect(): JsonResponse
    {
        $url = Socialite::driver('google')
            ->stateless()
            ->redirect()
            ->getTargetUrl();

        return response()->json(['url' => $url]);
    }

    /**
     * @OA\Get(path="/api/v1/auth/google/callback", tags={"Auth"}, summary="Google OAuth callback")
     */
    public function googleCallback(Request $request): JsonResponse
    {
        $googleUser = Socialite::driver('google')->stateless()->user();

        $user = User::query()->updateOrCreate(
            ['email' => $googleUser->getEmail()],
            [
                'name' => $googleUser->getName() ?? $googleUser->getNickname() ?? 'Learner',
                'google_id' => $googleUser->getId(),
                'avatar' => $googleUser->getAvatar(),
                'password' => Hash::make(Str::random(32)),
                'email_verified_at' => now(),
            ]
        );

        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user,
            'frontend_redirect' => config('e2h.frontend_url').'/auth/callback?token='.$token,
        ]);
    }

    /**
     * @OA\Get(path="/api/v1/auth/me", tags={"Auth"}, security={{"sanctum":{}}})
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json(['data' => $request->user()]);
    }

    /**
     * @OA\Post(path="/api/v1/auth/logout", tags={"Auth"}, security={{"sanctum":{}}})
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json(['message' => __('api.logged_out')]);
    }
}
