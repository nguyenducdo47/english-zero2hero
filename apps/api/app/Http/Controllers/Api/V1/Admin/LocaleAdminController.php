<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Locale;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LocaleAdminController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => 'required|string|max:16|alpha_dash|unique:locales,code',
            'name' => 'required|string|max:64',
            'native_name' => 'required|string|max:64',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ]);

        if ($request->boolean('is_default')) {
            Locale::query()->update(['is_default' => false]);
            $validated['is_default'] = true;
        }

        $locale = Locale::query()->create($validated);

        return response()->json(['data' => $locale], 201);
    }

    public function update(Request $request, string $code): JsonResponse
    {
        $locale = Locale::query()->findOrFail($code);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:64',
            'native_name' => 'sometimes|string|max:64',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
            'is_default' => 'boolean',
        ]);

        if ($request->boolean('is_default')) {
            Locale::query()->where('code', '!=', $code)->update(['is_default' => false]);
        }

        $locale->update($validated);

        return response()->json(['data' => $locale]);
    }
}
