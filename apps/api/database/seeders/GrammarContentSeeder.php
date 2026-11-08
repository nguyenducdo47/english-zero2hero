<?php

namespace Database\Seeders;

use App\Models\Question;
use App\Models\Tense;
use App\Models\TenseGroup;
use App\Services\ContentTranslationImporter;
use App\Services\GrammarQuestionImportService;
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
        $questionImport = new GrammarQuestionImportService($importer);

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

            $groupId = $groupIds[$item['tense_group_slug']];
            $promptEn = trim((string) ($item['prompt_en'] ?? ''));

            $question = Question::query()->create([
                'tense_group_id' => $groupId,
                'exam_id' => null,
                'type' => $item['type'],
                'payload' => $payload,
                'sort_order' => $index + 1,
                'source_hash' => $questionImport->sourceHash($groupId, $promptEn),
            ]);

            $importer->apply($question, $importer->mapFromContent($item, ['prompt', 'explanation']));
        }
    }
}
