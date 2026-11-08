<?php

namespace App\Http\Requests\Api\V1\Admin\ContentPost;

use App\Http\Requests\Api\V1\Concerns\AdminAuthorized;
use App\Http\Requests\Api\V1\Concerns\HasTranslationInputRules;
use App\Http\Requests\Api\V1\Concerns\ValidatesContentPostSlug;
use App\Models\ContentPost;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreContentPostRequest extends FormRequest
{
    use AdminAuthorized;
    use HasTranslationInputRules;
    use ValidatesContentPostSlug;

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $channel = (string) $this->input('channel', '');

        return [
            'channel' => ['required', 'string', Rule::in(ContentPost::CHANNELS)],
            'slug' => $this->contentPostSlugRules($channel),
            'is_published' => ['sometimes', 'boolean'],
            'published_at' => ['sometimes', 'nullable', 'date'],
            'sort_order' => ['sometimes', 'integer', 'min:0', 'max:9999'],
            ...$this->translationInputRules(),
        ];
    }
}
