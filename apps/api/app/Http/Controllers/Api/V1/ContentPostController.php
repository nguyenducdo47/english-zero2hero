<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\ContentPost\HubPostsRequest;
use App\Http\Requests\Api\V1\ContentPost\ShowContentPostRequest;
use App\Services\ContentPostService;
use Illuminate\Http\JsonResponse;

class ContentPostController extends Controller
{
    public function __construct(
        private readonly ContentPostService $posts,
    ) {}

    public function hubPosts(HubPostsRequest $request, string $hubSlug): JsonResponse
    {
        return response()->json(
            $this->posts->listForHub($hubSlug, app()->getLocale())
        );
    }

    public function showBlog(ShowContentPostRequest $request, string $slug): JsonResponse
    {
        return response()->json(
            $this->posts->showPublished('blog', $slug, app()->getLocale())
        );
    }

    public function showNews(ShowContentPostRequest $request, string $slug): JsonResponse
    {
        return response()->json(
            $this->posts->showPublished('news', $slug, app()->getLocale())
        );
    }
}
