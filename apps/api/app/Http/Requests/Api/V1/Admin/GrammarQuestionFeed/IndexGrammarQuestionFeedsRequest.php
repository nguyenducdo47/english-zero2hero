<?php

namespace App\Http\Requests\Api\V1\Admin\GrammarQuestionFeed;

use App\Http\Requests\Api\V1\Concerns\AdminAuthorized;
use Illuminate\Foundation\Http\FormRequest;

class IndexGrammarQuestionFeedsRequest extends FormRequest
{
    use AdminAuthorized;

    public function rules(): array
    {
        return [];
    }
}
