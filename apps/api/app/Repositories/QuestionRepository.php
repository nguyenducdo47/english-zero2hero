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

    public function findForExamOrFail(int $questionId, int $examId): Question
    {
        /** @var Question */
        return $this->query()
            ->where('exam_id', $examId)
            ->findOrFail($questionId);
    }

    public function paginateForAdmin(
        int $perPage,
        ?int $tenseGroupId,
        ?int $examId,
        ?string $scope,
    ): \Illuminate\Contracts\Pagination\LengthAwarePaginator {
        $query = $this->query()
            ->with(['exam:id,slug,title', 'tenseGroup:id,slug'])
            ->orderBy('sort_order')
            ->orderBy('id');

        if ($tenseGroupId !== null) {
            $query->where('tense_group_id', $tenseGroupId);
        }

        if ($examId !== null) {
            $query->where('exam_id', $examId);
        }

        if ($scope === 'grammar') {
            $query->whereNotNull('tense_group_id')->whereNull('exam_id');
        } elseif ($scope === 'exam') {
            $query->whereNotNull('exam_id');
        }

        return $query->paginate($perPage);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Collection<int, Question>
     */
    public function forCatalog(?int $tenseGroupId, ?int $examId, int $limit = 500)
    {
        $query = $this->query()->with(['exam', 'tenseGroup'])->orderBy('id');

        if ($tenseGroupId !== null) {
            $query->where('tense_group_id', $tenseGroupId);
        }

        if ($examId !== null) {
            $query->where('exam_id', $examId);
        }

        return $query->limit($limit)->get();
    }
}
