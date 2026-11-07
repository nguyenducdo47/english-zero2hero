<?php

namespace App\Http\Requests\Api\V1\Admin\TenseGroup;

use App\Http\Requests\Api\V1\Concerns\AdminAuthorized;
use Illuminate\Foundation\Http\FormRequest;

class DestroyTenseGroupRequest extends FormRequest
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
