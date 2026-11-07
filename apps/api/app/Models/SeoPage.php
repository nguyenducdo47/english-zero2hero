<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SeoPage extends Model
{
    protected $fillable = [
        'route_key', 'locale', 'title', 'description', 'canonical_path',
        'og_title', 'og_description', 'og_image_url',
        'robots_index', 'robots_follow', 'structured_data',
    ];

    protected function casts(): array
    {
        return [
            'robots_index' => 'boolean',
            'robots_follow' => 'boolean',
            'structured_data' => 'array',
        ];
    }
}
