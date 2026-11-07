<?php

namespace App\Repositories;

use App\Models\ContentSource;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ContentSourceRepository extends BaseRepository
{
    public function __construct(ContentSource $model)
    {
        parent::__construct($model);
    }

    public function paginateLatest(int $perPage = 20): LengthAwarePaginator
    {
        return $this->query()->orderByDesc('id')->paginate($perPage);
    }
}
