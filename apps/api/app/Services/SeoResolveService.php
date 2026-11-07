<?php

namespace App\Services;

class SeoResolveService
{
    public function __construct(
        private readonly SeoService $seo,
    ) {}

    /**
     * @param  array{route_key?: string, path?: string, locale: string}  $validated
     * @return array{data: mixed}|null Returns null when resolver input is missing.
     */
    public function resolve(array $validated): ?array
    {
        if (! empty($validated['route_key'] ?? null)) {
            return ['data' => $this->seo->resolveRouteKey($validated['route_key'], $validated['locale'])];
        }

        if (! empty($validated['path'] ?? null)) {
            return ['data' => $this->seo->resolvePath($validated['path'], $validated['locale'])];
        }

        return null;
    }
}
