<?php

namespace App\Services;

use App\Models\GrammarQuestionFeed;
use App\Models\Question;
use App\Models\TenseGroup;
use App\Repositories\GrammarQuestionFeedRepository;
use App\Services\GrammarQuestion\GrammarQuestionFeedAdapterRegistry;
use App\Services\GrammarQuestion\JsonFeedAdapter;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Sleep;

class GrammarQuestionImportService
{
    public const CACHE_KEY_LAST = 'grammar_question_crawl_last';

    public function __construct(
        private readonly ContentTranslationImporter $importer,
        private readonly GrammarQuestionFeedRepository $feeds,
        private readonly GrammarQuestionFeedAdapterRegistry $adapters,
        private readonly JsonFeedAdapter $jsonFeedAdapter,
        private readonly GrammarQuestionTenseInferrer $tenseInferrer,
    ) {}

    /**
     * @return array{imported: int, skipped: int, errors: list<string>, feeds: list<array<string, mixed>>}
     */
    public function importAllFeeds(): array
    {
        $totals = ['imported' => 0, 'skipped' => 0, 'errors' => [], 'feeds' => []];
        $delayMs = max(0, (int) config('grammar.crawl_delay_ms', 500));

        foreach ($this->feeds->enabledOrdered() as $feed) {
            $result = $this->importFromFeed($feed);
            $totals['feeds'][] = array_merge([
                'feed_id' => $feed->id,
                'name' => $feed->name,
                'url' => $feed->feed_url,
            ], $result);
            $totals['imported'] += $result['imported'];
            $totals['skipped'] += $result['skipped'];
            $totals['errors'] = array_merge($totals['errors'], $result['errors']);
            if ($delayMs > 0) {
                Sleep::usleep($delayMs * 1000);
            }
        }

        foreach (config('grammar.question_feed_urls', []) as $url) {
            $url = trim((string) $url);
            if ($url === '') {
                continue;
            }

            $fetched = $this->jsonFeedAdapter->fetch($url);
            $result = $this->importQuestionItems(
                $fetched['questions'],
                null,
                $fetched['errors'],
            );
            $totals['feeds'][] = array_merge(['url' => $url, 'adapter' => 'json_feed'], $result);
            $totals['imported'] += $result['imported'];
            $totals['skipped'] += $result['skipped'];
            $totals['errors'] = array_merge($totals['errors'], $result['errors']);
        }

        foreach (config('grammar.local_question_feed_paths', []) as $local) {
            if (! is_string($local) || $local === '' || ! is_readable($local)) {
                continue;
            }

            $raw = file_get_contents($local);
            $decoded = json_decode($raw ?: '', true);
            if (! is_array($decoded)) {
                $totals['errors'][] = "Invalid JSON in local feed: {$local}";

                continue;
            }

            $items = is_array($decoded['questions'] ?? null) ? $decoded['questions'] : [];
            $result = $this->importQuestionItems($items, null, []);
            $totals['feeds'][] = array_merge(['url' => 'file:'.$local], $result);
            $totals['imported'] += $result['imported'];
            $totals['skipped'] += $result['skipped'];
            $totals['errors'] = array_merge($totals['errors'], $result['errors']);
        }

        return $totals;
    }

    /**
     * @return array{imported: int, skipped: int, errors: list<string>}
     */
    public function importFromFeed(GrammarQuestionFeed $feed): array
    {
        try {
            $adapter = $this->adapters->resolve($feed->adapter);
            $fetched = $adapter->fetch($feed->feed_url);
            $result = $this->importQuestionItems(
                $fetched['questions'],
                $feed->default_tense_group_slug,
                $fetched['errors'],
            );

            $feed->update([
                'last_fetched_at' => now(),
                'last_result' => $result,
            ]);

            return $result;
        } catch (\Throwable $e) {
            Log::warning('Grammar feed import failed', [
                'feed_id' => $feed->id,
                'message' => $e->getMessage(),
            ]);
            $result = ['imported' => 0, 'skipped' => 0, 'errors' => [$e->getMessage()]];
            $feed->update([
                'last_fetched_at' => now(),
                'last_result' => $result,
            ]);

            return $result;
        }
    }

