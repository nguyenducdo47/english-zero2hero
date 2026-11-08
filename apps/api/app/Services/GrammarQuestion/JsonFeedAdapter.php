<?php

namespace App\Services\GrammarQuestion;

class JsonFeedAdapter implements GrammarQuestionFeedAdapterInterface
{
    public function key(): string
    {
        return 'json_feed';
    }

    /**
     * @return array{questions: list<array<string, mixed>>, errors: list<string>}
     */
    public function fetch(string $url): array
    {
        $whitelist = GrammarQuestionHttpClient::assertWhitelisted($url);
        if ($whitelist !== null) {
            return ['questions' => [], 'errors' => [$whitelist]];
        }

        $response = GrammarQuestionHttpClient::getBody($url);
        if (! $response['ok']) {
            return ['questions' => [], 'errors' => [(string) $response['error']]];
        }

        $decoded = json_decode($response['body'], true);
        if (! is_array($decoded)) {
            return ['questions' => [], 'errors' => ['Invalid JSON']];
        }

        $items = $decoded['questions'] ?? null;
        if (! is_array($items)) {
            return ['questions' => [], 'errors' => ['Missing questions array']];
        }

        /** @var list<array<string, mixed>> $normalized */
        $normalized = array_values(array_filter($items, 'is_array'));

        return ['questions' => $normalized, 'errors' => []];
    }
}
