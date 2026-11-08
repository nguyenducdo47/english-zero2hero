<?php

namespace App\Http\Requests\Api\V1\Admin\Sitemap;

use App\Http\Requests\Api\V1\Concerns\AdminAuthorized;
use App\Models\SeoSitemapUrl;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSeoSitemapUrlRequest extends FormRequest
{
    use AdminAuthorized;

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'nullable', 'string', 'max:120'],
            'loc' => ['sometimes', 'string', 'max:2048'],
            'locale' => ['sometimes', 'nullable', 'string', Rule::in(['vi', 'en'])],
            'priority' => ['sometimes', 'nullable', 'numeric', 'min:0', 'max:1'],
            'changefreq' => ['sometimes', 'nullable', 'string', Rule::in(SeoSitemapUrl::CHANGEFREQ_VALUES)],
            'is_enabled' => ['sometimes', 'boolean'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
        ];
    }
}
