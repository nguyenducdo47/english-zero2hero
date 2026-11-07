<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\Tense\DestroyTenseRequest;
use App\Http\Requests\Api\V1\Admin\Tense\IndexTensesAdminRequest;
use App\Http\Requests\Api\V1\Admin\Tense\StoreTenseRequest;
use App\Http\Requests\Api\V1\Admin\Tense\UpdateTenseRequest;
use App\Models\Tense;
use App\Services\TenseAdminService;
use Illuminate\Http\JsonResponse;

class TenseAdminController extends Controller
{
    public function __construct(
        private readonly TenseAdminService $tenses,
    ) {}

    public function index(IndexTensesAdminRequest $request): JsonResponse
    {
        return response()->json($this->tenses->index($request->tenseGroupId()));
    }

    public function store(StoreTenseRequest $request): JsonResponse
    {
        return response()->json($this->tenses->store($request->validated()), 201);
    }

    public function update(UpdateTenseRequest $request, Tense $tense): JsonResponse
    {
        return response()->json($this->tenses->update($tense, $request->validated()));
    }

    public function destroy(DestroyTenseRequest $request, Tense $tense): JsonResponse
    {
        return response()->json($this->tenses->destroy($tense));
    }
}
