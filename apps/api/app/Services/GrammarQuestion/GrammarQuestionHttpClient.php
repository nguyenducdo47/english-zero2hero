<?php

namespace App\Services\GrammarQuestion;

use Illuminate\Support\Facades\Http;

class GrammarQuestionHttpClient
{
    public static function assertWhitelisted(string $url): ?string
    {
        $host = parse_url($url, PHP_URL_HOST) ?: '';
        $allowed = config('e2h.crawl_whitelist', []);
        if ($allowed !== [] && ! in_array($host, $allowed, true)) {
            return "Domain {$host} not in E2H_CRAWL_WHITELIST";
        }

        return null;
    }

    public static function getBody(string $url): array
    {
        $timeout = (int) config('grammar.crawl_timeout', 30);
        $response = Http::timeout($timeout)
            ->withHeaders([
                'User-Agent' => (string) config('grammar.crawl_user_agent', 'EnglishZero2Hero/1.0'),
            ])
            ->get($url);

        if (! $response->successful()) {
            return ['ok' => false, 'error' => "HTTP {$response->status()} for {$url}", 'body' => ''];
        }

        return ['ok' => true, 'error' => null, 'body' => $response->body()];
    }
}
