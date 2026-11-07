<?php

namespace App\Repositories;

use App\Models\UserProgress;

class UserProgressRepository extends BaseRepository
{
    public function __construct(UserProgress $model)
    {
        parent::__construct($model);
    }

    public function findForUserByKey(int $userId, string $key): ?UserProgress
    {
        /** @var UserProgress|null */
        return $this->query()
            ->where('user_id', $userId)
            ->where('progress_key', $key)
            ->first();
    }

    public function upsertForUser(int $userId, string $key, array $payload): UserProgress
    {
        /** @var UserProgress */
        return $this->query()->updateOrCreate(
            ['user_id' => $userId, 'progress_key' => $key],
            ['payload' => $payload],
        );
    }
}
