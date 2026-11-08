<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\Sitemap\DestroySeoSitemapUrlRequest;
use App\Http\Requests\Api\V1\Admin\Sitemap\SitemapAdminCatalogRequest;
use App\Http\Requests\Api\V1\Admin\Sitemap\StoreSeoSitemapUrlRequest;
use App\Http\Requests\Api\V1\Admin\Sitemap\UpdateSeoSitemapUrlRequest;
use App\Models\SeoSitemapUrl;
use App\Services\SeoSitemapService;
use Illuminate\Http\JsonResponse;

class SitemapAdminController extends Controller
{
    public function __construct(
        private readonly SeoSitemapService $sitemap,
    ) {}

    public function overview(SitemapAdminCatalogRequest $request): JsonResponse
    {
        return response()->json(['data' => $this->sitemap->overview()]);
    }

    public function customIndex(SitemapAdminCatalogRequest $request): JsonResponse
    {
        return response()->json(['data' => $this->sitemap->listCustom()]);
    }

    public function customStore(StoreSeoSitemapUrlRequest $request): JsonResponse
    {
        return response()->json(['data' => $this->sitemap->storeCustom($request->validated())], 201);
    }

    public function customUpdate(UpdateSeoSitemapUrlRequest $request, SeoSitemapUrl $seoSitemapUrl): JsonResponse
    {
        return response()->json(['data' => $this->sitemap->updateCustom($seoSitemapUrl, $request->validated())]);
    }

    public function customDestroy(DestroySeoSitemapUrlRequest $request, SeoSitemapUrl $seoSitemapUrl): JsonResponse
    {
        $this->sitemap->destroyCustom($seoSitemapUrl);

        return response()->json(['data' => ['deleted' => true]]);
    }
}
