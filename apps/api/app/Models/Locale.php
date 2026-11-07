<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Locale extends Model
{
    public $incrementing = false;

    protected $primaryKey = 'code';

    protected $keyType = 'string';

    protected $fillable = [
        'code', 'name', 'native_name', 'is_default', 'is_active', 'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'is_default' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public static function activeCodes(): array
    {
        return Cache::remember('locales.active', 3600, function () {
            return self::query()
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->pluck('code')
                ->all();
        });
    }

    public static function defaultCode(): string
    {
        return Cache::remember('locales.default', 3600, function () {
            return self::query()
                ->where('is_default', true)
                ->value('code') ?? 'vi';
        });
    }

    protected static function booted(): void
    {
        static::saved(fn () => Cache::forget('locales.active'));
        static::saved(fn () => Cache::forget('locales.default'));
        static::deleted(fn () => Cache::forget('locales.active'));
        static::deleted(fn () => Cache::forget('locales.default'));
    }
}
