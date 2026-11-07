<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class EditorMediaService
{
    /**
     * @return array{url: string, path: string}
     */
    public function storeImage(UploadedFile $file): array
    {
        $directory = 'content-editor';
        Storage::disk('public')->makeDirectory($directory);

        $ext = strtolower($file->getClientOriginalExtension() ?: $file->guessExtension() ?: 'png');
        if ($ext === 'jpeg') {
            $ext = 'jpg';
        }

        $filename = Str::uuid()->toString().'.'.$ext;
        $relativePath = "{$directory}/{$filename}";

        $pathname = $file->getPathname();
        if ($pathname === '' || ! is_readable($pathname)) {
            throw new \RuntimeException(
                'Upload temp file is missing. Check PHP upload_tmp_dir, post_max_size, and upload_max_filesize.',
            );
        }

        $written = Storage::disk('public')->put($relativePath, $file->getContent());
        if ($written === false) {
            throw new \RuntimeException('Could not save file to public disk.');
        }

        return [
            'url' => Storage::disk('public')->url($relativePath),
            'path' => $relativePath,
        ];
    }
}
