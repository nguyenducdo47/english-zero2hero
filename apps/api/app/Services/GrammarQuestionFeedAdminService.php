<?php

namespace App\Services;

use App\Models\GrammarQuestionFeed;
use App\Models\TenseGroup;
use App\Repositories\GrammarQuestionFeedRepository;
use App\Services\GrammarQuestion\GrammarQuestionFeedAdapterRegistry;
use Illuminate\Validation\ValidationException;

class GrammarQuestionFeedAdminService extends BaseService
{
    public function __construct(
        private readonly GrammarQuestionFeedRepository $feeds,
        private readonly GrammarQuestionFeedAdapterRegistry $adapters,
    ) {}

    public function index(): array
    {
        return $this->envelope(
            $this->feeds->allOrdered()->map(fn (GrammarQuestionFeed $f) => $this->serialize($f))->values()
        );
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function store(array $data): array
    {
        $this->assertAdapter($data['adapter'] ?? '');
        $this->assertGroupSlug($data['default_tense_group_slug'] ?? null);

        $feed = $this->feeds->create([
            'name' => $data['name'],
            'feed_url' => $data['feed_url'],
            'adapter' => $data['adapter'] ?? 'json_feed',
            'is_enabled' => (bool) ($data['is_enabled'] ?? true),
            'default_tense_group_slug' => $data['default_tense_group_slug'] ?? null,
            'license' => $data['license'] ?? null,
            'notes' => $data['notes'] ?? null,
            'sort_order' => (int) ($data['sort_order'] ?? 0),
        ]);

        return $this->envelope($this->serialize($feed));
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(GrammarQuestionFeed $feed, array $data): array
    {
        if (isset($data['adapter'])) {
            $this->assertAdapter($data['adapter']);
        }
        if (array_key_exists('default_tense_group_slug', $data)) {
            $this->assertGroupSlug($data['default_tense_group_slug']);
        }

        $feed->update(array_intersect_key($data, array_flip($feed->getFillable())));

        return $this->envelope($this->serialize($feed->fresh()));
    }

    public function destroy(GrammarQuestionFeed $feed): array
    {
        $feed->delete();

        return $this->envelope(['deleted' => true]);
    }

    /**
     * @return array<string, mixed>
     */
    public function serialize(GrammarQuestionFeed $feed): array
    {
        return [
            'id' => $feed->id,
            'name' => $feed->name,
            'feed_url' => $feed->feed_url,
            'adapter' => $feed->adapter,
            'is_enabled' => $feed->is_enabled,
            'default_tense_group_slug' => $feed->default_tense_group_slug,
            'license' => $feed->license,
            'notes' => $feed->notes,
            'last_fetched_at' => $feed->last_fetched_at?->toIso8601String(),
            'last_result' => $feed->last_result,
            'sort_order' => $feed->sort_order,
        ];
    }

    private function assertAdapter(string $adapter): void
    {
        if (! in_array($adapter, $this->adapters->keys(), true)) {
            throw ValidationException::withMessages([
                'adapter' => 'Invalid adapter key.',
            ]);
        }
    }

    private function assertGroupSlug(?string $slug): void
    {
        if ($slug === null || $slug === '') {
            return;
        }

        if (! TenseGroup::query()->where('slug', $slug)->exists()) {
            throw ValidationException::withMessages([
                'default_tense_group_slug' => 'Unknown tense group slug.',
            ]);
        }
    }
}
