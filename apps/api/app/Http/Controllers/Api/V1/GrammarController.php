<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\GrammarService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GrammarController extends Controller
{
    public function __construct(private GrammarService $grammar) {}

    public function groups(): JsonResponse
    {
        return response()->json($this->grammar->listGroups());
    }

    public function tenses(): JsonResponse
    {
        return response()->json($this->grammar->listTenses());
    }

    public function show(string $slug): JsonResponse
    {
        return response()->json($this->grammar->showTense($slug));
    }

    public function quiz(Request $request, string $slug): JsonResponse
    {
        $limit = (int) $request->query('limit', 10);

        return response()->json($this->grammar->quizForGroup($slug, $limit));
    }
}
