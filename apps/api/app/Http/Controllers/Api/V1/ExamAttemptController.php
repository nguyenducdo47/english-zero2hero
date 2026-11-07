<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Attempt;
use App\Models\AttemptAnswer;
use App\Models\Exam;
use App\Models\Question;
use App\Services\AiGradingService;
use App\Services\QuizGrader;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @OA\Tag(name="Attempts", description="Exam attempts")
 */
class ExamAttemptController extends Controller
{
    public function __construct(
        private QuizGrader $grader,
        private AiGradingService $aiGrading,
    ) {}

    /**
     * @OA\Post(path="/api/v1/exams/{slug}/attempts", tags={"Attempts"}, security={{"sanctum":{}}})
     */
    public function store(Request $request, string $slug): JsonResponse
    {
        $validated = $request->validate([
            'answers' => 'nullable|array',
            'writing' => 'nullable|array',
            'writing.prompt' => 'required_with:writing.text|string',
            'writing.text' => 'required_with:writing.prompt|string',
            'speaking' => 'nullable|array',
            'speaking.transcript' => 'required_with:speaking|string',
        ]);

        $exam = Exam::query()->where('slug', $slug)->where('is_published', true)->firstOrFail();

        $attempt = Attempt::query()->create([
            'user_id' => $request->user()->id,
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
            $question = Question::query()->where('exam_id', $exam->id)->findOrFail($item['question_id']);
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
        if (! empty($validated['writing']['text'])) {
            $aiReviews['writing'] = $this->aiGrading->reviewWriting(
                $attempt,
                $validated['writing']['prompt'],
                $validated['writing']['text'],
                'writing'
            )->rubric_json;
        }
        if (! empty($validated['speaking']['transcript'])) {
            $aiReviews['speaking'] = $this->aiGrading->reviewSpeaking(
                $attempt,
                $validated['speaking']['transcript']
            )->rubric_json;
        }

        if ($total > 0) {
            $attempt->update(['score' => $correct, 'max_score' => $total]);
        }

        return response()->json([
            'data' => [
                'attempt_id' => $attempt->id,
                'objective_score' => $total ? $correct : null,
                'objective_max' => $total ?: null,
                'results' => $results,
                'ai_reviews' => $aiReviews,
            ],
        ]);
    }

    /**
     * @OA\Get(path="/api/v1/attempts/{id}", tags={"Attempts"}, security={{"sanctum":{}}})
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $attempt = Attempt::query()
            ->where('user_id', $request->user()->id)
            ->with(['answers.question', 'aiReviews', 'exam'])
            ->findOrFail($id);

        return response()->json(['data' => $attempt]);
    }
}
