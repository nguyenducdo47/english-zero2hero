<?php

namespace App\Http\Requests\Api\V1\Admin\TenseGroup;

use App\Http\Requests\Api\V1\Concerns\AdminAuthorized;
use App\Http\Requests\Api\V1\Concerns\HasTranslationInputRules;
use App\Models\TenseGroup;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTenseGroupRequest extends FormRequest
{
    use AdminAuthorized;
    use HasTranslationInputRules;

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        /** @var TenseGroup $group */
        $group = $this->route('tenseGroup');

        return [
            'slug' => [
                'required',
                'string',
                'max:64',
                'regex:/^[a-z0-9-]+$/',
                Rule::unique('tense_groups', 'slug')->ignore($group->id),
            ],
            'sort_order' => ['sometimes', 'integer', 'min:0', 'max:9999'],
            ...$this->translationInputRules(),
        ];
    }
}
