<?php

namespace App\Http\Requests\Api\V1\Concerns;

trait AuthenticatableRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }
}
