<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\ExamAttempt\ShowExamAttemptRequest;
use App\Http\Requests\Api\V1\ExamAttempt\StoreExamAttemptRequest;
use App\Services\ExamAttemptService;
use Illuminate\Http\JsonResponse;

/**
 * @OA\Tag(name="Attempts", description="Exam attempts")
 */
class ExamAttemptController extends Controller
{
    public function __construct(
        private readonly ExamAttemptService $attempts,
    ) {}

    /**
     * @OA\Post(path="/api/v1/exams/{slug}/attempts", tags={"Attempts"}, security={{"sanctum":{}}})
     */
    public function store(StoreExamAttemptRequest $request, string $slug): JsonResponse
    {
        return response()->json(
            $this->attempts->store($slug, $request->validated(), $request->user()),
        );
    }

    /**
     * @OA\Get(path="/api/v1/attempts/{id}", tags={"Attempts"}, security={{"sanctum":{}}})
     */
    public function show(ShowExamAttemptRequest $request, int $id): JsonResponse
    {
        return response()->json(
            $this->attempts->show($id, $request->user()->id),
        );
    }
}
