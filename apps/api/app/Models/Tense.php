<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Tense extends Model
{
    protected $fillable = [
        'tense_group_id', 'slug', 'name_en', 'name_vi', 'sort_order',
        'structure', 'usage_vi', 'signals', 'pitfalls_vi', 'examples',
    ];

    protected function casts(): array
    {
        return [
            'usage_vi' => 'array',
            'signals' => 'array',
            'examples' => 'array',
        ];
    }

    public function group(): BelongsTo
    {
        return $this->belongsTo(TenseGroup::class, 'tense_group_id');
    }
}
