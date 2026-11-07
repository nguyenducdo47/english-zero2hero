<?php

namespace App\Http\Requests\Api\V1\Admin\Exam;

use App\Models\Exam;
use Illuminate\Validation\Rule;

class UpdateExamRequest extends StoreExamRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        /** @var Exam $exam */
        $exam = $this->route('exam');

        return [
            'slug' => [
                'required',
                'string',
                'max:64',
                'regex:/^[a-z0-9-]+$/',
                Rule::unique('exams', 'slug')->ignore($exam->id),
            ],
            'title' => ['required', 'string', 'max:255'],
            'exam_type' => ['required', Rule::in(['toeic', 'ielts'])],
            'skill_mode' => ['sometimes', Rule::in(['two', 'four'])],
            'target_score_min' => ['nullable', 'integer', 'min:0', 'max:990'],
            'target_score_max' => ['nullable', 'integer', 'min:0', 'max:990'],
            'target_band_min' => ['nullable', 'numeric', 'min:0', 'max:9'],
            'target_band_max' => ['nullable', 'numeric', 'min:0', 'max:9'],
            'duration_minutes' => ['sometimes', 'integer', 'min:1', 'max:600'],
            'metadata' => ['nullable', 'array'],
            'is_published' => ['sometimes', 'boolean'],
            'sections' => ['sometimes', 'nullable', 'array'],
            'sections.*.skill' => ['required_with:sections', 'string', 'max:32'],
            'sections.*.title' => ['required_with:sections', 'string', 'max:120'],
            'sections.*.sort_order' => ['sometimes', 'integer', 'min:0', 'max:99'],
            'sections.*.time_limit_minutes' => ['nullable', 'integer', 'min:1', 'max:600'],
        ];
    }
}
