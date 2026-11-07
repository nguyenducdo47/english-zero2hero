<?php

namespace App\Models;

use App\Models\Concerns\HasTranslations;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TenseGroup extends Model
{
    use HasTranslations;

    protected $fillable = [
        'slug', 'sort_order',
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
