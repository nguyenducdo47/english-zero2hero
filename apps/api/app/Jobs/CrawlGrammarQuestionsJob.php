<?php

namespace App\Jobs;

use App\Services\GrammarQuestionImportService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;

class CrawlGrammarQuestionsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(GrammarQuestionImportService $import): void
    {
        $result = $import->importAllFeeds();

        Cache::put(GrammarQuestionImportService::CACHE_KEY_LAST, [
            'finished_at' => now()->toIso8601String(),
            'imported' => $result['imported'],
            'skipped' => $result['skipped'],
            'errors' => $result['errors'],
            'feeds' => $result['feeds'],
        ], now()->addDays(30));
    }
}
