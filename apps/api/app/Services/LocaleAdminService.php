<?php

namespace App\Services;

use App\Models\Locale;
use App\Repositories\LocaleRepository;

class LocaleAdminService
{
    public function __construct(
        private readonly LocaleRepository $locales,
    ) {}

    /**
     * @return array{data: mixed}
     */
    public function index(): array
    {
        return ['data' => $this->locales->allOrdered()];
    }

    public function store(array $validated, bool $isDefault): Locale
    {
        if ($isDefault) {
            $this->locales->clearDefaultExcept();
            $validated['is_default'] = true;
        }

        return $this->locales->create($validated);
    }

    public function update(string $code, array $validated, bool $isDefault): Locale
    {
        $locale = $this->locales->findByCodeOrFail($code);

        if ($isDefault) {
            $this->locales->clearDefaultExcept($code);
        }

        $this->locales->update($locale, $validated);

        return $locale;
    }
}
