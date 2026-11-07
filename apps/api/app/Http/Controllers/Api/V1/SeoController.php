<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Seo\ResolveSeoRequest;
use App\Http\Requests\Api\V1\Seo\SeoCatalogRequest;
use App\Services\SeoResolveService;
use App\Services\SeoService;
use Illuminate\Http\JsonResponse;

class SeoController extends Controller
{
    public function __construct(
        private readonly SeoService $seo,
        private readonly SeoResolveService $resolver,
    ) {}

    public function resolve(ResolveSeoRequest $request): JsonResponse
    {
        return response()->json($this->resolver->resolve($request->validated()));
    }

    public function sitemap(SeoCatalogRequest $request): JsonResponse
    {
        return response()->json(['data' => $this->seo->sitemapEntries()]);
    }

    public function robots(SeoCatalogRequest $request): JsonResponse
    {
        return response()->json(['data' => $this->seo->robotsRules()]);
    }
}
