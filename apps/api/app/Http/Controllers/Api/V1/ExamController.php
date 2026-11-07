<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Exam\ListExamsRequest;
use App\Services\ExamCatalogService;
use Illuminate\Http\JsonResponse;

/**
 * @OA\Tag(name="Exams", description="TOEIC / IELTS exams")
 */
class ExamController extends Controller
{
    public function __construct(
        private readonly ExamCatalogService $catalog,
    ) {}

    /**
     * @OA\Get(path="/api/v1/exams", tags={"Exams"}, security={{"sanctum":{}}})
     */
    public function index(ListExamsRequest $request): JsonResponse
    {
        $paginator = $this->catalog->listPublished(
            $request->examType(),
            $request->skillMode(),
        );

        return response()->json($paginator);
    }

    /**
     * @OA\Get(path="/api/v1/exams/{slug}", tags={"Exams"}, security={{"sanctum":{}}})
     */
    public function show(string $slug): JsonResponse
    {
        return response()->json($this->catalog->showPublished($slug));
    }
}
