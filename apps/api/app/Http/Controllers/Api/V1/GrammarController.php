<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Question;
use App\Models\Tense;
use App\Models\TenseGroup;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @OA\Tag(name="Grammar", description="12 tenses public API")
 */
class GrammarController extends Controller
{
    /**
     * @OA\Get(path="/api/v1/grammar/tense-groups", tags={"Grammar"}, summary="List tense groups")
     */
    public function groups(): JsonResponse
    {
        $groups = TenseGroup::query()
            ->with(['tenses' => fn ($q) => $q->orderBy('sort_order')])
            ->orderBy('sort_order')
            ->get();

        return response()->json(['data' => $groups]);
    }

    /**
     * @OA\Get(path="/api/v1/grammar/tenses", tags={"Grammar"}, summary="List all tenses")
     */
    public function tenses(): JsonResponse
    {
        $tenses = Tense::query()->with('group')->orderBy('sort_order')->get();

        return response()->json(['data' => $tenses]);
    }

    /**
     * @OA\Get(path="/api/v1/grammar/tenses/{slug}", tags={"Grammar"}, summary="Tense detail")
     */
    public function show(string $slug): JsonResponse
    {
        $tense = Tense::query()->with('group')->where('slug', $slug)->firstOrFail();

        return response()->json(['data' => $tense]);
    }

    /**
     * @OA\Get(path="/api/v1/grammar/tense-groups/{slug}/quiz", tags={"Grammar"}, summary="Random quiz for group")
     */
    public function quiz(Request $request, string $slug): JsonResponse
    {
        $group = TenseGroup::query()->where('slug', $slug)->firstOrFail();
        $limit = min(20, max(5, (int) $request->query('limit', 10)));

        $questions = Question::query()
            ->where('tense_group_id', $group->id)
            ->whereNull('exam_id')
            ->inRandomOrder()
            ->limit($limit)
            ->get()
            ->map(function (Question $q) {
                return [
                    'id' => $q->id,
                    'type' => $q->type,
                    'prompt_en' => $q->prompt_en,
                    'prompt_vi' => $q->prompt_vi,
                    'options' => $q->type === 'multiple_choice' ? ($q->payload['options'] ?? []) : null,
                ];
            });

        return response()->json([
            'data' => [
                'group' => $group,
                'questions' => $questions,
            ],
        ]);
    }
}
