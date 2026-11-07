<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MockExamRegistration extends Model
{
    protected $fillable = [
        'user_id', 'exam_id', 'scheduled_at', 'status', 'attempt_id',
    ];

    protected function casts(): array
    {
        return [
            'scheduled_at' => 'datetime',
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

    public function attempt(): BelongsTo
    {
        return $this->belongsTo(Attempt::class);
    }
}
