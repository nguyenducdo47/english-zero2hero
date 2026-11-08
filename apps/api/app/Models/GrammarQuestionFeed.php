<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GrammarQuestionFeed extends Model
{
    protected $fillable = [
        'name',
        'feed_url',
        'adapter',
        'is_enabled',
        'default_tense_group_slug',
        'license',
        'notes',
        'last_fetched_at',
        'last_result',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'is_enabled' => 'boolean',
            'last_fetched_at' => 'datetime',
            'last_result' => 'array',
        ];
    }
}