    /**
     * @param  list<array<string, mixed>>  $items
     * @param  list<string>  $prefixedErrors
     * @return array{imported: int, skipped: int, errors: list<string>}
     */
    public function importQuestionItems(array $items, ?string $defaultGroupSlug, array $prefixedErrors): array
    {
        $groupIds = TenseGroup::query()->pluck('id', 'slug')->all();
        $imported = 0;
        $skipped = 0;
        $errors = $prefixedErrors;

        foreach ($items as $index => $item) {
            if (! is_array($item)) {
                $errors[] = "Row {$index}: not an object";

                continue;
            }

            if (($item['tense_group_slug'] ?? '') === '' && $defaultGroupSlug) {
                $item['tense_group_slug'] = $defaultGroupSlug;
            }

            try {
                $result = $this->importOne($item, $groupIds);
                if ($result === 'imported') {
                    $imported++;
                } else {
                    $skipped++;
                }
            } catch (\Throwable $e) {
                $errors[] = "Row {$index}: ".$e->getMessage();
            }
        }

        return compact('imported', 'skipped', 'errors');
    }

    /**
     * @param  array<string, mixed>  $item
     * @param  array<string, int>  $groupIds
     */
    private function importOne(array $item, array $groupIds): string
    {
        $slug = (string) ($item['tense_group_slug'] ?? '');
        if ($slug === '' || ! isset($groupIds[$slug])) {
            throw new \InvalidArgumentException("Unknown tense_group_slug: {$slug}");
        }

        $promptEn = trim((string) ($item['prompt_en'] ?? ''));
        if ($promptEn === '') {
            throw new \InvalidArgumentException('Missing prompt_en');
        }

        $type = (string) ($item['type'] ?? '');
        if (! in_array($type, ['multiple_choice', 'fill_blank'], true)) {
            throw new \InvalidArgumentException("Invalid type: {$type}");
        }

        $groupId = $groupIds[$slug];
        $hash = $this->sourceHash($groupId, $promptEn);

        if (Question::query()->where('source_hash', $hash)->exists()) {
            return 'skipped';
        }

        $payload = $type === 'multiple_choice'
            ? [
                'options' => $item['options'] ?? [],
                'correct_index' => (int) ($item['correct_index'] ?? 0),
            ]
            : [
                'correct_answers' => $item['correct_answers'] ?? [],
                'synonyms' => $item['synonyms'] ?? [],
            ];

        $tenseSlug = isset($item['tense_slug']) ? (string) $item['tense_slug'] : null;
        if ($tenseSlug === '' || $tenseSlug === null) {
            $explain = (string) ($item['explanation_vi'] ?? '').' '.(string) ($item['explanation_en'] ?? '');
            $tenseSlug = $this->tenseInferrer->inferFromText($explain);
        }

        $question = Question::query()->create([
            'tense_group_id' => $groupId,
            'tense_id' => $this->tenseInferrer->resolveTenseId($tenseSlug),
            'exam_id' => null,
            'type' => $type,
            'payload' => $payload,
            'sort_order' => (int) ($item['sort_order'] ?? 0),
            'source_hash' => $hash,
        ]);

        $this->importer->apply($question, $this->importer->mapFromContent($item, ['prompt', 'explanation']));

        if ($question->tense_id === null) {
            $question->update([
                'tense_id' => $this->tenseInferrer->resolveTenseId(
                    $this->tenseInferrer->inferFromQuestion($question->fresh() ?? $question),
                ),
            ]);
        }

        return 'imported';
    }

    public function sourceHash(int $tenseGroupId, string $promptEn): string
    {
        $normalized = strtolower(trim(preg_replace('/\s+/', ' ', $promptEn) ?? ''));

        return hash('sha256', $tenseGroupId.'|'.$normalized);
    }
}
