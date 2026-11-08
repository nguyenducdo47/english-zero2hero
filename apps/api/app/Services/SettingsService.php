<?php

namespace App\Services;

use App\Models\SiteSetting;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Schema;

class SettingsService
{
    public const UNCHANGED = '__UNCHANGED__';

    private const CACHE_KEY = 'site_settings.resolved';

    /** @return array<string, array{group: string, secret: bool, env: string, default: mixed}> */
    public function registry(): array
    {
        return config('integration_settings.keys', []);
    }

    public function allowedGroups(): array
    {
        return config('integration_settings.groups', []);
    }

    /**
     * @return array<string, mixed>
     */
    public function resolveAll(): array
    {
        if (! Schema::hasTable('site_settings')) {
            return $this->resolveFromEnvOnly();
        }

        return Cache::remember(self::CACHE_KEY, 60, function () {
            $rows = SiteSetting::query()->get()->keyBy('key');
            $out = [];

            foreach ($this->registry() as $key => $meta) {
                $out[$key] = $this->readValue($key, $meta, $rows->get($key));
            }

            return $out;
        });
    }

    public function forgetCache(): void
    {
        Cache::forget(self::CACHE_KEY);
    }

    /**
     * @return array<string, array{value: mixed, secret: bool, configured: bool}>
     */
    public function getGroupForAdmin(string $group): array
    {
        if (! in_array($group, $this->allowedGroups(), true)) {
            abort(404);
        }

        $resolved = $this->resolveAll();
        $payload = [];

        foreach ($this->registry() as $key => $meta) {
            if ($meta['group'] !== $group) {
                continue;
            }

            $short = $this->shortKey($key);
            $value = $resolved[$key] ?? null;
            $configured = ($value !== null && $value !== '');

            if ($meta['secret']) {
                $payload[$short] = [
                    'value' => null,
                    'masked' => $configured ? '••••••••' : null,
                    'secret' => true,
                    'configured' => $configured,
                ];
            } else {
                $payload[$short] = [
                    'value' => $value,
                    'secret' => false,
                    'configured' => $configured,
                ];
            }
        }

        return $payload;
    }

    /**
     * @param  array<string, mixed>  $input  short keys → values
     */
    public function updateGroup(string $group, array $input): void
    {
        if (! in_array($group, $this->allowedGroups(), true)) {
            abort(404);
        }

        foreach ($this->registry() as $key => $meta) {
            if ($meta['group'] !== $group) {
                continue;
            }

            $short = $this->shortKey($key);
            if (! array_key_exists($short, $input)) {
                continue;
            }

            $raw = $input[$short];

            if ($meta['secret']) {
                if ($raw === null || $raw === '' || $raw === self::UNCHANGED) {
                    continue;
                }
                $stored = Crypt::encryptString((string) $raw);
                SiteSetting::query()->updateOrCreate(
                    ['key' => $key],
                    [
                        'group' => $group,
                        'is_secret' => true,
                        'value' => $stored,
                    ]
                );
            } else {
                SiteSetting::query()->updateOrCreate(
                    ['key' => $key],
                    [
                        'group' => $group,
                        'is_secret' => false,
                        'value' => $raw === null ? null : (string) $raw,
                    ]
                );
            }
        }

        $this->forgetCache();
        $this->applyToConfig();
    }

