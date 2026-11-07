<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\Translation\ShowTranslationRequest;
use App\Http\Requests\Api\V1\Admin\Translation\UpsertTranslationRequest;
use App\Services\TranslationAdminService;
use Illuminate\Http\JsonResponse;

class TranslationController extends Controller
{
    public function __construct(
        private readonly TranslationAdminService $translations,
    ) {}

    public function upsert(UpsertTranslationRequest $request): JsonResponse
    {
        return response()->json([
            'data' => $this->translations->upsert($request->validated()),
        ]);
    }

    public function show(ShowTranslationRequest $request): JsonResponse
    {
        return response()->json($this->translations->show($request->validated()));
    }
}
