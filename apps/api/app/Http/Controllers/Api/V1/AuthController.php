<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Auth\LoginRequest;
use App\Http\Requests\Api\V1\Auth\RegisterRequest;
use App\Services\AuthService;
use App\Services\SettingsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;

/**
 * @OA\Tag(name="Auth", description="Authentication")
 */
class AuthController extends Controller
{
    public function __construct(
        private readonly AuthService $auth,
        private readonly SettingsService $settings,
    ) {}

    /**
     * @OA\Post(path="/api/v1/auth/register", tags={"Auth"}, summary="Email/password sign-up")
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $result = $this->auth->register($request->validated());

        return response()->json($result, 201);
    }

    /**
     * @OA\Post(path="/api/v1/auth/login", tags={"Auth"}, summary="Email/password sign-in")
     */
    public function login(LoginRequest $request): JsonResponse
    {
        return response()->json($this->auth->login($request->validated()));
    }

    public function devLogin(): JsonResponse
    {
        return response()->json($this->auth->devLogin());
    }

    public function googleStatus(): JsonResponse
    {
        $this->settings->applyToConfig();

        return response()->json([
            'data' => [
                'enabled' => $this->settings->isGoogleOAuthEnabled(),
            ],
        ]);
    }

    public function googleRedirect(): JsonResponse
    {
        $this->settings->applyToConfig();
        if (! $this->settings->isGoogleOAuthEnabled()) {
            return response()->json(['message' => 'Google sign-in is disabled.'], 403);
        }

        $url = Socialite::driver('google')
            ->stateless()
            ->redirect()
            ->getTargetUrl();

        return response()->json(['url' => $url]);
    }

    /**
     * @OA\Get(path="/api/v1/auth/google/callback", tags={"Auth"}, summary="Google OAuth callback")
     */
    public function googleCallback(Request $request): RedirectResponse|JsonResponse
    {
        $this->settings->applyToConfig();
        if (! $this->settings->isGoogleOAuthEnabled()) {
            return redirect()->away($this->auth->frontendLoginUrl('failed'));
        }

        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
            $token = $this->auth->issueTokenForGoogleUser($googleUser);
        } catch (\Throwable) {
            return redirect()->away($this->auth->frontendLoginUrl('failed'));
        }

        if ($request->expectsJson()) {
            return response()->json([
                'token' => $token,
                'redirect' => $this->auth->frontendAuthCallbackUrl($token),
            ]);
        }

        return redirect()->away($this->auth->frontendAuthCallbackUrl($token));
    }

    /**
     * @OA\Get(path="/api/v1/auth/me", tags={"Auth"}, security={{"sanctum":{}}})
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'data' => $request->user()->load('roles:id,slug,name,permissions'),
        ]);
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
