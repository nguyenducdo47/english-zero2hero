<?php

namespace App\Repositories;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

abstract class BaseRepository
{
    public function __construct(protected Model $model) {}

    protected function query(): Builder
    {
        return $this->model->newQuery();
    }

    public function all(array $columns = ['*']): Collection
    {
        return $this->query()->get($columns);
    }

    public function find(int|string $id, array $columns = ['*']): ?Model
    {
        return $this->query()->find($id, $columns);
    }

    public function findOrFail(int|string $id, array $columns = ['*']): Model
    {
        return $this->query()->findOrFail($id, $columns);
    }

    public function findBySlug(string $slug, array $with = []): Model
    {
        $query = $this->query()->where('slug', $slug);

        if ($with !== []) {
            $query->with($with);
        }

        return $query->firstOrFail();
    }

    public function create(array $attributes): Model
    {
        return $this->query()->create($attributes);
    }

    public function update(Model $instance, array $attributes): Model
    {
        $instance->update($attributes);

        return $instance->refresh();
    }

    public function delete(Model $instance): bool
    {
        return (bool) $instance->delete();
    }

    public function getModel(): Model
    {
        return $this->model;
    }
}
