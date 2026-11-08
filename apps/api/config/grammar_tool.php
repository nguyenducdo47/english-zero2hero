<?php

return [
    'enabled' => filter_var(env('GRAMMAR_TOOL_ENABLED', true), FILTER_VALIDATE_BOOLEAN),
    'guest_daily_limit' => (int) env('GRAMMAR_TOOL_GUEST_DAILY', 10),
    'user_daily_limit' => (int) env('GRAMMAR_TOOL_USER_DAILY', 50),
    'libretranslate_enabled' => filter_var(env('GRAMMAR_TOOL_LIBRETRANSLATE_ENABLED', true), FILTER_VALIDATE_BOOLEAN),
    'libretranslate_url' => env('GRAMMAR_TOOL_LIBRETRANSLATE_URL', 'https://libretranslate.com/translate'),
    'libretranslate_api_key' => env('GRAMMAR_TOOL_LIBRETRANSLATE_API_KEY'),
    'libretranslate_timeout' => (int) env('GRAMMAR_TOOL_LIBRETRANSLATE_TIMEOUT', 12),
    'mymemory_fallback' => filter_var(env('GRAMMAR_TOOL_MYMEMORY_FALLBACK', true), FILTER_VALIDATE_BOOLEAN),
    'mymemory_contact_email' => env('GRAMMAR_TOOL_MYMEMORY_CONTACT_EMAIL'),
    'mymemory_timeout' => (int) env('GRAMMAR_TOOL_MYMEMORY_TIMEOUT', 12),
    'max_chars' => [
        'word' => 120,
        'sentence' => 500,
        'paragraph' => 2000,
    ],
];
