<?php

namespace App\Http\Requests\Api\V1\Admin\Translation;

use App\Http\Requests\Api\V1\Admin\Translation\Concerns\ValidatesTranslationTarget;
use App\Http\Requests\Api\V1\Concerns\AdminAuthorized;
use Illuminate\Foundation\Http\FormRequest;

class ShowTranslationRequest extends FormRequest
{
    use AdminAuthorized;
    use ValidatesTranslationTarget;

    protected function prepareForValidation(): void
    {
        $this->normalizeQuestionId();
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return $this->translationTargetRules(withAttributes: false);
    }
}
