<?php

namespace App\Http\Requests\Api\V1\Concerns;

use Illuminate\Validation\Rule;

trait ValidatesStaticPageSlug
{
    /**
     * @return array<int, mixed>
     */
    protected function staticPageSlugRules(?int $ignoreId = null): array
    {
        $unique = Rule::unique('static_pages', 'slug');
        if ($ignoreId !== null) {
            $unique->ignore($ignoreId);
        }

        return [
            'required',
            'string',
            'max:64',
            'regex:/^[a-z0-9-]+$/',
            $unique,
            Rule::notIn(config('static_pages.reserved_slugs', [])),
        ];
    }
}
