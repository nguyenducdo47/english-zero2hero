<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\GrammarQuestionFeed\CrawlGrammarQuestionFeedRequest;
use App\Http\Requests\Api\V1\Admin\GrammarQuestionFeed\DestroyGrammarQuestionFeedRequest;
use App\Http\Requests\Api\V1\Admin\GrammarQuestionFeed\IndexGrammarQuestionFeedsRequest;
use App\Http\Requests\Api\V1\Admin\GrammarQuestionFeed\StoreGrammarQuestionFeedRequest;
use App\Http\Requests\Api\V1\Admin\GrammarQuestionFeed\UpdateGrammarQuestionFeedRequest;
use App\Models\GrammarQuestionFeed;
use App\Services\GrammarQuestionFeedAdminService;
use App\Services\GrammarQuestionImportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class GrammarQuestionFeedAdminController extends Controller
{
    public function __construct(
        private readonly GrammarQuestionFeedAdminService $feeds,
        private readonly GrammarQuestionImportService $import,
    ) {}

    public function index(IndexGrammarQuestionFeedsRequest $request): JsonResponse
    {
        return response()->json($this->feeds->index());
    }

    public function store(StoreGrammarQuestionFeedRequest $request): JsonResponse
    {
        return response()->json($this->feeds->store($request->validated()), 201);
    }

    public function update(UpdateGrammarQuestionFeedRequest $request, GrammarQuestionFeed $grammarQuestionFeed): JsonResponse
    {
        return response()->json($this->feeds->update($grammarQuestionFeed, $request->validated()));
    }

    public function destroy(DestroyGrammarQuestionFeedRequest $request, GrammarQuestionFeed $grammarQuestionFeed): JsonResponse
    {
        return response()->json($this->feeds->destroy($grammarQuestionFeed));
    }

    public function crawl(CrawlGrammarQuestionFeedRequest $request, GrammarQuestionFeed $grammarQuestionFeed): JsonResponse
    {
        $result = $this->import->importFromFeed($grammarQuestionFeed);

        return response()->json([
            'data' => [
                'feed_id' => $grammarQuestionFeed->id,
                'summary' => $result,
            ],
        ]);
    }
}
