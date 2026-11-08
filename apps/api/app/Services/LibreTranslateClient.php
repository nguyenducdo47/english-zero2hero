<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class LibreTranslateClient
{
    public function __construct(
        private readonly SettingsService $settings,
    ) {}

    public function isConfigured(): bool
    {
        if (! $this->settings->isGrammarToolLibreTranslateEnabled()) {
            return false;
        }

        $url = strtolower(trim($this->settings->grammarToolLibreTranslateUrl()));
        if ($url === '') {
            return false;
        }

        $hosted = str_contains($url, 'libretranslate.com');
        $hasKey = trim($this->settings->grammarToolLibreTranslateApiKey()) !== '';

        return ! $hosted || $hasKey;
    }

    public function translate(string $text, string $source, string $target): ?string
    {
        if (! $this->isConfigured()) {
            return null;
        }

        $url = trim($this->settings->grammarToolLibreTranslateUrl());
        if ($url === '') {
            return null;
        }

        $timeout = (int) config('grammar_tool.libretranslate_timeout', 12);

        try {
            $payload = [
                'q' => $text,
                'source' => $source,
                'target' => $target,
                'format' => 'text',
            ];

            $apiKey = trim($this->settings->grammarToolLibreTranslateApiKey());
            if ($apiKey !== '') {
                $payload['api_key'] = $apiKey;
            }

            $response = Http::asJson()
                ->timeout($timeout)
                ->post($url, $payload);

            if (! $response->successful()) {
                Log::warning('LibreTranslate non-2xx', ['status' => $response->status()]);

                return null;
            }

            $translated = $response->json('translatedText');
            if (! is_string($translated) || $translated === '') {
                return null;
            }

            return $translated;
        } catch (\Throwable $e) {
            Log::warning('LibreTranslate request failed', ['message' => $e->getMessage()]);

            return null;
        }
    }
}
