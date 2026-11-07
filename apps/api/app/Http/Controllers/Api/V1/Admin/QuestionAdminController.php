<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\Question\DestroyQuestionRequest;
use App\Http\Requests\Api\V1\Admin\Question\IndexQuestionsAdminRequest;
use App\Http\Requests\Api\V1\Admin\Question\StoreQuestionRequest;
use App\Http\Requests\Api\V1\Admin\Question\UpdateQuestionRequest;
use App\Models\Question;
use App\Services\QuestionAdminService;
use Illuminate\Http\JsonResponse;

class QuestionAdminController extends Controller
{
    public function __construct(
        private readonly QuestionAdminService $questions,
    ) {}

    public function index(IndexQuestionsAdminRequest $request): JsonResponse
    {
        return response()->json($this->questions->index(
            $request->perPage(),
            $request->tenseGroupId(),
            $request->examId(),
            $request->scope(),
        ));
    }

    public function store(StoreQuestionRequest $request): JsonResponse
    {
        return response()->json($this->questions->store($request->validated()), 201);
    }

    public function update(UpdateQuestionRequest $request, Question $question): JsonResponse
    {
        return response()->json($this->questions->update($question, $request->validated()));
    }

    public function destroy(DestroyQuestionRequest $request, Question $question): JsonResponse
    {
        return response()->json($this->questions->destroy($question));
    }
}
