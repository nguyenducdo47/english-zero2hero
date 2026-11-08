<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StaticPage\IndexStaticPagesRequest;
use App\Http\Requests\Api\V1\StaticPage\ShowStaticPageRequest;
use App\Services\StaticPageService;
use Illuminate\Http\JsonResponse;

class StaticPageController extends Controller
{
    public function __construct(
        private readonly StaticPageService $pages,
    ) {}

    public function index(IndexStaticPagesRequest $request): JsonResponse
    {
        return response()->json(
            $this->pages->indexPublished(app()->getLocale())
        );
    }

    public function show(ShowStaticPageRequest $request, string $slug): JsonResponse
    {
        return response()->json(
            $this->pages->showPublished($slug, app()->getLocale())
        );
    }
}
