<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\ClearRuntimeCacheRequest;
use App\Services\RuntimeCacheService;
use Illuminate\Http\JsonResponse;

class CacheController extends Controller
{
    public function __construct(
        private readonly RuntimeCacheService $cache,
    ) {}

    public function clear(ClearRuntimeCacheRequest $request): JsonResponse
    {
        return response()->json([
            'data' => $this->cache->clearAll(),
        ]);
    }
}
