<?php

namespace App\Services;

use App\Models\Tense;
use App\Repositories\TenseRepository;
use App\Services\Concerns\SyncsModelTranslations;

class TenseAdminService
{
    use SyncsModelTranslations;

    public function __construct(
        private readonly TenseRepository $tenses,
    ) {}

    /**
     * @return array{data: list<array<string, mixed>>}
     */
    public function index(?int $tenseGroupId): array
    {
        $rows = $this->tenses->forAdminIndex($tenseGroupId)
            ->map(fn (Tense $t) => $this->serialize($t));

        return ['data' => $rows->all()];
    }

    public function store(array $validated): array
    {
        $translations = $validated['translations'] ?? null;
        unset($validated['translations']);

        $tense = $this->tenses->create($validated);
        $this->syncTranslations($tense, $translations);

        return ['data' => $this->serialize($tense->fresh()->load('group'))];
    }

    public function update(Tense $tense, array $validated): array
    {
        $translations = $validated['translations'] ?? null;
        unset($validated['translations']);

        $this->tenses->update($tense, $validated);
        $this->syncTranslations($tense, $translations);

        return ['data' => $this->serialize($tense->fresh()->load('group'))];
    }

    /**
     * @return array{data: array{deleted: bool}}
     */
    public function destroy(Tense $tense): array
    {
        $this->tenses->delete($tense);

        return ['data' => ['deleted' => true]];
    }

    /**
     * @return array<string, mixed>
     */
    private function serialize(Tense $tense): array
    {
        return [
            'id' => $tense->id,
            'tense_group_id' => $tense->tense_group_id,
            'group_slug' => $tense->group?->slug,
            'slug' => $tense->slug,
            'sort_order' => $tense->sort_order,
            'structure' => $tense->structure,
            'signals' => $tense->signals ?? [],
            'examples' => $tense->examples ?? [],
            'translations' => $this->translationsPayload($tense),
            'label' => $tense->localized('name', $tense->slug),
        ];
    }
}
