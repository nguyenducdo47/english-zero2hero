<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Attempt;
use App\Models\AttemptAnswer;
use App\Models\Question;
use App\Models\TenseGroup;
use App\Services\QuizGrader;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @OA\Tag(name="Quizzes", description="Grammar quiz attempts")
 */
class QuizAttemptController extends Controller
{
    public function __construct(private QuizGrader $grader) {}

    /**
     * @OA\Post(path="/api/v1/quizzes/tense-groups/{slug}/attempts", tags={"Quizzes"}, summary="Submit group quiz")
     */
    public function store(Request $request, string $slug): JsonResponse
    {
        $validated = $request->validate([
            'answers' => 'required|array',
            'answers.*.question_id' => 'required|integer|exists:questions,id',
            'answers.*.answer' => 'required',
        ]);

        $group = TenseGroup::query()->where('slug', $slug)->firstOrFail();

        $attempt = Attempt::query()->create([
            'user_id' => $request->user()?->id,
            'tense_group_id' => $group->id,
            'attempt_type' => 'grammar_group_quiz',
            'status' => 'submitted',
            'started_at' => now(),
            'submitted_at' => now(),
        ]);

        $correct = 0;
        $results = [];

        foreach ($validated['answers'] as $item) {
            $question = Question::query()->findOrFail($item['question_id']);
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

        return response()->json([
            'data' => [
                'attempt_id' => $attempt->id,
                'score' => $correct,
                'max_score' => $total,
                'results' => $results,
            ],
        ]);
    }
}
