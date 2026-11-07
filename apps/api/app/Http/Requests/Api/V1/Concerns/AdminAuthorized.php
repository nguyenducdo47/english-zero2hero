<?php

namespace App\Http\Requests\Api\V1\Concerns;

trait AdminAuthorized
{
    public function authorize(): bool
    {
        return true;
    }
}
