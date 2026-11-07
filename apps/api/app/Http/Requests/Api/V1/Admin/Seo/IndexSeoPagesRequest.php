<?php

namespace App\Http\Requests\Api\V1\Admin\Seo;

use App\Http\Requests\Api\V1\Concerns\AdminAuthorized;
use Illuminate\Foundation\Http\FormRequest;

class IndexSeoPagesRequest extends FormRequest
{
    use AdminAuthorized;

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'route_key' => ['sometimes', 'nullable', 'string', 'max:128'],
            'locale' => ['sometimes', 'nullable', 'string', 'max:8'],
        ];
    }

    public function routeKeyFilter(): ?string
    {
        $value = $this->query('route_key');

        return is_string($value) && $value !== '' ? $value : null;
    }

    public function localeFilter(): ?string
    {
        $value = $this->query('locale');

        return is_string($value) && $value !== '' ? $value : null;
    }
}
