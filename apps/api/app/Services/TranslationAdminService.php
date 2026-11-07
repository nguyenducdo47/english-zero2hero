<?php

namespace App\Services;

use App\Models\Question;
use App\Models\Tense;
use App\Models\TenseGroup;
use App\Models\Translation;
use Illuminate\Database\Eloquent\Model;

class TranslationAdminService
{
    private const TYPES = [
        'tense_group' => TenseGroup::class,
        'tense' => Tense::class,
        'question' => Question::class,
    ];

    public function upsert(array $validated): Translation
    {
        $model = $this->resolveModel($validated['type'], $validated);

        return $model->syncTranslation($validated['locale'], $validated['attributes']);
    }

    /**
     * @return array{data: array<string, mixed>}
     */
    public function show(array $validated): array
    {
        $model = $this->resolveModel($validated['type'], $validated);
        $model->load('localeEntries');

        $identifier = $validated['type'] === 'question'
            ? ['id' => $model->getKey()]
            : ['slug' => $model->slug];

        return [
            'data' => [
                ...$identifier,
                'translations' => $model->localeEntries->mapWithKeys(
                    fn (Translation $t) => [$t->locale => $t->attributes]
                ),
            ],
        ];
    }

    /**
     * @param  array<string, mixed>  $validated
     */
    private function resolveModel(string $type, array $validated): Model
    {
        $class = self::TYPES[$type];

        if ($type === 'question') {
            return $class::query()->whereKey($validated['id'])->firstOrFail();
        }

        return $class::query()->where('slug', $validated['slug'])->firstOrFail();
    }
}
