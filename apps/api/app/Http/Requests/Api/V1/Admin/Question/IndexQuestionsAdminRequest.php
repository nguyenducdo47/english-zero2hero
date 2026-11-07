<?php

namespace App\Http\Requests\Api\V1\Admin\Question;

use App\Http\Requests\Api\V1\Concerns\AdminAuthorized;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexQuestionsAdminRequest extends FormRequest
{
    use AdminAuthorized;

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'per_page' => ['sometimes', 'integer', 'min:10', 'max:100'],
            'tense_group_id' => ['sometimes', 'integer', 'min:1'],
            'exam_id' => ['sometimes', 'integer', 'min:1'],
            'scope' => ['sometimes', Rule::in(['grammar', 'exam'])],
        ];
    }

    public function perPage(): int
    {
        return min(100, max(10, (int) $this->query('per_page', 30)));
    }

    public function tenseGroupId(): ?int
    {
        return $this->filled('tense_group_id') ? (int) $this->query('tense_group_id') : null;
    }

    public function examId(): ?int
    {
        return $this->filled('exam_id') ? (int) $this->query('exam_id') : null;
    }

    public function scope(): ?string
    {
        return $this->filled('scope') ? $this->string('scope')->toString() : null;
    }
}
