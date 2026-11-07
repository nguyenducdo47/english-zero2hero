<?php

namespace App\Http\Requests\Api\V1\Content;

use App\Http\Requests\Api\V1\Concerns\AuthenticatableRequest;
use Illuminate\Foundation\Http\FormRequest;

class StoreContentSourceRequest extends FormRequest
{
    use AuthenticatableRequest;

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'source_url' => 'required|url|max:2048',
            'license' => 'nullable|string|max:255',
        ];
    }
}
