<?php

namespace App\Http\Requests\Api\V1\ContentPost;

use Illuminate\Foundation\Http\FormRequest;

class ShowContentPostRequest extends FormRequest
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
