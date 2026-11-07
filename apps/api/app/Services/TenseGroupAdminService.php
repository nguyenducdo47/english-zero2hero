<?php

namespace App\Services;

use App\Models\TenseGroup;
use App\Repositories\TenseGroupRepository;
use App\Services\Concerns\SyncsModelTranslations;

class TenseGroupAdminService
{
    use SyncsModelTranslations;

    public function __construct(
        private readonly TenseGroupRepository $groups,
    ) {}

    /**
     * @return array{data: list<array<string, mixed>>}
     */
    public function index(): array
    {
        $rows = $this->groups->allForAdminIndex()
            ->map(fn (TenseGroup $g) => $this->serialize($g));

        return ['data' => $rows->all()];
    }

    public function store(array $validated): array
    {
        $translations = $validated['translations'] ?? null;
        unset($validated['translations']);

        $group = $this->groups->create($validated);
        $this->syncTranslations($group, $translations);

        return ['data' => $this->serialize($group->fresh())];
    }

    public function update(TenseGroup $group, array $validated): array
    {
        $translations = $validated['translations'] ?? null;
        unset($validated['translations']);

        $this->groups->update($group, $validated);
        $this->syncTranslations($group, $translations);

        return ['data' => $this->serialize($group->fresh())];
    }

    /**
     * @return array{data: array{deleted: bool}}
     */
    public function destroy(TenseGroup $group): array
    {
        $this->groups->delete($group);

        return ['data' => ['deleted' => true]];
    }

    /**
     * @return array<string, mixed>
     */
    private function serialize(TenseGroup $group): array
    {
        return [
            'id' => $group->id,
            'slug' => $group->slug,
            'sort_order' => $group->sort_order,
            'tenses_count' => $group->tenses_count ?? $group->tenses()->count(),
            'translations' => $this->translationsPayload($group),
            'label' => $group->localized('name', $group->slug),
        ];
    }
}
