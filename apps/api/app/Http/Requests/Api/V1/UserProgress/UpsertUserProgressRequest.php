<?php

namespace App\Http\Requests\Api\V1\UserProgress;

use App\Http\Requests\Api\V1\Concerns\AuthenticatableRequest;
use Illuminate\Foundation\Http\FormRequest;

class UpsertUserProgressRequest extends FormRequest
{
    use AuthenticatableRequest;

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'payload' => 'required|array',
        ];
    }
}
