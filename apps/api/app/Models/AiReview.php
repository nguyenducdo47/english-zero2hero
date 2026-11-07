<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiReview extends Model
{
    protected $fillable = [
        'attempt_id', 'skill', 'rubric_json', 'model_version',
    ];

    protected function casts(): array
    {
        return [
            'rubric_json' => 'array',
        ];
    }

    public function attempt(): BelongsTo
    {
        return $this->belongsTo(Attempt::class);
    }
}
