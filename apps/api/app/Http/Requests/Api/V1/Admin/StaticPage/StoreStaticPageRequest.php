<?php

namespace App\Http\Requests\Api\V1\Admin\StaticPage;

use App\Http\Requests\Api\V1\Concerns\AdminAuthorized;
use App\Http\Requests\Api\V1\Concerns\HasTranslationInputRules;
use App\Http\Requests\Api\V1\Concerns\ValidatesStaticPageSlug;
use App\Models\StaticPage;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreStaticPageRequest extends FormRequest
{
    use AdminAuthorized;
    use HasTranslationInputRules;
    use ValidatesStaticPageSlug;

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'slug' => $this->staticPageSlugRules(),
            'page_kind' => ['sometimes', 'string', Rule::in(StaticPage::KINDS)],
            'is_published' => ['sometimes', 'boolean'],
            'show_in_header' => ['sometimes', 'boolean'],
            'show_in_footer' => ['sometimes', 'boolean'],
            'sort_order' => ['sometimes', 'integer', 'min:0', 'max:9999'],
            ...$this->translationInputRules(),
        ];
    }
}
