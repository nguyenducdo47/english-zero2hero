<?php

return [
    'crawl_whitelist' => array_filter(explode(',', env('E2H_CRAWL_WHITELIST', ''))),
    'frontend_url' => env('FRONTEND_URL', 'http://localhost:3000'),
];
