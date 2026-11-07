<?php

namespace App\Http\Requests\Api\V1\Grammar;

use Illuminate\Foundation\Http\FormRequest;

class GrammarQuizQueryRequest extends FormRequest
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
            'limit' => ['sometimes', 'integer', 'min:1', 'max:50'],
        ];
    }

    public function limit(): int
    {
        return (int) $this->query('limit', 10);
    }
}
