<?php

namespace App\Services;

use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;

class GrammarAnalysisRateLimiter
{
    public function __construct(
        private readonly SettingsService $settings,
    ) {}

    /**
     * @return array{allowed: bool, limit: int, remaining: int, resets_at: string, used: int}
     */
    public function check(?int $userId, string $ip): array
    {
        $limit = $userId !== null
            ? $this->settings->grammarToolUserDailyLimit()
            : $this->settings->grammarToolGuestDailyLimit();

        $key = $userId !== null
            ? 'grammar_analyze:user:'.$userId
            : 'grammar_analyze:guest:'.hash('sha256', $ip);

        $used = (int) Cache::get($key, 0);
        $remaining = max(0, $limit - $used);
        $resetsAt = Carbon::now('Asia/Ho_Chi_Minh')->endOfDay()->toIso8601String();

        return [
            'allowed' => $used < $limit,
            'limit' => $limit,
            'remaining' => $remaining,
            'resets_at' => $resetsAt,
            'used' => $used,
        ];
    }

    public function hit(?int $userId, string $ip): void
    {
        $key = $userId !== null
            ? 'grammar_analyze:user:'.$userId
            : 'grammar_analyze:guest:'.hash('sha256', $ip);

        $secondsUntilReset = max(60, Carbon::now('Asia/Ho_Chi_Minh')->diffInSeconds(
            Carbon::now('Asia/Ho_Chi_Minh')->endOfDay(),
            false,
        ));

        if (! Cache::has($key)) {
            Cache::put($key, 1, $secondsUntilReset);

            return;
        }

        Cache::increment($key);
    }
}
