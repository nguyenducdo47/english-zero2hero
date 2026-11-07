<?php

namespace App\Http\Requests\Api\V1\Seo;

use Illuminate\Foundation\Http\FormRequest;

class SeoCatalogRequest extends FormRequest
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
        return [];
    }
}
