<?php

namespace App\Services;

use App\Models\Question;
use App\Models\Tense;
use Illuminate\Support\Str;

class GrammarQuestionTenseInferrer
{
    /** Longest phrases first to avoid partial matches. */
    private const TENSE_PHRASES = [
        'present perfect continuous',
        'past perfect continuous',
        'future perfect continuous',
        'present perfect',
        'past perfect',
        'future perfect',
        'present continuous',
        'past continuous',
        'future continuous',
        'present simple',
        'past simple',
        'future simple',
    ];

    /** @var array<string, string> */
    private const PHRASE_TO_SLUG = [
        'present perfect continuous' => 'present-perfect-continuous',
        'past perfect continuous' => 'past-perfect-continuous',
        'future perfect continuous' => 'future-perfect-continuous',
        'present perfect' => 'present-perfect',
        'past perfect' => 'past-perfect',
        'future perfect' => 'future-perfect',
        'present continuous' => 'present-continuous',
        'past continuous' => 'past-continuous',
        'future continuous' => 'future-continuous',
        'present simple' => 'present-simple',
        'past simple' => 'past-simple',
        'future simple' => 'future-simple',
    ];

    public function inferFromText(string $text): ?string
    {
        $haystack = strtolower($text);
        if ($haystack === '') {
            return null;
        }

        if (preg_match('/→\s*([a-z][a-z\s]+)/u', $haystack, $m)) {
            $tail = trim($m[1], " \t\n\r\0\x0B.");
            $slug = $this->phraseToSlug($tail);
            if ($slug !== null) {
                return $slug;
            }
        }

        foreach (self::TENSE_PHRASES as $phrase) {
            if (str_contains($haystack, $phrase)) {
                return self::PHRASE_TO_SLUG[$phrase];
            }
        }

        return null;
    }

    public function inferFromQuestion(Question $question): ?string
    {
        $parts = [];
        foreach (['vi', 'en'] as $locale) {
            $explanation = $question->localized('explanation', null, $locale);
            if (is_string($explanation) && $explanation !== '') {
                $parts[] = $explanation;
            }
        }

        return $this->inferFromText(implode(' ', $parts));
    }

    public function resolveTenseId(?string $tenseSlug): ?int
    {
        if ($tenseSlug === null || $tenseSlug === '') {
            return null;
        }

        $id = Tense::query()->where('slug', $tenseSlug)->value('id');

        return $id !== null ? (int) $id : null;
    }

    private function phraseToSlug(string $phrase): ?string
    {
        $phrase = strtolower(trim(preg_replace('/\s+/', ' ', $phrase) ?? ''));

        foreach (self::TENSE_PHRASES as $candidate) {
            if (str_starts_with($phrase, $candidate)) {
                return self::PHRASE_TO_SLUG[$candidate];
            }
        }

        $slug = Str::slug($phrase);

        return Tense::query()->where('slug', $slug)->exists() ? $slug : null;
    }
}
