<?php

namespace App\Http\Requests\Api\V1\Admin\Catalog;

use App\Http\Requests\Api\V1\Concerns\AdminAuthorized;
use Illuminate\Foundation\Http\FormRequest;

class CatalogQuestionsRequest extends FormRequest
{
    use AdminAuthorized;

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'tense_group_slug' => ['sometimes', 'nullable', 'string'],
            'exam_slug' => ['sometimes', 'nullable', 'string'],
        ];
    }

    public function tenseGroupSlug(): ?string
    {
        if (! $this->filled('tense_group_slug')) {
            return null;
        }

        return $this->string('tense_group_slug')->toString();
    }

    public function examSlug(): ?string
    {
        if (! $this->filled('exam_slug')) {
            return null;
        }

        return $this->string('exam_slug')->toString();
    }
}
