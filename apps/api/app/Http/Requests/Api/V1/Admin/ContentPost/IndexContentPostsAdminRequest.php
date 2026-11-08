<?php

namespace App\Http\Requests\Api\V1\Admin\ContentPost;

use App\Http\Requests\Api\V1\Concerns\AdminAuthorized;
use App\Models\ContentPost;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexContentPostsAdminRequest extends FormRequest
{
    use AdminAuthorized;

    public function channel(): ?string
    {
        $ch = $this->query('channel');
        if ($ch === null || $ch === '') {
            return null;
        }

        return (string) $ch;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'channel' => ['sometimes', 'nullable', 'string', Rule::in(ContentPost::CHANNELS)],
        ];
    }
}
