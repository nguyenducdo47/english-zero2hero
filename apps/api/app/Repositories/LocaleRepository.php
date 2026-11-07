<?php

namespace App\Repositories;

use App\Models\Locale;
use Illuminate\Database\Eloquent\Collection;

class LocaleRepository extends BaseRepository
{
    public function __construct(Locale $model)
    {
        parent::__construct($model);
    }

    public function activeOrdered(): Collection
    {
        return $this->query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get(['code', 'name', 'native_name', 'is_default']);
    }

    public function allOrdered(): Collection
    {
        return $this->query()->orderBy('sort_order')->get();
    }

    public function findByCodeOrFail(string $code): Locale
    {
        /** @var Locale */
        return $this->query()->findOrFail($code);
    }

    public function clearDefaultExcept(?string $code = null): void
    {
        $query = $this->query()->where('is_default', true);
        if ($code !== null) {
            $query->where('code', '!=', $code);
        }
        $query->update(['is_default' => false]);
    }
}
