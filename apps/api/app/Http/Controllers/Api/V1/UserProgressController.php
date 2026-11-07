<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\UserProgress\ShowUserProgressRequest;
use App\Http\Requests\Api\V1\UserProgress\UpsertUserProgressRequest;
use App\Services\UserProgressService;
use Illuminate\Http\JsonResponse;

/**
 * @OA\Tag(name="Progress", description="User learning progress")
 */
class UserProgressController extends Controller
{
    public function __construct(
        private readonly UserProgressService $progress,
    ) {}

    /**
     * @OA\Put(path="/api/v1/user/progress/{key}", tags={"Progress"}, security={{"sanctum":{}}})
     */
    public function upsert(UpsertUserProgressRequest $request, string $key): JsonResponse
    {
        return response()->json([
            'data' => $this->progress->upsert(
                $request->user()->id,
                $key,
                $request->validated('payload'),
            ),
        ]);
    }

    /**
     * @OA\Get(path="/api/v1/user/progress/{key}", tags={"Progress"}, security={{"sanctum":{}}})
     */
    public function show(ShowUserProgressRequest $request, string $key): JsonResponse
    {
        return response()->json([
            'data' => $this->progress->show($request->user()->id, $key),
        ]);
    }
}
