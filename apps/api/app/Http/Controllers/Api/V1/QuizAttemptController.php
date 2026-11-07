<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Quiz\StoreQuizAttemptRequest;
use App\Services\QuizAttemptService;
use Illuminate\Http\JsonResponse;

/**
 * @OA\Tag(name="Quizzes", description="Grammar quiz attempts")
 */
class QuizAttemptController extends Controller
{
    public function __construct(
        private readonly QuizAttemptService $attempts,
    ) {}

    /**
     * @OA\Post(path="/api/v1/quizzes/tense-groups/{slug}/attempts", tags={"Quizzes"}, summary="Submit group quiz")
     */
    public function store(StoreQuizAttemptRequest $request, string $slug): JsonResponse
    {
        return response()->json(
            $this->attempts->store($slug, $request->validated('answers'), $request->user()),
        );
    }
}
