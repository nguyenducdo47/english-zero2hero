<?php

namespace App\Http\Requests\Api\V1\Admin\Seo;

use App\Http\Requests\Api\V1\Concerns\AdminAuthorized;
use Illuminate\Foundation\Http\FormRequest;

class UpsertSeoPageRequest extends FormRequest
{
    use AdminAuthorized;

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'route_key' => ['required', 'string', 'max:128'],
            'locale' => ['required', 'string', 'max:8'],
            'title' => ['nullable', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:320'],
            'canonical_path' => ['nullable', 'string', 'max:512'],
            'og_title' => ['nullable', 'string', 'max:120'],
            'og_description' => ['nullable', 'string', 'max:320'],
            'og_image_url' => ['nullable', 'string', 'max:512'],
            'robots_index' => ['nullable', 'boolean'],
            'robots_follow' => ['nullable', 'boolean'],
            'structured_data' => ['nullable'],
        ];
    }
}
