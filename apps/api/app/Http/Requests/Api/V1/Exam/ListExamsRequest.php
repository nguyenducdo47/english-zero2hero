<?php

namespace App\Http\Requests\Api\V1\Exam;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ListExamsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'exam_type' => ['sometimes', 'nullable', Rule::in(['toeic', 'ielts'])],
            'skill_mode' => ['sometimes', 'nullable', Rule::in(['two', 'four'])],
        ];
    }

    public function examType(): ?string
    {
        $value = $this->query('exam_type');

        return is_string($value) && $value !== '' ? $value : null;
    }

    public function skillMode(): ?string
    {
        $value = $this->query('skill_mode');

        return is_string($value) && $value !== '' ? $value : null;
    }
}
