<?php

namespace App\Http\Requests\Api\V1\Concerns;

trait HasTranslationInputRules
{
    /**
     * @return array<string, mixed>
     */
    protected function translationInputRules(): array
    {
        return [
            'translations' => ['sometimes', 'nullable', 'array'],
            'translations.*' => ['array'],
        ];
    }
}
