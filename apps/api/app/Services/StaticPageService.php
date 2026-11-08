<?php

namespace App\Services;

use App\Models\StaticPage;
use App\Repositories\StaticPageRepository;
use Illuminate\Support\Str;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class StaticPageService
{
    public function __construct(
        private readonly StaticPageRepository $pages,
    ) {}

    /**
     * @return array{data: list<array<string, mixed>>}
     */
    public function indexFooterPublished(string $locale): array
    {
        $rows = $this->pages->footerPublished()
            ->load('localeEntries')
            ->map(fn (StaticPage $page) => $this->serializeList($page, $locale));

        return ['data' => $rows->values()->all()];
    }

    /**
     * @return array{data: list<array<string, mixed>>}
     */
    public function indexPublished(string $locale): array
    {
        $rows = $this->pages->publishedOrdered()
            ->load('localeEntries')
            ->map(fn (StaticPage $page) => $this->serializeList($page, $locale));

        return ['data' => $rows->values()->all()];
    }

    /**
     * @return array{data: array<string, mixed>}
     */
    public function showPublished(string $slug, string $locale): array
    {
        $page = $this->pages->findPublishedBySlug($slug);
        if ($page === null) {
            throw new NotFoundHttpException();
        }
        $page->load('localeEntries');

        return ['data' => $this->serializeDetail($page, $locale)];
    }

    public function findByRouteSlug(string $slug): ?StaticPage
    {
        return StaticPage::query()->where('slug', $slug)->first();
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeList(StaticPage $page, string $locale): array
    {
        return [
            'slug' => $page->slug,
            'page_kind' => $page->page_kind,
            'show_in_header' => $page->show_in_header,
            'show_in_footer' => $page->show_in_footer,
            'title' => (string) ($page->localized('title', '', $locale) ?? ''),
            'excerpt' => (string) ($page->localized('excerpt', '', $locale) ?? ''),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeDetail(StaticPage $page, string $locale): array
    {
        return [
            ...$this->serializeList($page, $locale),
            'body' => (string) ($page->localized('body', '', $locale) ?? ''),
            'updated_at' => $page->updated_at?->toAtomString(),
        ];
    }

    public static function excerptPlain(?string $html): string
    {
        if ($html === null || $html === '') {
            return '';
        }

        return Str::limit(trim(strip_tags($html)), 320);
    }
}
