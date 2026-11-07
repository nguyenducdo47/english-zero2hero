<?php

namespace Database\Seeders;

use App\Models\Exam;
use App\Models\ExamSection;
use App\Models\Question;
use Illuminate\Database\Seeder;

class ExamSeeder extends Seeder
{
    public function run(): void
    {
        $toeic = Exam::query()->updateOrCreate(
            ['slug' => 'toeic-mini-lr-450'],
            [
                'title' => 'TOEIC Mini — Listening & Reading (450–550)',
                'exam_type' => 'toeic',
                'skill_mode' => 'two',
                'target_score_min' => 450,
                'target_score_max' => 550,
                'duration_minutes' => 45,
                'is_published' => true,
                'metadata' => ['description' => 'Đề mini 10 câu Reading mẫu.'],
            ]
        );

        ExamSection::query()->updateOrCreate(
            ['exam_id' => $toeic->id, 'skill' => 'reading'],
            ['title' => 'Reading', 'sort_order' => 1, 'time_limit_minutes' => 30]
        );

        $toeicQuestions = [
            [
                'prompt_en' => 'The meeting will begin ___ 9 a.m.',
                'options' => ['in', 'on', 'at', 'by'],
                'correct_index' => 2,
                'explanation_vi' => 'Giờ cụ thể → at.',
            ],
            [
                'prompt_en' => 'Please submit the report ___ Friday.',
                'options' => ['until', 'by', 'for', 'from'],
                'correct_index' => 1,
                'explanation_vi' => 'Hạn chót → by Friday.',
            ],
        ];

        Question::query()->where('exam_id', $toeic->id)->delete();
        foreach ($toeicQuestions as $i => $q) {
            Question::query()->create([
                'exam_id' => $toeic->id,
                'tense_group_id' => null,
                'type' => 'multiple_choice',
                'prompt_en' => $q['prompt_en'],
                'payload' => [
                    'options' => $q['options'],
                    'correct_index' => $q['correct_index'],
                ],
                'explanation_vi' => $q['explanation_vi'],
                'sort_order' => $i + 1,
            ]);
        }

        $ielts = Exam::query()->updateOrCreate(
            ['slug' => 'ielts-mini-band-5'],
            [
                'title' => 'IELTS Mini — 4 Skills (Band 5.0)',
                'exam_type' => 'ielts',
                'skill_mode' => 'four',
                'target_band_min' => 5.0,
                'target_band_max' => 5.5,
                'duration_minutes' => 60,
                'is_published' => true,
            ]
        );

        foreach (['listening', 'reading', 'writing', 'speaking'] as $idx => $skill) {
            ExamSection::query()->updateOrCreate(
                ['exam_id' => $ielts->id, 'skill' => $skill],
                ['title' => ucfirst($skill), 'sort_order' => $idx + 1]
            );
        }

        Question::query()->where('exam_id', $ielts->id)->delete();
        Question::query()->create([
            'exam_id' => $ielts->id,
            'type' => 'fill_blank',
            'prompt_en' => 'Many students find it difficult to concentrate ___ long periods.',
            'prompt_vi' => 'Nhiều học sinh thấy khó tập trung trong thời gian dài.',
            'payload' => [
                'correct_answers' => ['for'],
                'synonyms' => [],
            ],
            'explanation_vi' => 'for + khoảng thời gian.',
            'sort_order' => 1,
        ]);
    }
}
