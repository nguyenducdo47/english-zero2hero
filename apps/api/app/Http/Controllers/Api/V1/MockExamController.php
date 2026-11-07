<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\MockExam\IndexMockRegistrationsRequest;
use App\Http\Requests\Api\V1\MockExam\StoreMockRegistrationRequest;
use App\Services\MockExamRegistrationService;
use Illuminate\Http\JsonResponse;

/**
 * @OA\Tag(name="MockExams", description="Mock exam registration")
 */
class MockExamController extends Controller
{
    public function __construct(
        private readonly MockExamRegistrationService $registrations,
    ) {}

    /**
     * @OA\Post(path="/api/v1/mock-registrations", tags={"MockExams"}, security={{"sanctum":{}}})
     */
    public function store(StoreMockRegistrationRequest $request): JsonResponse
    {
        $registration = $this->registrations->store(
            $request->validated(),
            $request->user()->id,
        );

        return response()->json(['data' => $registration], 201);
    }

    /**
     * @OA\Get(path="/api/v1/mock-registrations", tags={"MockExams"}, security={{"sanctum":{}}})
     */
    public function index(IndexMockRegistrationsRequest $request): JsonResponse
    {
        return response()->json($this->registrations->indexForUser($request->user()->id));
    }
}
