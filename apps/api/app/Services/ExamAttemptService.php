<?php

namespace App\Services;

use App\Models\Attempt;
use App\Models\AttemptAnswer;
use App\Repositories\AttemptRepository;
use App\Repositories\ExamRepository;
use App\Repositories\QuestionRepository;
use Illuminate\Contracts\Auth\Authenticatable;

class ExamAttemptService extends BaseService
{
    public function __construct(
        private readonly ExamRepository $exams,
        private readonly QuestionRepository $questions,
        private readonly AttemptRepository $attempts,
        private readonly QuizGrader $grader,
        private readonly AiGradingService $aiGrading,
    ) {}

    /**
     * @param  array<string, mixed>  $validated
     * @return array<string, mixed>
     */
    public function store(string $slug, array $validated, Authenticatable $user): array
    {
        $exam = $this->exams->findPublishedBySlug($slug);

        $attempt = Attempt::query()->create([
            'user_id' => $user->id,
            'exam_id' => $exam->id,
            'attempt_type' => 'exam',
            'status' => 'submitted',
            'started_at' => now(),
            'submitted_at' => now(),
        ]);

        $correct = 0;
        $total = 0;
        $results = [];

        foreach ($validated['answers'] ?? [] as $item) {
            $question = $this->questions->findForExamOrFail((int) $item['question_id'], $exam->id);
            $graded = $this->grader->grade($question, $item['answer']);
            $total++;
            if ($graded['is_correct']) {
                $correct++;
            }

            AttemptAnswer::query()->create([
                'attempt_id' => $attempt->id,
                'question_id' => $question->id,
                'user_answer' => $item['answer'],
                'is_correct' => $graded['is_correct'],
                'grading_detail' => $graded,
            ]);

            $results[] = array_merge(['question_id' => $question->id], $graded);
        }

        $aiReviews = [];
        if (! empty($validated['writing']['text'] ?? null)) {
            $aiReviews['writing'] = $this->aiGrading->reviewWriting(
                $attempt,
                $validated['writing']['prompt'],
                $validated['writing']['text'],
                'writing'
            )->rubric_json;
        }
        if (! empty($validated['speaking']['transcript'] ?? null)) {
            $aiReviews['speaking'] = $this->aiGrading->reviewSpeaking(
                $attempt,
                $validated['speaking']['transcript']
            )->rubric_json;
        }

        if ($total > 0) {
            $attempt->update(['score' => $correct, 'max_score' => $total]);
        }

        return $this->envelope([
            'attempt_id' => $attempt->id,
            'objective_score' => $total ? $correct : null,
            'objective_max' => $total ?: null,
            'results' => $results,
            'ai_reviews' => $aiReviews,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function show(int $id, int $userId): array
    {
        $attempt = $this->attempts->findForUserOrFail($id, $userId);

        return ['data' => $attempt];
    }
}
