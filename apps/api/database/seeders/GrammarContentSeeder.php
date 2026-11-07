<?php

namespace Database\Seeders;

use App\Models\Question;
use App\Models\Tense;
use App\Models\TenseGroup;
use App\Services\ContentTranslationImporter;
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
        $importer = new ContentTranslationImporter;

        $groupIds = [];
        foreach ($grammar['groups'] as $group) {
            $model = TenseGroup::query()->updateOrCreate(
                ['slug' => $group['slug']],
                ['sort_order' => $group['sort_order']]
            );
            $importer->apply($model, $importer->mapFromContent($group, ['name']));
            $groupIds[$group['slug']] = $model->id;
        }

        foreach ($grammar['tenses'] as $tense) {
            $model = Tense::query()->updateOrCreate(
                ['slug' => $tense['slug']],
                [
                    'tense_group_id' => $groupIds[$tense['group_slug']],
                    'sort_order' => $tense['sort_order'],
                    'structure' => $tense['structure'],
                    'signals' => $tense['signals'],
                    'examples' => $tense['examples'],
                ]
            );
            $importer->apply($model, $importer->mapFromContent($tense, ['name', 'usage', 'pitfalls']));
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

            $question = Question::query()->create([
                'tense_group_id' => $groupIds[$item['tense_group_slug']],
                'exam_id' => null,
                'type' => $item['type'],
                'payload' => $payload,
                'sort_order' => $index + 1,
            ]);

            $importer->apply($question, $importer->mapFromContent($item, ['prompt', 'explanation']));
        }
    }
}
