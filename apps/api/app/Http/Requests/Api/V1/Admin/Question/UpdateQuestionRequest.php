<?php

namespace App\Http\Requests\Api\V1\Admin\Question;

use App\Http\Requests\Api\V1\Admin\Question\Concerns\ValidatesQuestionScope;
use App\Http\Requests\Api\V1\Concerns\AdminAuthorized;
use App\Http\Requests\Api\V1\Concerns\HasTranslationInputRules;
use App\Models\Question;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateQuestionRequest extends FormRequest
{
    use AdminAuthorized;
    use HasTranslationInputRules;
    use ValidatesQuestionScope;

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'tense_group_id' => ['nullable', 'integer', Rule::exists('tense_groups', 'id')],
            'exam_id' => ['nullable', 'integer', Rule::exists('exams', 'id')],
            'type' => ['required', Rule::in(['multiple_choice', 'fill_blank'])],
            'payload' => ['required', 'array'],
            'sort_order' => ['sometimes', 'integer', 'min:0', 'max:99999'],
            ...$this->translationInputRules(),
        ];
    }

    public function validated($key = null, $default = null): array
    {
        $validated = parent::validated($key, $default);
        /** @var Question $question */
        $question = $this->route('question');
        $this->assertQuestionScope($validated, $question);

        return $validated;
    }
}
