<?php

namespace App\Http\Requests\Api\V1\Admin\User;

use App\Http\Requests\Api\V1\Concerns\AdminAuthorized;
use Illuminate\Foundation\Http\FormRequest;

class IndexUsersRequest extends FormRequest
{
    use AdminAuthorized;

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'per_page' => ['sometimes', 'integer', 'min:10', 'max:50'],
        ];
    }

    public function perPage(): int
    {
        return min(50, max(10, (int) $this->query('per_page', 20)));
    }
}
