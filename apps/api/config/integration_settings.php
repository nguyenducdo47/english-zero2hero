<?php

return [

    'groups' => ['mail', 'google', 'grammar_tool'],

    'keys' => [
        'mail.mailer' => [
            'group' => 'mail',
            'secret' => false,
            'env' => 'MAIL_MAILER',
            'default' => 'log',
        ],
        'mail.host' => [
            'group' => 'mail',
            'secret' => false,
            'env' => 'MAIL_HOST',
            'default' => '127.0.0.1',
        ],
        'mail.port' => [
            'group' => 'mail',
            'secret' => false,
            'env' => 'MAIL_PORT',
            'default' => '2525',
        ],
        'mail.username' => [
            'group' => 'mail',
            'secret' => false,
            'env' => 'MAIL_USERNAME',
            'default' => null,
        ],
        'mail.password' => [
            'group' => 'mail',
            'secret' => true,
            'env' => 'MAIL_PASSWORD',
            'default' => null,
        ],
        'mail.from.address' => [
            'group' => 'mail',
            'secret' => false,
            'env' => 'MAIL_FROM_ADDRESS',
            'default' => 'hello@example.com',
        ],
        'mail.from.name' => [
            'group' => 'mail',
            'secret' => false,
            'env' => 'MAIL_FROM_NAME',
            'default' => null,
        ],
        'google.oauth_enabled' => [
            'group' => 'google',
            'secret' => false,
            'env' => 'GOOGLE_OAUTH_ENABLED',
            'default' => '1',
        ],
        'google.client_id' => [
            'group' => 'google',
            'secret' => false,
            'env' => 'GOOGLE_CLIENT_ID',
            'default' => null,
        ],
        'google.client_secret' => [
            'group' => 'google',
            'secret' => true,
            'env' => 'GOOGLE_CLIENT_SECRET',
            'default' => null,
        ],
        'google.redirect' => [
            'group' => 'google',
            'secret' => false,
            'env' => 'GOOGLE_REDIRECT_URI',
            'default' => null,
        ],
        'grammar_tool.enabled' => [
            'group' => 'grammar_tool',
            'secret' => false,
            'env' => 'GRAMMAR_TOOL_ENABLED',
            'default' => '1',
        ],
        'grammar_tool.guest_daily_limit' => [
            'group' => 'grammar_tool',
            'secret' => false,
            'env' => 'GRAMMAR_TOOL_GUEST_DAILY',
            'default' => '10',
        ],
        'grammar_tool.user_daily_limit' => [
            'group' => 'grammar_tool',
            'secret' => false,
            'env' => 'GRAMMAR_TOOL_USER_DAILY',
            'default' => '50',
        ],
        'grammar_tool.libretranslate_enabled' => [
            'group' => 'grammar_tool',
            'secret' => false,
            'env' => 'GRAMMAR_TOOL_LIBRETRANSLATE_ENABLED',
            'default' => '1',
        ],
        'grammar_tool.libretranslate_url' => [
            'group' => 'grammar_tool',
            'secret' => false,
            'env' => 'GRAMMAR_TOOL_LIBRETRANSLATE_URL',
            'default' => 'https://libretranslate.com/translate',
        ],
        'grammar_tool.libretranslate_api_key' => [
            'group' => 'grammar_tool',
            'secret' => true,
            'env' => 'GRAMMAR_TOOL_LIBRETRANSLATE_API_KEY',
            'default' => null,
        ],
    ],
];
