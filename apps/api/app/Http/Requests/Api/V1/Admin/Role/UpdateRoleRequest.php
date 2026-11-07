<?php

namespace App\Http\Requests\Api\V1\Admin\Role;

use App\Http\Requests\Api\V1\Concerns\AdminAuthorized;
use App\Models\Role;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRoleRequest extends FormRequest
{
    use AdminAuthorized;

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $permissionKeys = array_keys(config('admin_permissions', []));
        /** @var Role $role */
        $role = $this->route('role');

        return [
            'slug' => [
                'required',
                'string',
                'max:64',
                'regex:/^[a-z0-9-]+$/',
                Rule::unique('roles', 'slug')->ignore($role->id),
            ],
            'name' => ['required', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:512'],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['string', Rule::in($permissionKeys)],
        ];
    }
}
