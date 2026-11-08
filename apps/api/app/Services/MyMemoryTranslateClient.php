<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MyMemoryTranslateClient
{
    private const BASE_URL = 'https://api.mymemory.translated.net/get';

    public function translate(string $text, string $source, string $target): ?string
    {
        if (! config('grammar_tool.mymemory_fallback', true)) {
            return null;
        }

        $source = $this->normalizeLang($source);
        $target = $this->normalizeLang($target);
        if ($source === null || $target === null || $source === $target) {
            return null;
        }

        $trimmed = trim($text);
        if ($trimmed === '') {
            return null;
        }

        $timeout = (int) config('grammar_tool.mymemory_timeout', 12);
        $query = [
            'q' => $trimmed,
            'langpair' => "{$source}|{$target}",
        ];

        $contact = trim((string) config('grammar_tool.mymemory_contact_email', ''));
        if ($contact !== '') {
            $query['de'] = $contact;
        }

        try {
            $response = Http::timeout($timeout)->get(self::BASE_URL, $query);

            if (! $response->successful()) {
                Log::warning('MyMemory non-2xx', ['status' => $response->status()]);

                return null;
            }

            $status = $response->json('responseStatus');
            if ($status !== 200 && $status !== '200') {
                Log::warning('MyMemory bad responseStatus', ['status' => $status]);

                return null;
            }

            $translated = $response->json('responseData.translatedText');
            if (! is_string($translated) || $translated === '') {
                return null;
            }

            if (stripos($translated, 'MYMEMORY WARNING') !== false) {
                return null;
            }

            return $translated;
        } catch (\Throwable $e) {
            Log::warning('MyMemory request failed', ['message' => $e->getMessage()]);

            return null;
        }
    }

    private function normalizeLang(string $lang): ?string
    {
        $lang = strtolower(trim($lang));
        if ($lang === '' || $lang === 'auto') {
            return null;
        }

        if (str_contains($lang, '-')) {
            $lang = explode('-', $lang, 2)[0];
        }

        if (! preg_match('/^[a-z]{2,3}$/', $lang)) {
            return null;
        }

        return $lang;
    }
}
