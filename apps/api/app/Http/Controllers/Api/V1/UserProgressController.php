<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\UserProgress;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @OA\Tag(name="Progress", description="User learning progress")
 */
class UserProgressController extends Controller
{
    /**
     * @OA\Put(path="/api/v1/user/progress/{key}", tags={"Progress"}, security={{"sanctum":{}}})
     */
    public function upsert(Request $request, string $key): JsonResponse
    {
        $validated = $request->validate([
            'payload' => 'required|array',
        ]);

        $progress = UserProgress::query()->updateOrCreate(
            ['user_id' => $request->user()->id, 'progress_key' => $key],
            ['payload' => $validated['payload']]
        );

        return response()->json(['data' => $progress]);
    }

    /**
     * @OA\Get(path="/api/v1/user/progress/{key}", tags={"Progress"}, security={{"sanctum":{}}})
     */
    public function show(Request $request, string $key): JsonResponse
    {
        $progress = UserProgress::query()
            ->where('user_id', $request->user()->id)
            ->where('progress_key', $key)
            ->first();

        return response()->json(['data' => $progress]);
    }
}
