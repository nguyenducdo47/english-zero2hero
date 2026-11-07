<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\TenseGroup\DestroyTenseGroupRequest;
use App\Http\Requests\Api\V1\Admin\TenseGroup\IndexTenseGroupsAdminRequest;
use App\Http\Requests\Api\V1\Admin\TenseGroup\StoreTenseGroupRequest;
use App\Http\Requests\Api\V1\Admin\TenseGroup\UpdateTenseGroupRequest;
use App\Models\TenseGroup;
use App\Services\TenseGroupAdminService;
use Illuminate\Http\JsonResponse;

class TenseGroupAdminController extends Controller
{
    public function __construct(
        private readonly TenseGroupAdminService $groups,
    ) {}

    public function index(IndexTenseGroupsAdminRequest $request): JsonResponse
    {
        return response()->json($this->groups->index());
    }

    public function store(StoreTenseGroupRequest $request): JsonResponse
    {
        return response()->json($this->groups->store($request->validated()), 201);
    }

    public function update(UpdateTenseGroupRequest $request, TenseGroup $tenseGroup): JsonResponse
    {
        return response()->json($this->groups->update($tenseGroup, $request->validated()));
    }

    public function destroy(DestroyTenseGroupRequest $request, TenseGroup $tenseGroup): JsonResponse
    {
        return response()->json($this->groups->destroy($tenseGroup));
    }
}
