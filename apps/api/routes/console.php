<?php

use App\Jobs\CrawlGrammarQuestionsJob;
use App\Models\Question;
use App\Models\Tense;
use App\Models\TenseGroup;
use App\Services\GrammarQuestionTenseInferrer;
use App\Services\ContentTranslationImporter;
use App\Services\GrammarQuestionImportService;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('grammar:import-questions {--queue : Dispatch to queue instead of running synchronously}', function () {
    if ($this->option('queue')) {
        CrawlGrammarQuestionsJob::dispatch();
        $this->info('CrawlGrammarQuestionsJob queued.');

        return 0;
    }

    /** @var GrammarQuestionImportService $import */
    $import = app(GrammarQuestionImportService::class);
    $result = $import->importAllFeeds();

    Cache::put(GrammarQuestionImportService::CACHE_KEY_LAST, [
        'finished_at' => now()->toIso8601String(),
        'imported' => $result['imported'],
        'skipped' => $result['skipped'],
        'errors' => $result['errors'],
        'feeds' => $result['feeds'],
    ], now()->addDays(30));

    $this->info("Imported: {$result['imported']}, skipped: {$result['skipped']}");
    foreach ($result['errors'] as $error) {
        $this->warn($error);
    }

    return 0;
})->purpose('Import grammar quiz questions from configured JSON feeds');

Artisan::command('grammar:sync-quiz-translations', function () {
    /** @var GrammarQuestionImportService $import */
    $import = app(GrammarQuestionImportService::class);
    $importer = new ContentTranslationImporter;
    $groupIds = TenseGroup::query()->pluck('id', 'slug')->all();
    $updated = 0;
    $missing = 0;

    foreach (config('grammar.local_question_feed_paths', []) as $path) {
        if (! is_string($path) || ! is_readable($path)) {
            continue;
        }
        $decoded = json_decode(file_get_contents($path) ?: '', true);
        if (! is_array($decoded['questions'] ?? null)) {
            $this->warn("No questions in {$path}");

            continue;
        }
        foreach ($decoded['questions'] as $item) {
            if (! is_array($item)) {
                continue;
            }
            $slug = (string) ($item['tense_group_slug'] ?? '');
            $promptEn = trim((string) ($item['prompt_en'] ?? ''));
            if ($slug === '' || $promptEn === '' || ! isset($groupIds[$slug])) {
                continue;
            }
            $hash = $import->sourceHash((int) $groupIds[$slug], $promptEn);
            $question = Question::query()->where('source_hash', $hash)->first();
            if (! $question) {
                $missing++;

                continue;
            }
            $importer->apply($question, $importer->mapFromContent($item, ['prompt', 'explanation']));
            $updated++;
        }
    }

    $this->info("Updated translations: {$updated}, not found in DB: {$missing}");

    return 0;
})->purpose('Refresh VI/EN question translations from local JSON feeds (no re-import)');

Artisan::command('grammar:replace-bank-pool {--force : Skip confirmation}', function () {
    if (! $this->option('force') && ! $this->confirm('Delete all grammar pool questions except packages/content/quiz-questions.json, then re-import?')) {
        return 0;
    }

    /** @var GrammarQuestionImportService $import */
    $import = app(GrammarQuestionImportService::class);
    $groupIds = TenseGroup::query()->pluck('id', 'slug')->all();
    $keep = [];
    $seedPath = config('grammar.local_question_feed_path');
    if (is_string($seedPath) && is_readable($seedPath)) {
        $seed = json_decode(file_get_contents($seedPath) ?: '', true);
        foreach (is_array($seed['questions'] ?? null) ? $seed['questions'] : [] as $item) {
            if (! is_array($item)) {
                continue;
            }
            $slug = (string) ($item['tense_group_slug'] ?? '');
            $promptEn = trim((string) ($item['prompt_en'] ?? ''));
            if ($slug !== '' && $promptEn !== '' && isset($groupIds[$slug])) {
                $keep[$import->sourceHash((int) $groupIds[$slug], $promptEn)] = true;
            }
        }
    }

    $deleted = Question::query()
        ->whereNotNull('tense_group_id')
        ->whereNull('exam_id')
        ->when($keep !== [], fn ($q) => $q->whereNotIn('source_hash', array_keys($keep)))
        ->delete();

    $result = $import->importAllFeeds();
    Cache::put(GrammarQuestionImportService::CACHE_KEY_LAST, [
        'finished_at' => now()->toIso8601String(),
        'imported' => $result['imported'],
        'skipped' => $result['skipped'],
        'errors' => $result['errors'],
        'feeds' => $result['feeds'],
    ], now()->addDays(30));

    $this->info("Deleted {$deleted} old pool question(s). Imported: {$result['imported']}, skipped: {$result['skipped']}.");

    return 0;
})->purpose('Drop generated bank in DB and re-import local JSON feeds (keeps quiz-questions.json)');

Artisan::command('grammar:backfill-question-tenses', function () {
    /** @var GrammarQuestionTenseInferrer $inferrer */
    $inferrer = app(GrammarQuestionTenseInferrer::class);
    $tenseIds = Tense::query()->pluck('id', 'slug')->all();
    $updated = 0;
    $unresolved = 0;

    Question::query()
        ->whereNotNull('tense_group_id')
        ->whereNull('exam_id')
        ->with('localeEntries')
        ->orderBy('id')
        ->chunkById(200, function ($questions) use ($inferrer, $tenseIds, &$updated, &$unresolved) {
            foreach ($questions as $question) {
                $slug = $inferrer->inferFromQuestion($question);
                $tenseId = $slug !== null ? ($tenseIds[$slug] ?? null) : null;
                if ($tenseId === null) {
                    $unresolved++;

                    continue;
                }
                if ((int) $question->tense_id !== (int) $tenseId) {
                    $question->update(['tense_id' => $tenseId]);
                    $updated++;
                }
            }
        });

    $this->info("Updated tense_id: {$updated}, unresolved: {$unresolved}");

    return 0;
})->purpose('Set questions.tense_id from explanation text (grammar pool)');
