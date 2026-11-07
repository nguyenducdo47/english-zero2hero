<?php

namespace App\Services;

use App\Jobs\ImportContentFromUrlJob;
use App\Models\ContentSource;
use App\Repositories\ContentSourceRepository;

class ContentSourceService
{
    public function __construct(
        private readonly ContentSourceRepository $sources,
    ) {}

    public function store(array $validated, int $userId): ContentSource
    {
        $domain = parse_url($validated['source_url'], PHP_URL_HOST) ?: '';

        $source = $this->sources->create([
            'source_url' => $validated['source_url'],
            'domain' => $domain,
            'license' => $validated['license'] ?? null,
            'review_status' => 'draft',
            'metadata' => ['submitted_by' => $userId],
        ]);

        ImportContentFromUrlJob::dispatch($source->id);

        return $source;
    }

    /**
     * @return array{data: \Illuminate\Contracts\Pagination\LengthAwarePaginator}
     */
    public function index(): array
    {
        return ['data' => $this->sources->paginateLatest()];
    }
}
