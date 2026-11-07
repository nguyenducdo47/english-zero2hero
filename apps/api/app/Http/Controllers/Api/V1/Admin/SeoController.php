<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\Seo\AdminSeoCatalogRequest;
use App\Http\Requests\Api\V1\Admin\Seo\IndexSeoPagesRequest;
use App\Http\Requests\Api\V1\Admin\Seo\PreviewSeoRequest;
use App\Http\Requests\Api\V1\Admin\Seo\UpdateSeoGlobalRequest;
use App\Http\Requests\Api\V1\Admin\Seo\UploadSeoAssetRequest;
use App\Http\Requests\Api\V1\Admin\Seo\UpsertSeoPageRequest;
use App\Services\SeoResolveService;
use App\Services\SeoService;
use Illuminate\Http\JsonResponse;

class SeoController extends Controller
{
    public function __construct(
        private readonly SeoService $seo,
        private readonly SeoResolveService $resolver,
    ) {}

    public function globalShow(AdminSeoCatalogRequest $request): JsonResponse
    {
        return response()->json(['data' => $this->seo->globalSettings()]);
    }

    public function globalUpdate(UpdateSeoGlobalRequest $request): JsonResponse
    {
        return response()->json(['data' => $this->seo->updateGlobal($request->validated())]);
    }

    public function pagesIndex(IndexSeoPagesRequest $request): JsonResponse
    {
        return response()->json([
            'data' => $this->seo->listPages($request->routeKeyFilter(), $request->localeFilter()),
        ]);
    }

    public function pagesShow(AdminSeoCatalogRequest $request, string $routeKey): JsonResponse
    {
        return response()->json([
            'data' => $this->seo->listPages($routeKey),
        ]);
    }

    public function pagesUpsert(UpsertSeoPageRequest $request): JsonResponse
    {
        return response()->json(['data' => $this->seo->upsertPage($request->validated())]);
    }

    public function pagesDestroy(AdminSeoCatalogRequest $request, string $routeKey, string $locale): JsonResponse
    {
        $this->seo->deletePage($routeKey, $locale);

        return response()->json(['data' => ['deleted' => true]]);
    }

    public function clearCache(AdminSeoCatalogRequest $request): JsonResponse
    {
        $this->seo->forgetCache();

        return response()->json(['data' => ['cleared' => true]]);
    }

    public function registry(AdminSeoCatalogRequest $request): JsonResponse
    {
        return response()->json(['data' => $this->seo->registry()]);
    }

    public function validate(AdminSeoCatalogRequest $request): JsonResponse
    {
        return response()->json(['data' => $this->seo->validate()]);
    }

    public function preview(PreviewSeoRequest $request): JsonResponse
    {
        return response()->json($this->resolver->resolve($request->validated()));
    }

    public function uploadAsset(UploadSeoAssetRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $result = $this->seo->storeBrandingAsset($validated['type'], $request->file('file'));

        return response()->json([
            'data' => [
                'url' => $result['url'],
                'field' => $result['field'],
                'global' => $result['data'],
            ],
        ]);
    }
}
