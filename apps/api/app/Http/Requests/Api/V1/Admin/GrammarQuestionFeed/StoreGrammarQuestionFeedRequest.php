<?php

namespace App\Http\Requests\Api\V1\Admin\GrammarQuestionFeed;

use App\Http\Requests\Api\V1\Concerns\AdminAuthorized;
use App\Services\GrammarQuestion\GrammarQuestionFeedAdapterRegistry;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreGrammarQuestionFeedRequest extends FormRequest
{
    use AdminAuthorized;

    public function rules(): array
    {
        $keys = app(GrammarQuestionFeedAdapterRegistry::class)->keys();

        return [
            'name' => ['required', 'string', 'max:120'],
            'feed_url' => ['required', 'url', 'max:2048'],
            'adapter' => ['sometimes', 'string', Rule::in($keys)],
            'is_enabled' => ['sometimes', 'boolean'],
            'default_tense_group_slug' => ['nullable', 'string', 'max:64'],
            'license' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
        ];
    }
}
