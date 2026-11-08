<?php

namespace App\Http\Requests\Api\V1\StaticPage;

use Illuminate\Foundation\Http\FormRequest;

class IndexStaticPagesRequest extends FormRequest
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
