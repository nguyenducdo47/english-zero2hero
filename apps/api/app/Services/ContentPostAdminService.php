<?php

namespace App\Services;

use App\Models\ContentPost;
use App\Repositories\ContentPostRepository;
use App\Services\Concerns\SyncsModelTranslations;

class ContentPostAdminService
{
    use SyncsModelTranslations;

    public function __construct(
        private readonly ContentPostRepository $posts,
    ) {}

    /**
     * @return array{data: list<array<string, mixed>>}
     */
    public function index(?string $channel): array
    {
        $rows = $this->posts->allForAdmin($channel)
            ->load('localeEntries')
            ->map(fn (ContentPost $p) => $this->serialize($p));

        return ['data' => $rows->values()->all()];
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array{data: array<string, mixed>}
     */
    public function store(array $validated): array
    {
        $translations = $validated['translations'] ?? null;
        unset($validated['translations']);

        if (empty($validated['published_at']) && ($validated['is_published'] ?? false)) {
            $validated['published_at'] = now();
        }

        $post = $this->posts->create($validated);
        $this->syncTranslations($post, $translations);

        return ['data' => $this->serialize($post->fresh()->load('localeEntries'))];
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array{data: array<string, mixed>}
     */
    public function update(ContentPost $post, array $validated): array
    {
        $translations = $validated['translations'] ?? null;
        unset($validated['translations']);

        if (array_key_exists('is_published', $validated)
            && $validated['is_published']
            && ! $post->published_at
            && ! ($validated['published_at'] ?? null)) {
            $validated['published_at'] = now();
        }

        $this->posts->update($post, $validated);
        $this->syncTranslations($post, $translations);

        return ['data' => $this->serialize($post->fresh()->load('localeEntries'))];
    }

    /**
     * @return array{data: array{deleted: bool}}
     */
    public function destroy(ContentPost $post): array
    {
        $this->posts->delete($post);

        return ['data' => ['deleted' => true]];
    }

    /**
     * @return array<string, mixed>
     */
    private function serialize(ContentPost $post): array
    {
        $post->loadMissing('localeEntries');

        return [
            'id' => $post->id,
            'channel' => $post->channel,
            'slug' => $post->slug,
            'is_published' => $post->is_published,
            'published_at' => $post->published_at?->toAtomString(),
            'sort_order' => $post->sort_order,
            'translations' => $this->translationsPayload($post),
            'label' => (string) ($post->localized('title', $post->slug) ?? $post->slug),
        ];
    }
}
