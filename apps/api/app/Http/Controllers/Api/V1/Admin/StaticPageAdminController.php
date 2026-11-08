<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\StaticPage\DestroyStaticPageRequest;
use App\Http\Requests\Api\V1\Admin\StaticPage\IndexStaticPagesAdminRequest;
use App\Http\Requests\Api\V1\Admin\StaticPage\StoreStaticPageRequest;
use App\Http\Requests\Api\V1\Admin\StaticPage\UpdateStaticPageRequest;
use App\Models\StaticPage;
use App\Services\StaticPageAdminService;
use Illuminate\Http\JsonResponse;

class StaticPageAdminController extends Controller
{
    public function __construct(
        private readonly StaticPageAdminService $pages,
    ) {}

    public function index(IndexStaticPagesAdminRequest $request): JsonResponse
    {
        return response()->json($this->pages->index());
    }

    public function store(StoreStaticPageRequest $request): JsonResponse
    {
        return response()->json($this->pages->store($request->validated()), 201);
    }

    public function update(UpdateStaticPageRequest $request, StaticPage $staticPage): JsonResponse
    {
        return response()->json($this->pages->update($staticPage, $request->validated()));
    }

    public function destroy(DestroyStaticPageRequest $request, StaticPage $staticPage): JsonResponse
    {
        return response()->json($this->pages->destroy($staticPage));
    }
}
