<?php

namespace App\Http\Requests\Api\V1\Locale;

use Illuminate\Foundation\Http\FormRequest;

class ListLocalesRequest extends FormRequest
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
        return [];
    }
}
