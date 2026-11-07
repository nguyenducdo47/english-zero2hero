<?php

namespace App\Services;

use App\Models\Attempt;
use App\Models\AttemptAnswer;
use App\Repositories\QuestionRepository;
use App\Repositories\TenseGroupRepository;
use Illuminate\Contracts\Auth\Authenticatable;

class QuizAttemptService extends BaseService
{
    public function __construct(
        private readonly TenseGroupRepository $tenseGroups,
        private readonly QuestionRepository $questions,
        private readonly QuizGrader $grader,
    ) {}

    /**
     * @param  list<array{question_id: int, answer: mixed}>  $answers
     * @return array<string, mixed>
     */
    public function store(string $slug, array $answers, ?Authenticatable $user): array
    {
        $group = $this->tenseGroups->findBySlugOrFail($slug);

        $attempt = Attempt::query()->create([
            'user_id' => $user?->id,
            'tense_group_id' => $group->id,
            'attempt_type' => 'grammar_group_quiz',
            'status' => 'submitted',
            'started_at' => now(),
            'submitted_at' => now(),
        ]);

        $correct = 0;
        $results = [];

        foreach ($answers as $item) {
            $question = $this->questions->findOrFail($item['question_id']);
            $graded = $this->grader->grade($question, $item['answer']);
            if ($graded['is_correct']) {
                $correct++;
            }

            AttemptAnswer::query()->create([
                'attempt_id' => $attempt->id,
                'question_id' => $question->id,
                'user_answer' => is_array($item['answer']) ? $item['answer'] : ['value' => $item['answer']],
                'is_correct' => $graded['is_correct'],
                'grading_detail' => $graded,
            ]);

            $results[] = [
                'question_id' => $question->id,
                'is_correct' => $graded['is_correct'],
                'correct_answer' => $graded['correct_answer'],
                'explanation' => $graded['explanation'],
            ];
        }

        $total = count($results);
        $attempt->update([
            'score' => $correct,
            'max_score' => $total,
        ]);

        return $this->envelope([
            'attempt_id' => $attempt->id,
            'score' => $correct,
            'max_score' => $total,
            'results' => $results,
        ]);
    }
}
