<?php

namespace App\Http\Requests\Api\V1\Admin\Seo;

use App\Http\Requests\Api\V1\Concerns\AdminAuthorized;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class PreviewSeoRequest extends FormRequest
{
    use AdminAuthorized;

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'route_key' => ['nullable', 'string', 'max:128'],
            'locale' => ['required', 'string', 'max:8'],
            'path' => ['nullable', 'string', 'max:512'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if (! $this->filled('route_key') && ! $this->filled('path')) {
                $validator->errors()->add('path', 'route_key or path required');
            }
        });
    }
}
