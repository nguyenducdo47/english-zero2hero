<?php

namespace App\Services\GrammarQuestion;

interface GrammarQuestionFeedAdapterInterface
{
    public function key(): string;

    /**
     * @return array{questions: list<array<string, mixed>>, errors: list<string>}
     */
    public function fetch(string $url): array;
}
