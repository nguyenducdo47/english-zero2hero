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

    /**
     * @return \Illuminate\Database\Eloquent\Collection<int, Tense>
     */
    public function forAdminIndex(?int $tenseGroupId = null)
    {
        $query = $this->query()->with('group')->orderBy('sort_order');

        if ($tenseGroupId !== null) {
            $query->where('tense_group_id', $tenseGroupId);
        }

        return $query->get();
    }

    /**
     * @return \Illuminate\Database\Eloquent\Collection<int, Tense>
     */
    public function forCatalog(?int $groupId = null)
    {
        $query = $this->query()->with('group')->orderBy('sort_order');

        if ($groupId !== null) {
            $query->where('tense_group_id', $groupId);
        }

        return $query->get();
    }
}
