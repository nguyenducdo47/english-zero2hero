<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Locale;
use App\Models\Question;
use App\Models\Tense;
use App\Models\TenseGroup;
use App\Models\Translation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TranslationController extends Controller
{
    private const TYPES = [
        'tense_group' => TenseGroup::class,
        'tense' => Tense::class,
        'question' => Question::class,
    ];

    public function upsert(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => ['required', Rule::in(array_keys(self::TYPES))],
            'slug' => 'required|string',
            'locale' => ['required', Rule::in(Locale::activeCodes())],
            'attributes' => 'required|array',
        ]);

        $class = self::TYPES[$validated['type']];
        $model = $class::query()->where('slug', $validated['slug'])->firstOrFail();

        $translation = $model->syncTranslation($validated['locale'], $validated['attributes']);

        return response()->json(['data' => $translation]);
    }

    public function show(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => ['required', Rule::in(array_keys(self::TYPES))],
            'slug' => 'required|string',
        ]);

        $class = self::TYPES[$validated['type']];
        $model = $class::query()->where('slug', $validated['slug'])->with('localeEntries')->firstOrFail();

        return response()->json([
            'data' => [
                'slug' => $model->slug,
                'translations' => $model->localeEntries->mapWithKeys(
                    fn (Translation $t) => [$t->locale => $t->attributes]
                ),
            ],
        ]);
    }
}
