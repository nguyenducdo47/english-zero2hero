<?php

namespace App\Repositories;

use App\Models\StaticPage;
use Illuminate\Database\Eloquent\Collection;

class StaticPageRepository extends BaseRepository
{
    public function __construct(StaticPage $model)
    {
        parent::__construct($model);
    }

    /**
     * @return Collection<int, StaticPage>
     */
    public function publishedOrdered(): Collection
    {
        return $this->query()
            ->where('is_published', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();
    }

    /**
     * @return Collection<int, StaticPage>
     */
    public function footerPublished(): Collection
    {
        return $this->query()
            ->where('is_published', true)
            ->where('show_in_footer', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();
    }

    /**
     * @return Collection<int, StaticPage>
     */
    public function allForAdminIndex(): Collection
    {
        return $this->query()->orderBy('sort_order')->orderBy('id')->get();
    }

    public function findPublishedBySlug(string $slug): ?StaticPage
    {
        /** @var StaticPage|null */
        return $this->query()
            ->where('slug', $slug)
            ->where('is_published', true)
            ->first();
    }
}
