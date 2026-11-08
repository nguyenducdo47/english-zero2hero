<?php

$contentDir = dirname(base_path(), 2).DIRECTORY_SEPARATOR.'packages'.DIRECTORY_SEPARATOR.'content';

$localFeedPaths = [];
if (is_string($single = env('GRAMMAR_QUESTION_FEED_LOCAL')) && $single !== '') {
    $localFeedPaths[] = $single;
} else {
    $list = (string) env('GRAMMAR_QUESTION_FEED_LOCAL_PATHS', 'quiz-questions.json,quiz-questions-bank.json');
    foreach (array_filter(array_map('trim', explode(',', $list))) as $file) {
        $localFeedPaths[] = str_contains($file, DIRECTORY_SEPARATOR)
            ? $file
            : $contentDir.DIRECTORY_SEPARATOR.$file;
    }
}

return [

    'group_quiz' => [
        'default_limit' => (int) env('GRAMMAR_GROUP_QUIZ_LIMIT', 15),
        'min_limit' => (int) env('GRAMMAR_GROUP_QUIZ_MIN', 1),
        'max_limit' => (int) env('GRAMMAR_GROUP_QUIZ_MAX', 30),
    ],

    'question_feed_urls' => array_values(array_filter(array_map(
        'trim',
        explode(',', (string) env('GRAMMAR_QUESTION_FEED_URLS', '')),
    ))),

    'local_question_feed_path' => $localFeedPaths[0]
        ?? $contentDir.DIRECTORY_SEPARATOR.'quiz-questions.json',

    'local_question_feed_paths' => $localFeedPaths,

    'crawl_delay_ms' => (int) env('GRAMMAR_CRAWL_DELAY_MS', 500),
    'crawl_timeout' => (int) env('GRAMMAR_CRAWL_TIMEOUT', 30),
    'crawl_user_agent' => env('GRAMMAR_CRAWL_USER_AGENT', 'EnglishZero2Hero/1.0 (+grammar-quiz-crawl)'),

    'feed_adapters' => [
        // Additional custom adapters: 'my_adapter' => \App\Services\GrammarQuestion\MyAdapter::class,
    ],

];
