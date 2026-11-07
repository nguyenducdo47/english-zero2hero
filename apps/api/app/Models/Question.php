<?php

namespace App\Models;

use App\Models\Concerns\HasTranslations;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Question extends Model
{
    use HasTranslations;

    protected $fillable = [
        'tense_group_id', 'exam_id', 'type',
        'payload', 'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'payload' => 'array',
        ];
    }

    public function tenseGroup(): BelongsTo
    {
        return $this->belongsTo(TenseGroup::class, 'tense_group_id');
    }

    public function exam(): BelongsTo
    {
        return $this->belongsTo(Exam::class);
    }
}
