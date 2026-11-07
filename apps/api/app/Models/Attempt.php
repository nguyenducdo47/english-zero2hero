<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Attempt extends Model
{
    protected $fillable = [
        'user_id', 'exam_id', 'tense_group_id', 'attempt_type', 'status',
        'score', 'max_score', 'started_at', 'submitted_at', 'metadata',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'started_at' => 'datetime',
            'submitted_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function exam(): BelongsTo
    {
        return $this->belongsTo(Exam::class);
    }

    public function tenseGroup(): BelongsTo
    {
        return $this->belongsTo(TenseGroup::class, 'tense_group_id');
    }

    public function answers(): HasMany
    {
        return $this->hasMany(AttemptAnswer::class);
    }

    public function aiReviews(): HasMany
    {
        return $this->hasMany(AiReview::class);
    }
}
