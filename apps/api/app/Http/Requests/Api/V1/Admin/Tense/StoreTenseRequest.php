<?php

namespace App\Http\Requests\Api\V1\Admin\Tense;

use App\Http\Requests\Api\V1\Concerns\AdminAuthorized;
use App\Http\Requests\Api\V1\Concerns\HasTranslationInputRules;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTenseRequest extends FormRequest
{
    use AdminAuthorized;
    use HasTranslationInputRules;

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'tense_group_id' => ['required', 'integer', Rule::exists('tense_groups', 'id')],
            'slug' => [
                'required',
                'string',
                'max:64',
                'regex:/^[a-z0-9-]+$/',
                Rule::unique('tenses', 'slug'),
            ],
            'sort_order' => ['sometimes', 'integer', 'min:0', 'max:9999'],
            'structure' => ['required', 'string'],
            'signals' => ['sometimes', 'array'],
            'examples' => ['sometimes', 'array'],
            ...$this->translationInputRules(),
        ];
    }
}
