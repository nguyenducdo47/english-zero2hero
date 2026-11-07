<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;

class RuntimeCacheService
{
    public function __construct(
        private readonly SettingsService $settings,
        private readonly GrammarContentExporter $grammarExporter,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function clearAll(): array
    {
        Cache::flush();
        $this->settings->forgetCache();

        $grammar = $this->grammarExporter->exportToFile();

        return [
            'laravel_cache' => true,
            'settings_cache' => true,
            'grammar' => $grammar,
        ];
    }
}
