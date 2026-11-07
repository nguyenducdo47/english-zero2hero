<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\Locale\IndexLocalesAdminRequest;
use App\Http\Requests\Api\V1\Admin\Locale\StoreLocaleRequest;
use App\Http\Requests\Api\V1\Admin\Locale\UpdateLocaleRequest;
use App\Services\LocaleAdminService;
use Illuminate\Http\JsonResponse;

class LocaleAdminController extends Controller
{
    public function __construct(
        private readonly LocaleAdminService $locales,
    ) {}

    public function index(IndexLocalesAdminRequest $request): JsonResponse
    {
        return response()->json($this->locales->index());
    }

    public function store(StoreLocaleRequest $request): JsonResponse
    {
        return response()->json([
            'data' => $this->locales->store($request->validated(), $request->wantsDefault()),
        ], 201);
    }

    public function update(UpdateLocaleRequest $request, string $code): JsonResponse
    {
        return response()->json([
            'data' => $this->locales->update($code, $request->validated(), $request->wantsDefault()),
        ]);
    }
}
