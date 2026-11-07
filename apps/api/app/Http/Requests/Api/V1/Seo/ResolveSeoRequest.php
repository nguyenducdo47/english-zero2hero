<?php

namespace App\Http\Requests\Api\V1\Seo;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class ResolveSeoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'path' => ['nullable', 'string', 'max:512'],
            'route_key' => ['nullable', 'string', 'max:128'],
            'locale' => ['required', 'string', 'max:8'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if (! $this->filled('route_key') && ! $this->filled('path')) {
                $validator->errors()->add('path', 'path or route_key required');
            }
        });
    }
}
