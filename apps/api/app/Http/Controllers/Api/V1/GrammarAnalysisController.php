<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Grammar\GrammarAnalyzeRequest;
use App\Services\GrammarAnalysisRateLimiter;
use App\Services\GrammarAnalysisService;
use App\Services\SettingsService;
use Illuminate\Http\JsonResponse;

class GrammarAnalysisController extends Controller
{
    public function __construct(
        private readonly GrammarAnalysisService $analysis,
        private readonly GrammarAnalysisRateLimiter $rateLimiter,
        private readonly SettingsService $settings,
    ) {}

    public function store(GrammarAnalyzeRequest $request): JsonResponse
    {
        if (! $this->settings->isGrammarToolEnabled()) {
            return response()->json([
                'message' => __('api.grammar_tool_disabled'),
            ], 503);
        }

        $user = auth('sanctum')->user();
        $userId = $user?->id;
        $ip = (string) $request->ip();

        $quota = $this->rateLimiter->check($userId, $ip);
        if (! $quota['allowed']) {
            return response()->json([
                'message' => __('api.grammar_analyze_quota'),
                'meta' => [
                    'quota' => $quota,
                ],
            ], 429);
        }

        $locale = app()->getLocale();
        $payload = $this->analysis->analyze(
            $request->text(),
            $request->sourceLang(),
            $request->targetLang(),
            $request->mode(),
            $locale,
        );

        $this->rateLimiter->hit($userId, $ip);
        $quotaAfter = $this->rateLimiter->check($userId, $ip);

        $payload['meta']['quota'] = $quotaAfter;

        return response()->json($payload);
    }
}
