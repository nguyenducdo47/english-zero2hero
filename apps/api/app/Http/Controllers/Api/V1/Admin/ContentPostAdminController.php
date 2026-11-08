<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\ContentPost\DestroyContentPostRequest;
use App\Http\Requests\Api\V1\Admin\ContentPost\IndexContentPostsAdminRequest;
use App\Http\Requests\Api\V1\Admin\ContentPost\StoreContentPostRequest;
use App\Http\Requests\Api\V1\Admin\ContentPost\UpdateContentPostRequest;
use App\Models\ContentPost;
use App\Services\ContentPostAdminService;
use Illuminate\Http\JsonResponse;

class ContentPostAdminController extends Controller
{
    public function __construct(
        private readonly ContentPostAdminService $posts,
    ) {}

    public function index(IndexContentPostsAdminRequest $request): JsonResponse
    {
        return response()->json($this->posts->index($request->channel()));
    }

    public function store(StoreContentPostRequest $request): JsonResponse
    {
        return response()->json($this->posts->store($request->validated()), 201);
    }

    public function update(UpdateContentPostRequest $request, ContentPost $contentPost): JsonResponse
    {
        return response()->json($this->posts->update($contentPost, $request->validated()));
    }

    public function destroy(DestroyContentPostRequest $request, ContentPost $contentPost): JsonResponse
    {
        return response()->json($this->posts->destroy($contentPost));
    }
}
