<?php

namespace App\Support;

use App\Models\Locale;

class LocaleHelper
{
    public static function resolve(?string $candidate): string
    {
        $active = Locale::activeCodes();
        if ($candidate && in_array($candidate, $active, true)) {
            return $candidate;
        }

        return Locale::defaultCode();
    }
}
