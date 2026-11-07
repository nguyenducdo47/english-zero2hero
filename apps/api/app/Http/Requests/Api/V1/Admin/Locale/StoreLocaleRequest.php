<?php

namespace App\Http\Requests\Api\V1\Admin\Locale;

use App\Http\Requests\Api\V1\Concerns\AdminAuthorized;
use Illuminate\Foundation\Http\FormRequest;

class StoreLocaleRequest extends FormRequest
{
    use AdminAuthorized;

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'code' => 'required|string|max:16|alpha_dash|unique:locales,code',
            'name' => 'required|string|max:64',
            'native_name' => 'required|string|max:64',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
            'is_default' => 'boolean',
        ];
    }

    public function wantsDefault(): bool
    {
        return $this->boolean('is_default');
    }
}
