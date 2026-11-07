<?php

namespace App\Models\Concerns;

use App\Models\Locale;
use App\Models\Translation;
use Illuminate\Database\Eloquent\Relations\MorphMany;

trait HasTranslations
{
    public function localeEntries(): MorphMany
    {
        return $this->morphMany(Translation::class, 'translatable');
    }

    public function syncTranslation(string $locale, array $attributes): Translation
    {
        return $this->localeEntries()->updateOrCreate(
            ['locale' => $locale],
            ['attributes' => $attributes]
        );
    }

    public function localized(string $key, mixed $default = null, ?string $locale = null): mixed
    {
        $locale = $locale ?? app()->getLocale();

        $rows = $this->relationLoaded('localeEntries')
            ? $this->getRelation('localeEntries')
            : $this->localeEntries()->get();

        $row = $rows->firstWhere('locale', $locale)
            ?? $rows->firstWhere('locale', config('app.fallback_locale'))
            ?? $rows->firstWhere('locale', Locale::defaultCode());

        $bag = $row?->getAttribute('attributes');

        return is_array($bag) ? ($bag[$key] ?? $default) : data_get($bag, $key, $default);
    }
}
