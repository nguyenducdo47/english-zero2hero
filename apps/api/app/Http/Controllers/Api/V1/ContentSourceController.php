<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Jobs\ImportContentFromUrlJob;
use App\Models\ContentSource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @OA\Tag(name="Content", description="Hybrid crawl pipeline")
 */
class ContentSourceController extends Controller
{
    /**
     * @OA\Post(path="/api/v1/content-sources", tags={"Content"}, security={{"sanctum":{}}})
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'source_url' => 'required|url|max:2048',
            'license' => 'nullable|string|max:255',
        ]);

        $domain = parse_url($validated['source_url'], PHP_URL_HOST) ?: '';

        $source = ContentSource::query()->create([
            'source_url' => $validated['source_url'],
            'domain' => $domain,
            'license' => $validated['license'] ?? null,
            'review_status' => 'draft',
            'metadata' => ['submitted_by' => $request->user()->id],
        ]);

        ImportContentFromUrlJob::dispatch($source->id);

        return response()->json(['data' => $source], 201);
    }

    /**
     * @OA\Get(path="/api/v1/content-sources", tags={"Content"}, security={{"sanctum":{}}})
     */
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => ContentSource::query()->orderByDesc('id')->paginate(20),
        ]);
    }
}
