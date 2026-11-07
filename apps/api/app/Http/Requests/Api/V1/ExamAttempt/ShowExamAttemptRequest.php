<?php

namespace App\Http\Requests\Api\V1\ExamAttempt;

use App\Http\Requests\Api\V1\Concerns\AuthenticatableRequest;
use Illuminate\Foundation\Http\FormRequest;

class ShowExamAttemptRequest extends FormRequest
{
    use AuthenticatableRequest;

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [];
    }
}
