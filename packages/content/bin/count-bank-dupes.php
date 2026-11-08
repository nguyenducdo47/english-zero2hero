<?php
$j = json_decode(file_get_contents(dirname(__DIR__) . '/quiz-questions-bank.json'), true);
$m = [];
foreach ($j['questions'] as $q) {
    $k = $q['tense_group_slug'] . '|' . $q['prompt_en'];
    $m[$k] = ($m[$k] ?? 0) + 1;
}
$d = count(array_filter($m, fn ($c) => $c > 1));
echo 'total=' . count($j['questions']) . ' unique=' . count($m) . " dup-keys={$d}\n";
