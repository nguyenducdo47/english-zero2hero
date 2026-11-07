<?php

namespace Database\Seeders;

use App\Models\Question;
use App\Models\Tense;
use App\Models\TenseGroup;
use Illuminate\Database\Seeder;

class GrammarContentSeeder extends Seeder
{
    public function run(): void
    {
        $root = dirname(base_path(), 2);
        $grammarPath = $root.DIRECTORY_SEPARATOR.'packages'.DIRECTORY_SEPARATOR.'content'.DIRECTORY_SEPARATOR.'grammar.json';
        $quizPath = $root.DIRECTORY_SEPARATOR.'packages'.DIRECTORY_SEPARATOR.'content'.DIRECTORY_SEPARATOR.'quiz-questions.json';

        $grammar = json_decode(file_get_contents($grammarPath), true);
        $quiz = json_decode(file_get_contents($quizPath), true);

        $groupIds = [];
        foreach ($grammar['groups'] as $group) {
            $model = TenseGroup::query()->updateOrCreate(
                ['slug' => $group['slug']],
                [
                    'name_vi' => $group['name_vi'],
                    'name_en' => $group['name_en'],
                    'sort_order' => $group['sort_order'],
                ]
            );
            $groupIds[$group['slug']] = $model->id;
        }

        foreach ($grammar['tenses'] as $tense) {
            Tense::query()->updateOrCreate(
                ['slug' => $tense['slug']],
                [
                    'tense_group_id' => $groupIds[$tense['group_slug']],
                    'name_en' => $tense['name_en'],
                    'name_vi' => $tense['name_vi'],
                    'sort_order' => $tense['sort_order'],
                    'structure' => $tense['structure'],
                    'usage_vi' => $tense['usage_vi'],
                    'signals' => $tense['signals'],
                    'pitfalls_vi' => $tense['pitfalls_vi'] ?? null,
                    'examples' => $tense['examples'],
                ]
            );
        }

        Question::query()->whereNotNull('tense_group_id')->whereNull('exam_id')->delete();

        foreach ($quiz['questions'] as $index => $item) {
            $payload = $item['type'] === 'multiple_choice'
                ? [
                    'options' => $item['options'],
                    'correct_index' => $item['correct_index'],
                ]
                : [
                    'correct_answers' => $item['correct_answers'],
                    'synonyms' => $item['synonyms'] ?? [],
                ];

            Question::query()->create([
                'tense_group_id' => $groupIds[$item['tense_group_slug']],
                'exam_id' => null,
                'type' => $item['type'],
                'prompt_en' => $item['prompt_en'],
                'prompt_vi' => $item['prompt_vi'] ?? null,
                'payload' => $payload,
                'explanation_vi' => $item['explanation_vi'] ?? null,
                'sort_order' => $index + 1,
            ]);
        }
    }
}
