<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\UserRepository;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Contracts\User as SocialiteUser;

class AuthService
{
    public function __construct(
        private readonly UserRepository $users,
    ) {}

    /**
     * @return array{token: string, user: User}
     */
    public function register(array $validated): array
    {
        $user = $this->users->createUser([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'],
        ]);

        return [
            'token' => $user->createToken('api')->plainTextToken,
            'user' => $user,
        ];
    }

    /**
     * @return array{token: string, user: User}
     */
    public function login(array $validated): array
    {
        $user = $this->users->findByEmail($validated['email']);

        if (! $user || ! Hash::check($validated['password'], $user->getAuthPassword())) {
            throw new HttpResponseException(response()->json([
                'message' => __('api.invalid_credentials'),
            ], 422));
        }

        return [
            'token' => $user->createToken('api')->plainTextToken,
            'user' => $user,
        ];
    }

    /**
     * @return array{token: string, user: User}
     */
    public function devLogin(): array
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
                'is_admin' => true,
            ]
        );

        if (! $user->is_admin) {
            $user->forceFill(['is_admin' => true])->save();
        }

        return [
            'token' => $user->createToken('dev')->plainTextToken,
            'user' => $user,
        ];
    }

    public function issueTokenForGoogleUser(SocialiteUser $googleUser): string
    {
        $email = $googleUser->getEmail();
        $profile = [
            'name' => $googleUser->getName() ?? $googleUser->getNickname() ?? 'Learner',
            'google_id' => $googleUser->getId(),
            'avatar' => $googleUser->getAvatar(),
            'email_verified_at' => now(),
        ];

        $user = $this->users->findByEmail($email);
        if ($user) {
            $user->fill($profile);
            $user->save();
        } else {
            $user = $this->users->createUser(array_merge(['email' => $email], $profile));
        }

        return $user->createToken('api')->plainTextToken;
    }

    public function frontendAuthCallbackUrl(string $token): string
    {
        $base = rtrim((string) config('e2h.frontend_url'), '/');

        return $base.'/auth/callback?'.http_build_query(['token' => $token]);
    }

    public function frontendLoginUrl(?string $reason = null): string
    {
        $base = rtrim((string) config('e2h.frontend_url'), '/').'/login';
        if ($reason === null || $reason === '') {
            return $base;
        }

        return $base.'?'.http_build_query(['oauth' => $reason]);
    }
}
