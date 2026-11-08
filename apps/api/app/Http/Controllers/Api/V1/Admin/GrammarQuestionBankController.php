<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\CrawlGrammarQuestionsJob;
use App\Repositories\GrammarQuestionFeedRepository;
use App\Repositories\QuestionRepository;
use App\Services\GrammarQuestion\GrammarQuestionFeedAdapterRegistry;
use App\Services\GrammarQuestionImportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class GrammarQuestionBankController extends Controller
{
    public function __construct(
        private readonly QuestionRepository $questions,
        private readonly GrammarQuestionFeedRepository $feeds,
        private readonly GrammarQuestionFeedAdapterRegistry $adapters,
        private readonly GrammarQuestionImportService $import,
    ) {}

    public function status(): JsonResponse
    {
        $last = Cache::get(GrammarQuestionImportService::CACHE_KEY_LAST);

        return response()->json([
            'data' => [
                'pools' => $this->questions->grammarPoolCountsByGroup(),
                'last_crawl' => $last,
                'feeds' => $this->feeds->allOrdered()->map(fn ($f) => [
                    'id' => $f->id,
                    'name' => $f->name,
                    'adapter' => $f->adapter,
                    'is_enabled' => $f->is_enabled,
                    'last_fetched_at' => $f->last_fetched_at?->toIso8601String(),
                    'last_result' => $f->last_result,
                ]),
                'adapters' => $this->adapters->keys(),
            ],
        ]);
    }

    public function crawl(): JsonResponse
    {
        if (app()->environment('local')) {
            $result = $this->import->importAllFeeds();
            Cache::put(GrammarQuestionImportService::CACHE_KEY_LAST, [
                'finished_at' => now()->toIso8601String(),
                'imported' => $result['imported'],
                'skipped' => $result['skipped'],
                'errors' => $result['errors'],
                'feeds' => $result['feeds'],
            ], now()->addDays(30));

            return response()->json([
                'data' => [
                    'mode' => 'sync',
                    'finished_at' => now()->toIso8601String(),
                    'summary' => $result,
                ],
            ]);
        }

        CrawlGrammarQuestionsJob::dispatch();

        return response()->json([
            'data' => [
                'mode' => 'queued',
                'queued_at' => now()->toIso8601String(),
            ],
        ], 202);
    }
}
