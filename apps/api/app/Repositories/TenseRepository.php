<?php

namespace App\Repositories;

use App\Models\Tense;
use Illuminate\Database\Eloquent\Collection;

class TenseRepository extends BaseRepository
{
    public function __construct(Tense $model)
    {
        parent::__construct($model);
    }

    public function allOrderedWithGroup(): Collection
    {
        return $this->query()
            ->with(['group.localeEntries', 'localeEntries'])
            ->orderBy('sort_order')
            ->get();
    }

    public function findBySlugWithGroup(string $slug): Tense
    {
        /** @var Tense */
        return $this->findBySlug($slug, ['group.localeEntries', 'localeEntries']);
    }
}
