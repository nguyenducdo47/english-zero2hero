<?php

namespace App\Services;

abstract class BaseService
{
    protected function apiMeta(): array
    {
        return ['locale' => app()->getLocale()];
    }

    /**
     * @return array{data: mixed, meta: array{locale: string}}
     */
    protected function envelope(mixed $data): array
    {
        return [
            'data' => $data,
            'meta' => $this->apiMeta(),
        ];
    }
}
