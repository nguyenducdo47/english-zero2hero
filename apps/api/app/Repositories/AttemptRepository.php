<?php

namespace App\Repositories;

use App\Models\Attempt;

class AttemptRepository extends BaseRepository
{
    public function __construct(Attempt $model)
    {
        parent::__construct($model);
    }

    public function findForUserOrFail(int $id, int $userId): Attempt
    {
        /** @var Attempt */
        return $this->query()
            ->where('user_id', $userId)
            ->with(['answers.question', 'aiReviews', 'exam'])
            ->findOrFail($id);
    }
}
