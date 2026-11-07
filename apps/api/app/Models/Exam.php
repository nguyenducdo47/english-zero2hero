<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Exam extends Model
{
    protected $fillable = [
        'slug', 'title', 'exam_type', 'skill_mode',
        'target_score_min', 'target_score_max',
        'target_band_min', 'target_band_max',
        'duration_minutes', 'metadata', 'is_published',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'is_published' => 'boolean',
            'target_band_min' => 'float',
            'target_band_max' => 'float',
        ];
    }

    public function sections(): HasMany
    {
        return $this->hasMany(ExamSection::class)->orderBy('sort_order');
    }

    public function questions(): HasMany
    {
        return $this->hasMany(Question::class)->orderBy('sort_order');
    }
}
