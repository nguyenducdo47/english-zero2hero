<?php

namespace App\Repositories;

use App\Models\MockExamRegistration;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class MockExamRegistrationRepository extends BaseRepository
{
    public function __construct(MockExamRegistration $model)
    {
        parent::__construct($model);
    }

    public function paginateForUser(int $userId, int $perPage = 20): LengthAwarePaginator
    {
        return $this->query()
            ->where('user_id', $userId)
            ->with('exam')
            ->orderByDesc('scheduled_at')
            ->paginate($perPage);
    }
}
