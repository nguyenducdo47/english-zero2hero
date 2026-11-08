<?php

namespace App\Http\Requests\Api\V1\Admin\ContentPost;

use App\Http\Requests\Api\V1\Concerns\AdminAuthorized;
use App\Http\Requests\Api\V1\Concerns\HasTranslationInputRules;
use App\Http\Requests\Api\V1\Concerns\ValidatesContentPostSlug;
use App\Models\ContentPost;
use Illuminate\Foundation\Http\FormRequest;

class UpdateContentPostRequest extends FormRequest
{
    use AdminAuthorized;
    use HasTranslationInputRules;
    use ValidatesContentPostSlug;

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        /** @var ContentPost $post */
        $post = $this->route('contentPost');

        return [
            'slug' => array_merge(
                ['required'],
                array_slice($this->contentPostSlugRules($post->channel, $post->id), 1)
            ),
            'is_published' => ['sometimes', 'boolean'],
            'published_at' => ['sometimes', 'nullable', 'date'],
            'sort_order' => ['sometimes', 'integer', 'min:0', 'max:9999'],
            ...$this->translationInputRules(),
        ];
    }
}
