<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\Exam\DestroyExamRequest;
use App\Http\Requests\Api\V1\Admin\Exam\IndexExamsAdminRequest;
use App\Http\Requests\Api\V1\Admin\Exam\ShowExamAdminRequest;
use App\Http\Requests\Api\V1\Admin\Exam\StoreExamRequest;
use App\Http\Requests\Api\V1\Admin\Exam\UpdateExamRequest;
use App\Models\Exam;
use App\Services\ExamAdminService;
use Illuminate\Http\JsonResponse;

class ExamAdminController extends Controller
{
    public function __construct(
        private readonly ExamAdminService $exams,
    ) {}

    public function index(IndexExamsAdminRequest $request): JsonResponse
    {
        return response()->json($this->exams->index());
    }

    public function show(ShowExamAdminRequest $request, Exam $exam): JsonResponse
    {
        return response()->json($this->exams->show($exam));
    }

    public function store(StoreExamRequest $request): JsonResponse
    {
        return response()->json($this->exams->store($request->validated()), 201);
    }

    public function update(UpdateExamRequest $request, Exam $exam): JsonResponse
    {
        return response()->json($this->exams->update($exam, $request->validated()));
    }

    public function destroy(DestroyExamRequest $request, Exam $exam): JsonResponse
    {
        return response()->json($this->exams->destroy($exam));
    }
}
