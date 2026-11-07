<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use App\Models\MockExamRegistration;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @OA\Tag(name="MockExams", description="Mock exam registration")
 */
class MockExamController extends Controller
{
    /**
     * @OA\Post(path="/api/v1/mock-registrations", tags={"MockExams"}, security={{"sanctum":{}}})
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'exam_slug' => 'required|string|exists:exams,slug',
            'scheduled_at' => 'required|date|after:now',
        ]);

        $exam = Exam::query()->where('slug', $validated['exam_slug'])->firstOrFail();

        $registration = MockExamRegistration::query()->create([
            'user_id' => $request->user()->id,
            'exam_id' => $exam->id,
            'scheduled_at' => $validated['scheduled_at'],
            'status' => 'registered',
        ]);

        return response()->json(['data' => $registration->load('exam')], 201);
    }

    /**
     * @OA\Get(path="/api/v1/mock-registrations", tags={"MockExams"}, security={{"sanctum":{}}})
     */
    public function index(Request $request): JsonResponse
    {
        $items = MockExamRegistration::query()
            ->where('user_id', $request->user()->id)
            ->with('exam')
            ->orderByDesc('scheduled_at')
            ->paginate(20);

        return response()->json($items);
    }
}
