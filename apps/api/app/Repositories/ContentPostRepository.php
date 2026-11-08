<?php

namespace App\Repositories;

use App\Models\ContentPost;
use Illuminate\Database\Eloquent\Collection;

class ContentPostRepository extends BaseRepository
{
    public function __construct(ContentPost $model)
    {
        parent::__construct($model);
    }

    /**
     * @return Collection<int, ContentPost>
     */
    public function publishedForChannel(string $channel): Collection
    {
        return $this->query()
            ->where('channel', $channel)
            ->where('is_published', true)
            ->orderByDesc('published_at')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();
    }

    public function findPublished(string $channel, string $slug): ?ContentPost
    {
        /** @var ContentPost|null */
        return $this->query()
            ->where('channel', $channel)
            ->where('slug', $slug)
            ->where('is_published', true)
            ->first();
    }

    /**
     * @return Collection<int, ContentPost>
     */
    public function allForAdmin(?string $channel = null): Collection
    {
        $query = $this->query()->orderByDesc('published_at')->orderBy('sort_order');

        if ($channel !== null && $channel !== '') {
            $query->where('channel', $channel);
        }

        return $query->get();
    }
}
