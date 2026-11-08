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
        $max = (int) config('grammar.group_quiz.max_limit', 30);
        $min = (int) config('grammar.group_quiz.min_limit', 1);

        return [
            'limit' => ['sometimes', 'integer', 'min:'.$min, 'max:'.$max],
        ];
    }

    public function limit(): int
    {
        $default = (int) config('grammar.group_quiz.default_limit', 15);

        return (int) $this->query('limit', $default);
    }
}
