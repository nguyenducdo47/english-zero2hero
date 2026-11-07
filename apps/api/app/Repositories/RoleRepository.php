<?php

namespace App\Repositories;

use App\Models\Role;
use Illuminate\Database\Eloquent\Collection;

class RoleRepository extends BaseRepository
{
    public function __construct(Role $model)
    {
        parent::__construct($model);
    }

    public function allWithUserCount(): Collection
    {
        return $this->query()->orderBy('name')->withCount('users')->get();
    }

    public function allOrderedBasic(): Collection
    {
        return $this->query()->orderBy('name')->get(['id', 'slug', 'name']);
    }
}
