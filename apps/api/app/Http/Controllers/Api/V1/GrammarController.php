<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Grammar\GrammarCatalogRequest;
use App\Http\Requests\Api\V1\Grammar\GrammarQuizQueryRequest;
use App\Services\GrammarService;
use Illuminate\Http\JsonResponse;

class GrammarController extends Controller
{
    public function __construct(
        private readonly GrammarService $grammar,
    ) {}

    public function groups(GrammarCatalogRequest $request): JsonResponse
    {
        return response()->json($this->grammar->listGroups());
    }

    public function tenses(GrammarCatalogRequest $request): JsonResponse
    {
        return response()->json($this->grammar->listTenses());
    }

    public function show(GrammarCatalogRequest $request, string $slug): JsonResponse
    {
        return response()->json($this->grammar->showTense($slug));
    }

    public function quiz(GrammarQuizQueryRequest $request, string $slug): JsonResponse
    {
        return response()->json($this->grammar->quizForGroup($slug, $request->limit()));
    }

    public function tenseQuiz(GrammarQuizQueryRequest $request, string $slug): JsonResponse
    {
        return response()->json($this->grammar->quizForTense($slug, $request->limit()));
    }
}
