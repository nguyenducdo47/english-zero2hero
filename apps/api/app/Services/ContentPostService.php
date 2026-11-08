<?php

namespace App\Services;

use App\Models\ContentPost;
use App\Models\StaticPage;
use App\Repositories\ContentPostRepository;
use App\Repositories\StaticPageRepository;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class ContentPostService
{
    public function __construct(
        private readonly ContentPostRepository $posts,
        private readonly StaticPageRepository $pages,
    ) {}

    /**
     * @return array{data: list<array<string, mixed>>}
     */
    public function listForHub(string $hubSlug, string $locale): array
    {
        $channel = $this->hubChannelOrFail($hubSlug);
        $rows = $this->posts->publishedForChannel($channel)
            ->load('localeEntries')
            ->map(fn (ContentPost $post) => $this->serializeCard($post, $locale));

        return ['data' => $rows->values()->all()];
    }

    /**
     * @return array{data: array<string, mixed>}
     */
    public function showPublished(string $channel, string $slug, string $locale): array
    {
        if (! in_array($channel, ContentPost::CHANNELS, true)) {
            throw new NotFoundHttpException();
        }

        $post = $this->posts->findPublished($channel, $slug);
        if ($post === null) {
            throw new NotFoundHttpException();
        }
        $post->load('localeEntries');

        return ['data' => $this->serializeDetail($post, $locale)];
    }

    public function hubChannelOrFail(string $hubSlug): string
    {
        $page = $this->pages->findPublishedBySlug($hubSlug);
        if ($page === null) {
            throw new NotFoundHttpException();
        }
        if (! in_array($page->page_kind, [StaticPage::KIND_BLOG, StaticPage::KIND_NEWS], true)) {
            throw new NotFoundHttpException();
        }
        if ($page->page_kind !== $hubSlug) {
            throw new NotFoundHttpException();
        }

        return $page->page_kind;
    }

    /**
     * @return array<string, mixed>
     */
    public function serializeCard(ContentPost $post, string $locale): array
    {
        return [
            'slug' => $post->slug,
            'channel' => $post->channel,
            'title' => (string) ($post->localized('title', '', $locale) ?? ''),
            'excerpt' => (string) ($post->localized('excerpt', '', $locale) ?? ''),
            'published_at' => $post->published_at?->toAtomString(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeDetail(ContentPost $post, string $locale): array
    {
        return [
            ...$this->serializeCard($post, $locale),
            'body' => (string) ($post->localized('body', '', $locale) ?? ''),
            'updated_at' => $post->updated_at?->toAtomString(),
        ];
    }
}
