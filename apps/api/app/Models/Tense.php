<?php

namespace App\Models;

use App\Models\Concerns\HasTranslations;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Tense extends Model
{
    use HasTranslations;

    protected $fillable = [
        'tense_group_id', 'slug', 'sort_order',
        'structure', 'signals', 'examples',
    ];

    protected function casts(): array
    {
        return [
            'signals' => 'array',
            'examples' => 'array',
        ];
    }

    public function group(): BelongsTo
    {
        return $this->belongsTo(TenseGroup::class, 'tense_group_id');
    }
}
