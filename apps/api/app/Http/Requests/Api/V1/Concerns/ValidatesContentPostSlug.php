<?php

namespace App\Http\Requests\Api\V1\Concerns;

use Illuminate\Validation\Rule;

trait ValidatesContentPostSlug
{
    /**
     * @return array<int, mixed>
     */
    protected function contentPostSlugRules(string $channel, ?int $ignoreId = null): array
    {
        $unique = Rule::unique('content_posts', 'slug')->where('channel', $channel);
        if ($ignoreId !== null) {
            $unique->ignore($ignoreId);
        }

        return [
            'required',
            'string',
            'max:64',
            'regex:/^[a-z0-9-]+$/',
            $unique,
        ];
    }
}
