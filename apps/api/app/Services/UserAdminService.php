<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\RoleRepository;
use App\Repositories\UserRepository;
use Illuminate\Http\Exceptions\HttpResponseException;

class UserAdminService
{
    public function __construct(
        private readonly UserRepository $users,
        private readonly RoleRepository $roles,
    ) {}

    /**
     * @return array{data: list<mixed>, meta: array<string, int>}
     */
    public function index(int $perPage): array
    {
        $paginator = $this->users->paginateForAdmin($perPage);

        return [
            'data' => $paginator->items(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'total' => $paginator->total(),
            ],
        ];
    }

    public function update(User $user, array $validated, User $actor): User
    {
        if (array_key_exists('name', $validated)) {
            $user->name = $validated['name'];
        }

        if (array_key_exists('is_admin', $validated)) {
            if ($actor->id === $user->id && ! $validated['is_admin']) {
                throw new HttpResponseException(response()->json([
                    'message' => 'You cannot remove your own admin flag.',
                ], 422));
            }
            $user->is_admin = $validated['is_admin'];
        }

        $user->save();

        if (array_key_exists('role_ids', $validated)) {
            $user->roles()->sync($validated['role_ids']);
        }

        $user->load('roles:id,slug,name');

        return $user;
    }

    /**
     * @return array{deleted: bool}
     */
    public function destroy(User $user, User $actor): array
    {
        if ($actor->id === $user->id) {
            throw new HttpResponseException(response()->json([
                'message' => 'You cannot delete your own account.',
            ], 422));
        }

        $user->tokens()->delete();
        $user->roles()->detach();
        $user->delete();

        return ['deleted' => true];
    }

    /**
     * @return array{data: mixed}
     */
    public function rolesList(): array
    {
        return ['data' => $this->roles->allOrderedBasic()];
    }
}
