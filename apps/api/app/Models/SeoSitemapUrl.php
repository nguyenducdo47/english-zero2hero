<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SeoSitemapUrl extends Model
{
    public const CHANGEFREQ_VALUES = [
        'always',
        'hourly',
        'daily',
        'weekly',
        'monthly',
        'yearly',
        'never',
    ];

    protected $fillable = [
        'name',
        'loc',
        'locale',
        'priority',
        'changefreq',
        'is_enabled',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'priority' => 'float',
            'is_enabled' => 'boolean',
            'sort_order' => 'integer',
        ];
    }
}
