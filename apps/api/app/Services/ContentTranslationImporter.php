<?php

namespace App\Services;

use App\Models\Locale;
use Illuminate\Database\Eloquent\Model;

class ContentTranslationImporter
{
    /** @var array<string, string> */
    private const LEGACY_SUFFIX = [
        'name' => 'name',
        'usage' => 'usage',
        'pitfalls' => 'pitfalls',
        'prompt' => 'prompt',
        'explanation' => 'explanation',
    ];

    /**
     * @param  array<string, array<string, mixed>>  $byLocale
     */
    public function apply(Model $model, array $byLocale): void
    {
        foreach ($byLocale as $locale => $attributes) {
            if (! is_array($attributes) || $attributes === []) {
                continue;
            }
            if (! in_array($locale, Locale::activeCodes(), true)) {
                continue;
            }
            $model->syncTranslation($locale, $attributes);
        }
    }

    /**
     * @param  array<string, mixed>  $item
     * @param  list<string>  $fields
     * @return array<string, array<string, mixed>>
     */
    public function mapFromContent(array $item, array $fields): array
    {
        if (! empty($item['translations']) && is_array($item['translations'])) {
            return $item['translations'];
        }

        $out = [];
        foreach (Locale::activeCodes() as $code) {
            $bucket = [];
            foreach ($fields as $field) {
                $value = $this->legacyValue($item, $field, $code);
                if ($value !== null) {
                    $bucket[$field] = $value;
                }
            }
            if ($bucket !== []) {
                $out[$code] = $bucket;
            }
        }

        return $out;
    }

    /**
     * @param  array<string, mixed>  $item
     */
    private function legacyValue(array $item, string $field, string $code): mixed
    {
        if (isset($item['translations'][$code][$field])) {
            return $item['translations'][$code][$field];
        }

        $key = $field.'_'.$code;
        if (array_key_exists($key, $item)) {
            return $item[$key];
        }

        if ($field === 'prompt' && $code === 'en' && isset($item['prompt_en'])) {
            return $item['prompt_en'];
        }

        if ($field === 'prompt' && $code === 'vi' && isset($item['prompt_vi'])) {
            return $item['prompt_vi'];
        }

        if ($field === 'usage' && $code === 'vi' && isset($item['usage_vi'])) {
            return $item['usage_vi'];
        }

        if ($field === 'pitfalls' && $code === 'vi' && isset($item['pitfalls_vi'])) {
            return $item['pitfalls_vi'];
        }

        if ($field === 'name' && $code === 'en' && isset($item['name_en'])) {
            return $item['name_en'];
        }

        if ($field === 'name' && $code === 'vi' && isset($item['name_vi'])) {
            return $item['name_vi'];
        }

        if ($field === 'explanation' && isset($item['explanation_'.$code])) {
            return $item['explanation_'.$code];
        }

        return null;
    }
}
