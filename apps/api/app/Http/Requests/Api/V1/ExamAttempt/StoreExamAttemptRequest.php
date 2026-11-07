<?php

namespace App\Http\Requests\Api\V1\ExamAttempt;

use App\Http\Requests\Api\V1\Concerns\AuthenticatableRequest;
use Illuminate\Foundation\Http\FormRequest;

class StoreExamAttemptRequest extends FormRequest
{
    use AuthenticatableRequest;

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'answers' => 'nullable|array',
            'answers.*.question_id' => 'required|integer|exists:questions,id',
            'answers.*.answer' => 'required',
            'writing' => 'nullable|array',
            'writing.prompt' => 'required_with:writing.text|string',
            'writing.text' => 'required_with:writing.prompt|string',
            'speaking' => 'nullable|array',
            'speaking.transcript' => 'required_with:speaking|string',
        ];
    }
}
