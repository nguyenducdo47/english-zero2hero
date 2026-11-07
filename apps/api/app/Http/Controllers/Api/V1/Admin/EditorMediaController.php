<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\UploadEditorMediaRequest;
use App\Services\EditorMediaService;
use Illuminate\Http\JsonResponse;

class EditorMediaController extends Controller
{
    public function __construct(
        private readonly EditorMediaService $media,
    ) {}

    public function upload(UploadEditorMediaRequest $request): JsonResponse
    {
        $result = $this->media->storeImage($request->file('file'));

        return response()->json(['data' => $result]);
    }
}
