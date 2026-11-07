<?php

namespace App\Http\Requests\Api\V1\Admin\Tense;

use App\Http\Requests\Api\V1\Concerns\AdminAuthorized;
use Illuminate\Foundation\Http\FormRequest;

class DestroyTenseRequest extends FormRequest
{
    use AdminAuthorized;

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [];
    }
}
