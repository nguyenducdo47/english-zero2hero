<?php

namespace App\Http\Requests\Api\V1\Admin\Seo;

use App\Http\Requests\Api\V1\Concerns\AdminAuthorized;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\UploadedFile;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UploadSeoAssetRequest extends FormRequest
{
    use AdminAuthorized;

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'type' => ['required', Rule::in(['favicon', 'site_logo', 'organization_logo', 'og_image'])],
            'file' => ['required', 'file'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $file = $this->file('file');
            if (! $file instanceof UploadedFile) {
                $validator->errors()->add('file', 'The file field is required.');

                return;
            }

            if (! $file->isValid()) {
                $validator->errors()->add('file', $file->getErrorMessage());

                return;
            }

            $type = $this->string('type')->toString();
            $maxKb = $type === 'favicon' ? 512 : 2048;
            if ($file->getSize() > $maxKb * 1024) {
                $validator->errors()->add('file', "The file must not be greater than {$maxKb} kilobytes.");
            }
        });
    }
}
