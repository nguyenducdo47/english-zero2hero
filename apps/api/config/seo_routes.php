<?php

return [

    'noindex_paths' => [
        '/admin',
        '/login',
        '/profile',
        '/dashboard',
        '/analytics',
        '/mock-exams/session',
        '/auth',
    ],

    'static' => [
        ['route_key' => 'home', 'path' => '/', 'label' => 'Home'],
        ['route_key' => 'grammar', 'path' => '/grammar', 'label' => 'Grammar index'],
        ['route_key' => 'grammar-analyze', 'path' => '/grammar/analyze', 'label' => 'Grammar translate & analyze'],
        ['route_key' => 'exams', 'path' => '/exams', 'label' => 'Exams index'],
        ['route_key' => 'mock-exams', 'path' => '/mock-exams', 'label' => 'Mock exams'],
        ['route_key' => 'roadmap', 'path' => '/roadmap', 'label' => 'Roadmap'],
        ['route_key' => 'login', 'path' => '/login', 'label' => 'Login', 'noindex' => true],
        ['route_key' => 'dashboard', 'path' => '/dashboard', 'label' => 'Dashboard', 'noindex' => true],
        ['route_key' => 'profile', 'path' => '/profile', 'label' => 'Profile', 'noindex' => true],
        ['route_key' => 'analytics', 'path' => '/analytics', 'label' => 'Analytics', 'noindex' => true],
    ],

    'dynamic' => [
        'grammar.tense' => [
            'pattern' => 'grammar.tense.{slug}',
            'path_pattern' => '/grammar/{slug}',
            'label' => 'Grammar tense',
            'model' => \App\Models\Tense::class,
            'slug_column' => 'slug',
        ],
        'exams' => [
            'pattern' => 'exams.{slug}',
            'path_pattern' => '/exams/{slug}',
            'label' => 'Exam',
            'model' => \App\Models\Exam::class,
            'slug_column' => 'slug',
            'published_only' => true,
        ],
        'page' => [
            'pattern' => 'page.{slug}',
            'path_pattern' => '/{slug}',
            'label' => 'Static page',
            'model' => \App\Models\StaticPage::class,
            'slug_column' => 'slug',
            'published_only' => true,
        ],
        'content.blog' => [
            'pattern' => 'blog.{slug}',
            'path_pattern' => '/blog/{slug}',
            'label' => 'Blog post',
            'model' => \App\Models\ContentPost::class,
            'slug_column' => 'slug',
            'published_only' => true,
            'scope' => ['channel' => 'blog'],
        ],
        'content.news' => [
            'pattern' => 'news.{slug}',
            'path_pattern' => '/news/{slug}',
            'label' => 'News post',
            'model' => \App\Models\ContentPost::class,
            'slug_column' => 'slug',
            'published_only' => true,
            'scope' => ['channel' => 'news'],
        ],
    ],

];
