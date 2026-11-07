<?php

namespace App\Services\Concerns;

use App\Models\Locale;
use Illuminate\Database\Eloquent\Model;

trait SyncsModelTranslations
{
    /**
     * @return array<string, mixed>
     */
    protected function translationValidationRules(): array
    {
        return [
            'translations' => ['sometimes', 'nullable', 'array'],
            'translations.*' => ['array'],
        ];
    }

    /**
     * @param  array<string, array<string, mixed>>|null  $translations
     */
    protected function syncTranslations(Model $model, ?array $translations): void
    {
        if ($translations === null) {
            return;
        }

        $allowed = Locale::activeCodes();
        foreach ($translations as $locale => $attributes) {
            if (! in_array($locale, $allowed, true) || ! is_array($attributes) || $attributes === []) {
                continue;
            }
            $model->syncTranslation($locale, $attributes);
        }
    }

    /**
     * @return array<string, array<string, mixed>>
     */
    protected function translationsPayload(Model $model): array
    {
        $model->loadMissing('localeEntries');

        return $model->localeEntries
            ->mapWithKeys(fn ($t) => [$t->locale => $t->attributes])
            ->all();
    }
}
