<?php

namespace App\Http\Requests\Api\V1\Admin\Tense;

use App\Http\Requests\Api\V1\Concerns\AdminAuthorized;
use Illuminate\Foundation\Http\FormRequest;

class IndexTensesAdminRequest extends FormRequest
{
    use AdminAuthorized;

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'tense_group_id' => ['sometimes', 'integer', 'min:1'],
        ];
    }

    public function tenseGroupId(): ?int
    {
        if (! $this->filled('tense_group_id')) {
            return null;
        }

        return (int) $this->query('tense_group_id');
    }
}
