<?php

namespace App\Repositories;

use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class UserRepository extends BaseRepository
{
    public function __construct(User $model)
    {
        parent::__construct($model);
    }

    public function findByEmail(string $email): ?User
    {
        /** @var User|null */
        return $this->query()->where('email', $email)->first();
    }

    public function paginateForAdmin(int $perPage): LengthAwarePaginator
    {
        return $this->query()
            ->with('roles:id,slug,name')
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    public function createUser(array $attributes): User
    {
        return $this->create($attributes);
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function upsertGoogleUser(string $email, array $attributes): User
    {
        /** @var User */
        return $this->query()->updateOrCreate(['email' => $email], $attributes);
    }
}
