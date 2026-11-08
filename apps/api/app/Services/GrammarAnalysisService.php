<?php

namespace App\Services;

use App\Models\Locale;
use App\Repositories\TenseRepository;
use Illuminate\Support\Str;

class GrammarAnalysisService extends BaseService
{
    public function __construct(
        private readonly GrammarTranslationService $translation,
        private readonly GrammarAnalysisHeuristic $heuristic,
        private readonly TenseRepository $tenses,
    ) {}

    /**
     * @return array{data: array<string, mixed>, meta: array<string, mixed>}
     */
    public function analyze(string $text, string $sourceLang, string $targetLang, string $mode, string $locale): array
    {
        $detected = $sourceLang === 'auto'
            ? $this->heuristic->detectLang($text)
            : $sourceLang;

        if ($targetLang === 'auto') {
            $targetLang = $this->resolveAutoTargetLang($detected);
        }

        $fullTranslation = null;
        $translationSource = 'placeholder';

        $full = $this->translation->translate($text, $detected, $targetLang);
        if ($full !== null) {
            $fullTranslation = $full['text'];
            $translationSource = $full['source'];
        }

        if ($fullTranslation === null) {
            $fullTranslation = $locale === 'vi'
                ? 'Chưa dịch được tự động — vẫn xem phân tích ngữ pháp bên dưới hoặc thử lại sau.'
                : 'Automatic translation unavailable — grammar analysis is still shown below.';
        }

        $sentences = $this->heuristic->splitSentences($text);
        $sentenceRows = [];
        $links = [];

        foreach ($sentences as $original) {
            $trimmed = trim($original);
            if ($trimmed === '') {
                continue;
            }

            $sentenceTranslation = null;
            if ($translationSource !== 'placeholder') {
                $part = $this->translation->translate($trimmed, $detected, $targetLang);
                $sentenceTranslation = $part['text'] ?? null;
            }
            if ($sentenceTranslation === null) {
                $sentenceTranslation = $locale === 'vi'
                    ? '—'
                    : '—';
            }

            $analysisSource = $detected === 'en' ? $trimmed : $sentenceTranslation;
            if ($detected === 'vi') {
                $analysis = [
                    'tense_slugs' => [],
                    'structure' => '—',
                    'grammar_notes_vi' => [
                        'Phân tích thì chi tiết hoạt động tốt nhất với câu tiếng Anh. Hãy thử nhập bản tiếng Anh hoặc bật AI sau này.',
                    ],
                ];
            } else {
                $analysis = $this->heuristic->analyzeEnglishSentence($analysisSource);
            }

            foreach ($analysis['tense_slugs'] as $slug) {
                $label = $this->tenseLabel($slug, $locale);
                if ($label !== null) {
                    $links[] = ['tense_slug' => $slug, 'label' => $label];
                }
            }

            $sentenceRows[] = [
                'original' => $trimmed,
                'translation' => $sentenceTranslation,
                'tense_slugs' => $analysis['tense_slugs'],
                'structure' => $analysis['structure'],
                'grammar_notes_vi' => $analysis['grammar_notes_vi'],
            ];
        }

        $links = collect($links)->unique('tense_slug')->values()->all();

        $summary = $locale === 'vi'
            ? 'Phân tích heuristic (chưa dùng OpenAI). Thì gợi ý dựa trên dấu hiệu trong câu tiếng Anh.'
            : 'Heuristic analysis (OpenAI not used). Tense hints are pattern-based on English sentences.';

        $data = [
            'version' => 1,
            'translation' => $fullTranslation,
            'translation_source' => $translationSource,
            'detected_source_lang' => $detected,
            'target_lang' => $targetLang,
            'summary_vi' => $summary,
            'provider' => 'stub',
            'capabilities' => [
                'translation' => $translationSource,
                'analysis' => 'heuristic',
            ],
            'sentences' => $sentenceRows,
            'keywords' => $this->extractKeywords($text, $detected),
            'links' => $links,
        ];

        return $this->envelope($data);
    }

    private function resolveAutoTargetLang(string $detected): string
    {
        foreach (Locale::activeCodes() as $code) {
            if ($code !== $detected) {
                return $code;
            }
        }

        return $detected === 'vi' ? 'en' : 'vi';
    }

    private function tenseLabel(string $slug, string $locale): ?string
    {
        try {
            $tense = $this->tenses->findBySlugWithGroup($slug);
            app()->setLocale($locale);

            return $tense->localized('name');
        } catch (\Throwable) {
            return Str::title(str_replace('-', ' ', $slug));
        }
    }

    /**
     * @return list<array{term: string, translation: string|null, part_of_speech: string|null, note_vi: string|null}>
     */
    private function extractKeywords(string $text, string $lang): array
    {
        if ($lang !== 'en') {
            return [];
        }

        preg_match_all('/\b[a-z]{4,}\b/i', $text, $matches);
        $words = array_unique(array_slice($matches[0] ?? [], 0, 8));

        return array_map(static fn (string $w) => [
            'term' => $w,
            'translation' => null,
            'part_of_speech' => null,
            'note_vi' => null,
        ], $words);
    }
}
