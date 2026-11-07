<?php

namespace App\Repositories;

use App\Models\TenseGroup;
use Illuminate\Database\Eloquent\Collection;

class TenseGroupRepository extends BaseRepository
{
    public function __construct(TenseGroup $model)
    {
        parent::__construct($model);
    }

    public function allOrderedWithTenses(): Collection
    {
        return $this->query()
            ->with([
                'localeEntries',
                'tenses' => fn ($q) => $q->with('localeEntries')->orderBy('sort_order'),
            ])
            ->orderBy('sort_order')
            ->get();
    }

    public function findBySlugWithTranslations(string $slug): TenseGroup
    {
        /** @var TenseGroup */
        return $this->findBySlug($slug, ['localeEntries']);
    }
}
