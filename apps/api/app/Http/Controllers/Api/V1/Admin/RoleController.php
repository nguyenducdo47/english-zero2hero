<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\Role\DestroyRoleRequest;
use App\Http\Requests\Api\V1\Admin\Role\IndexRolesRequest;
use App\Http\Requests\Api\V1\Admin\Role\StoreRoleRequest;
use App\Http\Requests\Api\V1\Admin\Role\UpdateRoleRequest;
use App\Models\Role;
use App\Services\RoleAdminService;
use Illuminate\Http\JsonResponse;

class RoleController extends Controller
{
    public function __construct(
        private readonly RoleAdminService $roles,
    ) {}

    public function index(IndexRolesRequest $request): JsonResponse
    {
        return response()->json($this->roles->index());
    }

    public function store(StoreRoleRequest $request): JsonResponse
    {
        return response()->json(['data' => $this->roles->store($request->validated())], 201);
    }

    public function update(UpdateRoleRequest $request, Role $role): JsonResponse
    {
        return response()->json(['data' => $this->roles->update($role, $request->validated())]);
    }

    public function destroy(DestroyRoleRequest $request, Role $role): JsonResponse
    {
        return response()->json(['data' => $this->roles->destroy($role)]);
    }
}
