<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\Metrics\IndexMetricsRequest;
use App\Services\MetricsService;
use Illuminate\Http\JsonResponse;

class MetricsController extends Controller
{
    public function __construct(
        private readonly MetricsService $metrics,
    ) {}

    public function index(IndexMetricsRequest $request): JsonResponse
    {
        return response()->json($this->metrics->index());
    }
}
