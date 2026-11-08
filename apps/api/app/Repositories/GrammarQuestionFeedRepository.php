<?php

namespace App\Repositories;

use App\Models\GrammarQuestionFeed;
use Illuminate\Database\Eloquent\Collection;

class GrammarQuestionFeedRepository extends BaseRepository
{
    public function __construct(GrammarQuestionFeed $model)
    {
        parent::__construct($model);
    }

    /**
     * @return Collection<int, GrammarQuestionFeed>
     */
    public function allOrdered(): Collection
    {
        return $this->query()->orderBy('sort_order')->orderBy('id')->get();
    }

    /**
     * @return Collection<int, GrammarQuestionFeed>
     */
    public function enabledOrdered(): Collection
    {
        return $this->query()
            ->where('is_enabled', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();
    }
}
