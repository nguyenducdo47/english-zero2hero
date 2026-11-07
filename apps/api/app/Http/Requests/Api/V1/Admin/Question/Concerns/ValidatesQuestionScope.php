<?php

namespace App\Http\Requests\Api\V1\Admin\Question\Concerns;

use App\Models\Question;
use Illuminate\Validation\ValidationException;

trait ValidatesQuestionScope
{
    /**
     * @param  array<string, mixed>  $validated
     */
    protected function assertQuestionScope(array $validated, ?Question $question): void
    {
        $groupId = $validated['tense_group_id'] ?? $question?->tense_group_id;
        $examId = $validated['exam_id'] ?? $question?->exam_id;

        if (! $groupId && ! $examId) {
            throw ValidationException::withMessages([
                'tense_group_id' => ['Link the question to a tense group and/or an exam.'],
            ]);
        }
    }
}
