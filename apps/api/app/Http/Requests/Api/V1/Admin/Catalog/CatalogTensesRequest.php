<?php

namespace App\Http\Requests\Api\V1\Admin\Catalog;

use App\Http\Requests\Api\V1\Concerns\AdminAuthorized;
use Illuminate\Foundation\Http\FormRequest;

class CatalogTensesRequest extends FormRequest
{
    use AdminAuthorized;

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'group' => ['sometimes', 'nullable', 'string'],
        ];
    }

    public function groupSlug(): ?string
    {
        if (! $this->filled('group')) {
            return null;
        }

        return $this->string('group')->toString();
    }
}
