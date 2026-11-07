<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Content\IndexContentSourcesRequest;
use App\Http\Requests\Api\V1\Content\StoreContentSourceRequest;
use App\Services\ContentSourceService;
use Illuminate\Http\JsonResponse;

/**
 * @OA\Tag(name="Content", description="Hybrid crawl pipeline")
 */
class ContentSourceController extends Controller
{
    public function __construct(
        private readonly ContentSourceService $sources,
    ) {}

    /**
     * @OA\Post(path="/api/v1/content-sources", tags={"Content"}, security={{"sanctum":{}}})
     */
    public function store(StoreContentSourceRequest $request): JsonResponse
    {
        return response()->json([
            'data' => $this->sources->store($request->validated(), $request->user()->id),
        ], 201);
    }

    /**
     * @OA\Get(path="/api/v1/content-sources", tags={"Content"}, security={{"sanctum":{}}})
     */
    public function index(IndexContentSourcesRequest $request): JsonResponse
    {
        return response()->json($this->sources->index());
    }
}
