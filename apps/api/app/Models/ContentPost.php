<?php

namespace App\Models;

use App\Models\Concerns\HasTranslations;
use Illuminate\Database\Eloquent\Model;

class ContentPost extends Model
{
    use HasTranslations;

    public const CHANNEL_BLOG = 'blog';

    public const CHANNEL_NEWS = 'news';

    public const CHANNELS = [
        self::CHANNEL_BLOG,
        self::CHANNEL_NEWS,
    ];

    protected $fillable = [
        'channel',
        'slug',
        'is_published',
        'published_at',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'is_published' => 'boolean',
            'published_at' => 'datetime',
            'sort_order' => 'integer',
        ];
    }
}
