<?php

namespace App\Http\Requests\Api\V1\MockExam;

use App\Http\Requests\Api\V1\Concerns\AuthenticatableRequest;
use Illuminate\Foundation\Http\FormRequest;

class StoreMockRegistrationRequest extends FormRequest
{
    use AuthenticatableRequest;

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'exam_slug' => 'required|string|exists:exams,slug',
            'scheduled_at' => 'required|date|after:now',
        ];
    }
}