    public function applyToConfig(): void
    {
        $values = $this->resolveAll();

        config([
            'mail.default' => $values['mail.mailer'] ?? config('mail.default'),
            'mail.mailers.smtp.host' => $values['mail.host'] ?? config('mail.mailers.smtp.host'),
            'mail.mailers.smtp.port' => $values['mail.port'] ?? config('mail.mailers.smtp.port'),
            'mail.mailers.smtp.username' => $values['mail.username'] ?? config('mail.mailers.smtp.username'),
            'mail.mailers.smtp.password' => $values['mail.password'] ?? config('mail.mailers.smtp.password'),
            'mail.from.address' => $values['mail.from.address'] ?? config('mail.from.address'),
            'mail.from.name' => $values['mail.from.name'] ?? config('mail.from.name', config('app.name')),
            'services.google.oauth_enabled' => $this->isGoogleOAuthEnabled(),
            'services.google.client_id' => $values['google.client_id'] ?? config('services.google.client_id'),
            'services.google.client_secret' => $values['google.client_secret'] ?? config('services.google.client_secret'),
            'services.google.redirect' => $values['google.redirect']
                ?? config('services.google.redirect')
                ?? (rtrim((string) config('app.url'), '/').'/api/v1/auth/google/callback'),
            'grammar_tool.enabled' => $this->grammarToolBool($values, 'grammar_tool.enabled', 'grammar_tool.enabled'),
            'grammar_tool.guest_daily_limit' => $this->grammarToolInt($values, 'grammar_tool.guest_daily_limit', 'grammar_tool.guest_daily_limit'),
            'grammar_tool.user_daily_limit' => $this->grammarToolInt($values, 'grammar_tool.user_daily_limit', 'grammar_tool.user_daily_limit'),
            'grammar_tool.libretranslate_enabled' => $this->grammarToolBool($values, 'grammar_tool.libretranslate_enabled', 'grammar_tool.libretranslate_enabled'),
            'grammar_tool.libretranslate_url' => $values['grammar_tool.libretranslate_url']
                ?? config('grammar_tool.libretranslate_url'),
            'grammar_tool.libretranslate_api_key' => $values['grammar_tool.libretranslate_api_key']
                ?? config('grammar_tool.libretranslate_api_key'),
        ]);
    }

    public function isGrammarToolEnabled(): bool
    {
        return (bool) config('grammar_tool.enabled', true);
    }

    public function grammarToolGuestDailyLimit(): int
    {
        return max(0, (int) config('grammar_tool.guest_daily_limit', 10));
    }

    public function grammarToolUserDailyLimit(): int
    {
        return max(0, (int) config('grammar_tool.user_daily_limit', 50));
    }

    public function isGrammarToolLibreTranslateEnabled(): bool
    {
        return (bool) config('grammar_tool.libretranslate_enabled', true);
    }

    public function grammarToolLibreTranslateUrl(): string
    {
        return (string) config('grammar_tool.libretranslate_url', 'https://libretranslate.com/translate');
    }

    public function grammarToolLibreTranslateApiKey(): string
    {
        return (string) config('grammar_tool.libretranslate_api_key', '');
    }

    /**
     * @param  array<string, mixed>  $values
     */
    private function grammarToolBool(array $values, string $key, string $configKey): bool
    {
        $raw = $values[$key] ?? null;
        if ($raw === null || $raw === '') {
            return (bool) config($configKey);
        }

        return self::parseBool($raw);
    }

    /**
     * @param  array<string, mixed>  $values
     */
    private function grammarToolInt(array $values, string $key, string $configKey): int
    {
        $raw = $values[$key] ?? null;
        if ($raw === null || $raw === '') {
            return (int) config($configKey);
        }

        return max(0, (int) $raw);
    }

    public function isGoogleOAuthEnabled(): bool
    {
        $values = $this->resolveAll();
        $raw = $values['google.oauth_enabled'] ?? null;
        if ($raw === null || $raw === '') {
            return (bool) config('services.google.oauth_enabled', true);
        }

        return self::parseBool($raw);
    }

    public static function parseBool(mixed $value): bool
    {
        if (is_bool($value)) {
            return $value;
        }

        return in_array(strtolower((string) $value), ['1', 'true', 'yes', 'on'], true);
    }

    private function shortKey(string $key): string
    {
        $parts = explode('.', $key);

        return (string) end($parts);
    }

    /**
     * @param  array{group: string, secret: bool, env: string, default: mixed}  $meta
     */
    private function readValue(string $key, array $meta, ?SiteSetting $row): mixed
    {
        if ($row !== null && $row->value !== null && $row->value !== '') {
            if ($meta['secret']) {
                try {
                    return Crypt::decryptString($row->value);
                } catch (\Throwable) {
                    return $this->envFallback($meta);
                }
            }

            return $row->value;
        }

        return $this->envFallback($meta);
    }

    /**
     * @param  array{env: string, default: mixed}  $meta
     */
    private function envFallback(array $meta): mixed
    {
        $env = env($meta['env']);

        if ($env !== null && $env !== '') {
            return $env;
        }

        $default = $meta['default'] ?? null;
        if ($default === null && $meta['env'] === 'MAIL_FROM_NAME') {
            return config('app.name');
        }

        return $default;
    }

    /**
     * @return array<string, mixed>
     */
    private function resolveFromEnvOnly(): array
    {
        $out = [];
        foreach ($this->registry() as $key => $meta) {
            $out[$key] = $this->envFallback($meta);
        }

        return $out;
    }
}
