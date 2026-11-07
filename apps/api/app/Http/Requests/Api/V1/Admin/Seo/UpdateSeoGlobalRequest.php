<?php

namespace App\Http\Requests\Api\V1\Admin\Seo;

use App\Http\Requests\Api\V1\Concerns\AdminAuthorized;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSeoGlobalRequest extends FormRequest
{
    use AdminAuthorized;

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'site_name' => ['sometimes', 'string', 'max:120'],
            'default_title' => ['nullable', 'string', 'max:120'],
            'default_description' => ['nullable', 'string', 'max:320'],
            'default_keywords' => ['nullable', 'string', 'max:255'],
            'og_title' => ['nullable', 'string', 'max:120'],
            'og_description' => ['nullable', 'string', 'max:320'],
            'og_image_url' => ['nullable', 'string', 'max:512'],
            'favicon_url' => ['nullable', 'string', 'max:512'],
            'site_logo_url' => ['nullable', 'string', 'max:512'],
            'twitter_card' => ['sometimes', Rule::in(['summary', 'summary_large_image'])],
            'canonical_base' => ['nullable', 'string', 'max:512'],
            'robots_default_index' => ['sometimes', 'boolean'],
            'robots_default_follow' => ['sometimes', 'boolean'],
            'default_locale' => ['sometimes', 'string', 'max:8'],
            'organization_name' => ['nullable', 'string', 'max:120'],
            'organization_logo_url' => ['nullable', 'string', 'max:512'],
            'organization_url' => ['nullable', 'string', 'max:512'],
            'maintenance_noindex' => ['sometimes', 'boolean'],
        ];
    }
}
