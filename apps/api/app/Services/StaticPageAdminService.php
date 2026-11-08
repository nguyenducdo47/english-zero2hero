<?php

namespace App\Services;

use App\Models\StaticPage;
use App\Repositories\StaticPageRepository;
use App\Services\Concerns\SyncsModelTranslations;

class StaticPageAdminService
{
    use SyncsModelTranslations;

    public function __construct(
        private readonly StaticPageRepository $pages,
    ) {}

    /**
     * @return array{data: list<array<string, mixed>>}
     */
    public function index(): array
    {
        $rows = $this->pages->allForAdminIndex()
            ->load('localeEntries')
            ->map(fn (StaticPage $p) => $this->serialize($p));

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

        $validated = array_merge([
            'show_in_header' => true,
            'show_in_footer' => true,
        ], $validated);

        $page = $this->pages->create($validated);
        $this->syncTranslations($page, $translations);

        return ['data' => $this->serialize($page->fresh()->load('localeEntries'))];
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array{data: array<string, mixed>}
     */
    public function update(StaticPage $page, array $validated): array
    {
        $translations = $validated['translations'] ?? null;
        unset($validated['translations']);

        $this->pages->update($page, $validated);
        $this->syncTranslations($page, $translations);

        return ['data' => $this->serialize($page->fresh()->load('localeEntries'))];
    }

    /**
     * @return array{data: array{deleted: bool}}
     */
    public function destroy(StaticPage $page): array
    {
        $this->pages->delete($page);

        return ['data' => ['deleted' => true]];
    }

    /**
     * @return array<string, mixed>
     */
    private function serialize(StaticPage $page): array
    {
        $page->loadMissing('localeEntries');

        return [
            'id' => $page->id,
            'slug' => $page->slug,
            'page_kind' => $page->page_kind,
            'is_published' => $page->is_published,
            'show_in_header' => $page->show_in_header,
            'show_in_footer' => $page->show_in_footer,
            'sort_order' => $page->sort_order,
            'translations' => $this->translationsPayload($page),
            'label' => (string) ($page->localized('title', $page->slug) ?? $page->slug),
        ];
    }
}
