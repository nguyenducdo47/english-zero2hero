<?php

namespace App\Models;

use App\Models\Concerns\HasTranslations;
use Illuminate\Database\Eloquent\Model;

class StaticPage extends Model
{
    use HasTranslations;

    public const KIND_GENERIC = 'generic';

    public const KIND_BLOG = 'blog';

    public const KIND_NEWS = 'news';

    public const KINDS = [
        self::KIND_GENERIC,
        self::KIND_BLOG,
        self::KIND_NEWS,
    ];

    protected $fillable = [
        'slug',
        'page_kind',
        'is_published',
        'show_in_header',
        'show_in_footer',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'is_published' => 'boolean',
            'show_in_header' => 'boolean',
            'show_in_footer' => 'boolean',
            'sort_order' => 'integer',
        ];
    }
}
