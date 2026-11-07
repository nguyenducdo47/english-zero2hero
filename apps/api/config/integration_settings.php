<?php

return [

    'groups' => ['mail', 'google'],

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
    ],
];
