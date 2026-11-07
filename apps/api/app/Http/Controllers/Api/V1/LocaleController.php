<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Locale;
use Illuminate\Http\JsonResponse;

class LocaleController extends Controller
{
    public function index(): JsonResponse
    {
        $locales = Locale::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get(['code', 'name', 'native_name', 'is_default']);

        return response()->json([
            'data' => $locales,
            'meta' => ['default' => Locale::defaultCode()],
        ]);
    }
}
