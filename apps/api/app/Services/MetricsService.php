<?php

namespace App\Services;

use App\Models\Exam;
use App\Models\Locale;
use App\Models\Question;
use App\Models\SiteSetting;
use App\Models\Tense;
use App\Models\TenseGroup;
use App\Models\User;

class MetricsService
{
    /**
     * @return array{data: array<string, int>}
     */
    public function index(): array
    {
        $integrationsConfigured = SiteSetting::query()
            ->whereIn('key', ['google.client_id', 'mail.host'])
            ->whereNotNull('value')
            ->where('value', '!=', '')
            ->count();

        return [
            'data' => [
                'users_total' => User::query()->count(),
                'users_admins' => User::query()->where('is_admin', true)->count(),
                'locales_active' => Locale::query()->where('is_active', true)->count(),
                'locales_total' => Locale::query()->count(),
                'tense_groups' => TenseGroup::query()->count(),
                'tenses' => Tense::query()->count(),
                'questions' => Question::query()->count(),
                'exams_total' => Exam::query()->count(),
                'exams_published' => Exam::query()->where('is_published', true)->count(),
                'integrations_configured' => $integrationsConfigured,
            ],
        ];
    }
}
