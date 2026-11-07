<?php

namespace App\Services;

use App\Models\Locale;
use App\Repositories\LocaleRepository;

class LocaleCatalogService extends BaseService
{
    public function __construct(
        private readonly LocaleRepository $locales,
    ) {}

    /**
     * @return array{data: mixed, meta: array{default: string, locale: string}}
     */
    public function index(): array
    {
        return [
            'data' => $this->locales->activeOrdered(),
            'meta' => array_merge($this->apiMeta(), ['default' => Locale::defaultCode()]),
        ];
    }
}
