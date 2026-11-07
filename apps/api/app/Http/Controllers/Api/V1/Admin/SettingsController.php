<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\Settings\GoogleHealthRequest;
use App\Http\Requests\Api\V1\Admin\Settings\MailHealthRequest;
use App\Http\Requests\Api\V1\Admin\Settings\SendTestMailRequest;
use App\Http\Requests\Api\V1\Admin\Settings\ShowSiteSettingsGroupRequest;
use App\Http\Requests\Api\V1\Admin\Settings\UpdateSiteSettingsGroupRequest;
use App\Services\IntegrationHealthService;
use App\Services\SettingsService;
use Illuminate\Http\JsonResponse;

class SettingsController extends Controller
{
    public function __construct(
        private readonly SettingsService $settings,
        private readonly IntegrationHealthService $health,
    ) {}

    public function show(ShowSiteSettingsGroupRequest $request, string $group): JsonResponse
    {
        return response()->json([
            'data' => [
                'group' => $group,
                'fields' => $this->settings->getGroupForAdmin($group),
            ],
        ]);
    }

    public function update(UpdateSiteSettingsGroupRequest $request, string $group): JsonResponse
    {
        $this->settings->updateGroup($group, $request->all());

        return response()->json([
            'data' => [
                'group' => $group,
                'fields' => $this->settings->getGroupForAdmin($group),
            ],
        ]);
    }

    public function mailHealth(MailHealthRequest $request): JsonResponse
    {
        return response()->json(['data' => $this->health->mailHealth()]);
    }

    public function googleHealth(GoogleHealthRequest $request): JsonResponse
    {
        return response()->json(['data' => $this->health->googleHealth()]);
    }

    public function sendMailTest(SendTestMailRequest $request): JsonResponse
    {
        $result = $this->health->sendMailTest($request->validated('to'));

        if (! $result['ok']) {
            return response()->json(['message' => $result['message']], 422);
        }

        return response()->json(['data' => $result]);
    }
}
