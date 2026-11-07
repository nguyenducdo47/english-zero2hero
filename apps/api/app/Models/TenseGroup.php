<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TenseGroup extends Model
{
    protected $fillable = [
        'slug', 'name_vi', 'name_en', 'sort_order',
    ];

    public function tenses(): HasMany
    {
        return $this->hasMany(Tense::class)->orderBy('sort_order');
    }

    public function questions(): HasMany
    {
        return $this->hasMany(Question::class);
    }
}
