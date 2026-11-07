<?php

namespace App\Http\Requests\Api\V1\Admin\Translation\Concerns;

use Illuminate\Validation\Rule;

trait ValidatesTranslationTarget
{
    /**
     * @return array<string, mixed>
     */
    protected function translationTargetRules(bool $withAttributes): array
    {
        $types = ['tense_group', 'tense', 'question'];
        $type = $this->string('type')->toString();

        $rules = [
            'type' => ['required', Rule::in($types)],
        ];

        if ($type === 'question') {
            $rules['id'] = ['required', 'integer', 'min:1'];
        } elseif ($type !== '') {
            $rules['slug'] = ['required', 'string'];
        } else {
            $rules['id'] = ['required_if:type,question', 'integer', 'min:1'];
            $rules['slug'] = ['required_unless:type,question', 'string'];
        }

        if ($withAttributes) {
            $rules['locale'] = ['required', Rule::in(\App\Models\Locale::activeCodes())];
            $rules['attributes'] = ['required', 'array'];
        }

        return $rules;
    }

    protected function normalizeQuestionId(): void
    {
        if (! $this->has('id')) {
            return;
        }

        $raw = $this->input('id');
        if ($raw === null || $raw === '') {
            return;
        }

        $id = filter_var($raw, FILTER_VALIDATE_INT);
        if ($id !== false) {
            $this->merge(['id' => $id]);
        }
    }
}
