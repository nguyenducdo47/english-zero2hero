<?php

namespace App\Jobs;

use App\Models\ContentSource;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class ImportContentFromUrlJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public int $contentSourceId) {}

    public function handle(): void
    {
        $source = ContentSource::query()->find($this->contentSourceId);
        if (! $source) {
            return;
        }

        $allowed = config('e2h.crawl_whitelist', []);
        if ($allowed && ! in_array($source->domain, $allowed, true)) {
            $source->update([
                'review_status' => 'rejected',
                'metadata' => array_merge($source->metadata ?? [], [
                    'error' => 'Domain not in whitelist',
                ]),
            ]);

            return;
        }

        try {
            $response = Http::timeout(15)->get($source->source_url);
            $source->update([
                'metadata' => array_merge($source->metadata ?? [], [
                    'status_code' => $response->status(),
                    'title' => Str::limit(strip_tags($response->body()), 200),
                    'fetched_at' => now()->toIso8601String(),
                ]),
                'review_status' => 'draft',
            ]);
        } catch (\Throwable $e) {
            $source->update([
                'review_status' => 'rejected',
                'metadata' => array_merge($source->metadata ?? [], [
                    'error' => $e->getMessage(),
                ]),
            ]);
        }
    }
}
