<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SeoGlobal extends Model
{
    protected $table = 'seo_global';

    protected $fillable = [
        'site_name', 'default_title', 'default_description', 'default_keywords',
        'og_title', 'og_description', 'og_image_url', 'favicon_url', 'site_logo_url',
        'twitter_card',
        'canonical_base', 'robots_default_index', 'robots_default_follow',
        'default_locale', 'organization_name', 'organization_logo_url',
        'organization_url', 'maintenance_noindex',
    ];

    protected function casts(): array
    {
        return [
            'robots_default_index' => 'boolean',
            'robots_default_follow' => 'boolean',
            'maintenance_noindex' => 'boolean',
        ];
    }
}
