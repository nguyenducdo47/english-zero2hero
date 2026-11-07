<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\User\DestroyUserRequest;
use App\Http\Requests\Api\V1\Admin\User\IndexUsersRequest;
use App\Http\Requests\Api\V1\Admin\User\RolesListRequest;
use App\Http\Requests\Api\V1\Admin\User\UpdateUserRequest;
use App\Models\User;
use App\Services\UserAdminService;
use Illuminate\Http\JsonResponse;

class UserAdminController extends Controller
{
    public function __construct(
        private readonly UserAdminService $users,
    ) {}

    public function index(IndexUsersRequest $request): JsonResponse
    {
        return response()->json($this->users->index($request->perPage()));
    }

    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        return response()->json([
            'data' => $this->users->update($user, $request->validated(), $request->user()),
        ]);
    }

    public function destroy(DestroyUserRequest $request, User $user): JsonResponse
    {
        return response()->json(['data' => $this->users->destroy($user, $request->user())]);
    }

    public function rolesList(RolesListRequest $request): JsonResponse
    {
        return response()->json($this->users->rolesList());
    }
}
