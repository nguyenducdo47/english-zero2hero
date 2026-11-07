<?php

namespace App\Services;

use App\Models\Role;
use App\Repositories\RoleRepository;
use Illuminate\Http\Exceptions\HttpResponseException;

class RoleAdminService
{
    public function __construct(
        private readonly RoleRepository $roles,
    ) {}

    /**
     * @return array{data: mixed, meta: array{permissions: array<string, mixed>}}
     */
    public function index(): array
    {
        return [
            'data' => $this->roles->allWithUserCount(),
            'meta' => ['permissions' => config('admin_permissions', [])],
        ];
    }

    public function store(array $validated): Role
    {
        $validated['is_system'] = false;

        return $this->roles->create($validated);
    }

    public function update(Role $role, array $validated): Role
    {
        if ($role->is_system) {
            unset($validated['slug']);
        }

        $this->roles->update($role, $validated);

        return $role->fresh();
    }

    /**
     * @return array{deleted: bool}
     */
    public function destroy(Role $role): array
    {
        if ($role->is_system) {
            throw new HttpResponseException(response()->json([
                'message' => 'System roles cannot be deleted.',
            ], 422));
        }

        if ($role->users()->exists()) {
            throw new HttpResponseException(response()->json([
                'message' => 'Remove users from this role first.',
            ], 422));
        }

        $this->roles->delete($role);

        return ['deleted' => true];
    }
}
