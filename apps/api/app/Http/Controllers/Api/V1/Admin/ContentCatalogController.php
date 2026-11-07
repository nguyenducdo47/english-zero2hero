<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\Catalog\CatalogQuestionsRequest;
use App\Http\Requests\Api\V1\Admin\Catalog\CatalogTenseGroupsRequest;
use App\Http\Requests\Api\V1\Admin\Catalog\CatalogTensesRequest;
use App\Services\ContentCatalogService;
use Illuminate\Http\JsonResponse;

class ContentCatalogController extends Controller
{
    public function __construct(
        private readonly ContentCatalogService $catalog,
    ) {}

    public function tenseGroups(CatalogTenseGroupsRequest $request): JsonResponse
    {
        return response()->json($this->catalog->tenseGroups());
    }

    public function tenses(CatalogTensesRequest $request): JsonResponse
    {
        return response()->json($this->catalog->tenses($request->groupSlug()));
    }

    public function questions(CatalogQuestionsRequest $request): JsonResponse
    {
        return response()->json($this->catalog->questions(
            $request->tenseGroupSlug(),
            $request->examSlug(),
        ));
    }
}
