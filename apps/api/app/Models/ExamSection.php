<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExamSection extends Model
{
    protected $fillable = [
        'exam_id', 'skill', 'title', 'sort_order', 'time_limit_minutes',
    ];

    public function exam(): BelongsTo
    {
        return $this->belongsTo(Exam::class);
    }
}
