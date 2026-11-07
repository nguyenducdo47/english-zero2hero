<?php

namespace App\Services;

use App\Models\UserProgress;
use App\Repositories\UserProgressRepository;

class UserProgressService
{
    public function __construct(
        private readonly UserProgressRepository $progress,
    ) {}

    public function upsert(int $userId, string $key, array $payload): UserProgress
    {
        return $this->progress->upsertForUser($userId, $key, $payload);
    }

    public function show(int $userId, string $key): ?UserProgress
    {
        return $this->progress->findForUserByKey($userId, $key);
    }
}
