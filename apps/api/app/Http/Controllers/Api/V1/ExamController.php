<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @OA\Tag(name="Exams", description="TOEIC / IELTS exams")
 */
class ExamController extends Controller
{
    /**
     * @OA\Get(path="/api/v1/exams", tags={"Exams"}, security={{"sanctum":{}}})
     */
    public function index(Request $request): JsonResponse
    {
        $query = Exam::query()->where('is_published', true);

        if ($type = $request->query('exam_type')) {
            $query->where('exam_type', $type);
        }
        if ($mode = $request->query('skill_mode')) {
            $query->where('skill_mode', $mode);
        }

        $exams = $query->orderBy('id')->paginate(20);

        return response()->json($exams);
    }

    /**
     * @OA\Get(path="/api/v1/exams/{slug}", tags={"Exams"}, security={{"sanctum":{}}})
     */
    public function show(string $slug): JsonResponse
    {
        $exam = Exam::query()
            ->where('slug', $slug)
            ->where('is_published', true)
            ->with(['sections', 'questions' => fn ($q) => $q->orderBy('sort_order')])
            ->firstOrFail();

        $exam->setRelation('questions', $exam->questions->map(function ($q) {
            return [
                'id' => $q->id,
                'type' => $q->type,
                'prompt_en' => $q->prompt_en,
                'prompt_vi' => $q->prompt_vi,
                'options' => $q->type === 'multiple_choice' ? ($q->payload['options'] ?? []) : null,
            ];
        }));

        return response()->json(['data' => $exam]);
    }
}
