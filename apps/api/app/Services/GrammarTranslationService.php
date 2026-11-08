<?php

namespace App\Services;

class GrammarTranslationService
{
    public function __construct(
        private readonly LibreTranslateClient $libreTranslate,
        private readonly MyMemoryTranslateClient $myMemory,
        private readonly SettingsService $settings,
    ) {}

    /**
     * @return array{text: string, source: string}|null
     */
    public function translate(string $text, string $source, string $target): ?array
    {
        $memory = $this->myMemory->translate($text, $source, $target);
        if ($memory !== null) {
            return ['text' => $memory, 'source' => 'mymemory'];
        }

        if ($this->libreTranslate->isConfigured()) {
            $libre = $this->libreTranslate->translate($text, $source, $target);
            if ($libre !== null) {
                return ['text' => $libre, 'source' => 'libretranslate'];
            }
        }

        return null;
    }
}
