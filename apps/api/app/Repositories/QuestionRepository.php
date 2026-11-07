<?php

namespace App\Repositories;

use App\Models\Question;
use App\Models\TenseGroup;
use Illuminate\Database\Eloquent\Collection;

class QuestionRepository extends BaseRepository
{
    public function __construct(Question $model)
    {
        parent::__construct($model);
    }

    public function randomGrammarQuizForGroup(TenseGroup $group, int $limit): Collection
    {
        return $this->query()
            ->with('localeEntries')
            ->where('tense_group_id', $group->id)
            ->whereNull('exam_id')
            ->inRandomOrder()
            ->limit($limit)
            ->get();
    }
}
