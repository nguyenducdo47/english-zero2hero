<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Locale\ListLocalesRequest;
use App\Services\LocaleCatalogService;
use Illuminate\Http\JsonResponse;

class LocaleController extends Controller
{
    public function __construct(
        private readonly LocaleCatalogService $catalog,
    ) {}

    public function index(ListLocalesRequest $request): JsonResponse
    {
        return response()->json($this->catalog->index());
    }
}
