<?php

use App\Http\Controllers\Api\V1\Admin\CacheController;
use App\Http\Controllers\Api\V1\Admin\EditorMediaController;
use App\Http\Controllers\Api\V1\Admin\ContentCatalogController;
use App\Http\Controllers\Api\V1\Admin\LocaleAdminController;
use App\Http\Controllers\Api\V1\Admin\MetricsController;
use App\Http\Controllers\Api\V1\Admin\SettingsController;
use App\Http\Controllers\Api\V1\Admin\TranslationController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\LocaleController;
use App\Http\Controllers\Api\V1\ContentSourceController;
use App\Http\Controllers\Api\V1\ExamAttemptController;
use App\Http\Controllers\Api\V1\ExamController;
use App\Http\Controllers\Api\V1\GrammarController;
use App\Http\Controllers\Api\V1\MockExamController;
use App\Http\Controllers\Api\V1\QuizAttemptController;
use App\Http\Controllers\Api\V1\SeoController;
use App\Http\Controllers\Api\V1\UserProgressController;
use App\Http\Controllers\Api\V1\Admin\ExamAdminController;
use App\Http\Controllers\Api\V1\Admin\QuestionAdminController;
use App\Http\Controllers\Api\V1\Admin\RoleController;
use App\Http\Controllers\Api\V1\Admin\SeoController as AdminSeoController;
use App\Http\Controllers\Api\V1\Admin\TenseAdminController;
use App\Http\Controllers\Api\V1\Admin\TenseGroupAdminController;
use App\Http\Controllers\Api\V1\Admin\UserAdminController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::get('locales', [LocaleController::class, 'index']);
    Route::get('seo/resolve', [SeoController::class, 'resolve']);
    Route::get('seo/sitemap-entries', [SeoController::class, 'sitemap']);
    Route::get('seo/robots-rules', [SeoController::class, 'robots']);

    Route::prefix('grammar')->group(function (): void {
        Route::get('tense-groups', [GrammarController::class, 'groups']);
        Route::get('tenses', [GrammarController::class, 'tenses']);
        Route::get('tenses/{slug}', [GrammarController::class, 'show']);
        Route::get('tense-groups/{slug}/quiz', [GrammarController::class, 'quiz']);
    });

    Route::post('quizzes/tense-groups/{slug}/attempts', [QuizAttemptController::class, 'store']);

    Route::prefix('auth')->group(function (): void {
        Route::post('register', [AuthController::class, 'register']);
        Route::post('login', [AuthController::class, 'login']);
        Route::get('dev-login', [AuthController::class, 'devLogin']);
        Route::get('google/status', [AuthController::class, 'googleStatus']);
        Route::get('google/redirect', [AuthController::class, 'googleRedirect']);
        Route::get('google/callback', [AuthController::class, 'googleCallback']);
        Route::middleware('auth:sanctum')->group(function (): void {
            Route::get('me', [AuthController::class, 'me']);
            Route::post('logout', [AuthController::class, 'logout']);
        });
    });

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::get('exams', [ExamController::class, 'index']);
        Route::get('exams/{slug}', [ExamController::class, 'show']);
        Route::post('exams/{slug}/attempts', [ExamAttemptController::class, 'store']);
        Route::get('attempts/{id}', [ExamAttemptController::class, 'show']);

        Route::get('mock-registrations', [MockExamController::class, 'index']);
        Route::post('mock-registrations', [MockExamController::class, 'store']);

        Route::get('content-sources', [ContentSourceController::class, 'index']);
        Route::post('content-sources', [ContentSourceController::class, 'store']);

        Route::get('user/progress/{key}', [UserProgressController::class, 'show']);
        Route::put('user/progress/{key}', [UserProgressController::class, 'upsert']);

        Route::middleware('admin')->prefix('admin')->group(function (): void {
            Route::get('metrics', [MetricsController::class, 'index']);
            Route::post('cache/clear', [CacheController::class, 'clear']);
            Route::post('media/upload', [EditorMediaController::class, 'upload']);
            Route::get('locales', [LocaleAdminController::class, 'index']);
            Route::post('locales', [LocaleAdminController::class, 'store']);
            Route::patch('locales/{code}', [LocaleAdminController::class, 'update']);
            Route::get('translations', [TranslationController::class, 'show']);
            Route::put('translations', [TranslationController::class, 'upsert']);
            Route::get('catalog/tense-groups', [ContentCatalogController::class, 'tenseGroups']);
            Route::get('catalog/tenses', [ContentCatalogController::class, 'tenses']);
            Route::get('catalog/questions', [ContentCatalogController::class, 'questions']);

            Route::get('tense-groups', [TenseGroupAdminController::class, 'index']);
            Route::post('tense-groups', [TenseGroupAdminController::class, 'store']);
            Route::patch('tense-groups/{tenseGroup}', [TenseGroupAdminController::class, 'update']);
            Route::delete('tense-groups/{tenseGroup}', [TenseGroupAdminController::class, 'destroy']);

            Route::get('tenses', [TenseAdminController::class, 'index']);
            Route::post('tenses', [TenseAdminController::class, 'store']);
            Route::patch('tenses/{tense}', [TenseAdminController::class, 'update']);
            Route::delete('tenses/{tense}', [TenseAdminController::class, 'destroy']);

            Route::get('questions', [QuestionAdminController::class, 'index']);
            Route::post('questions', [QuestionAdminController::class, 'store']);
            Route::patch('questions/{question}', [QuestionAdminController::class, 'update']);
            Route::delete('questions/{question}', [QuestionAdminController::class, 'destroy']);

            Route::get('exams', [ExamAdminController::class, 'index']);
            Route::post('exams', [ExamAdminController::class, 'store']);
            Route::get('exams/{exam}', [ExamAdminController::class, 'show']);
            Route::patch('exams/{exam}', [ExamAdminController::class, 'update']);
            Route::delete('exams/{exam}', [ExamAdminController::class, 'destroy']);
            Route::get('settings/mail/health', [SettingsController::class, 'mailHealth']);
            Route::post('settings/mail/test', [SettingsController::class, 'sendMailTest']);
            Route::get('settings/google/health', [SettingsController::class, 'googleHealth']);
            Route::get('settings/{group}', [SettingsController::class, 'show']);
            Route::patch('settings/{group}', [SettingsController::class, 'update']);

            Route::get('seo/global', [AdminSeoController::class, 'globalShow']);
            Route::patch('seo/global', [AdminSeoController::class, 'globalUpdate']);
            Route::get('seo/pages', [AdminSeoController::class, 'pagesIndex']);
            Route::get('seo/pages/{routeKey}', [AdminSeoController::class, 'pagesShow'])->where('routeKey', '.*');
            Route::put('seo/pages', [AdminSeoController::class, 'pagesUpsert']);
            Route::delete('seo/pages/{routeKey}/{locale}', [AdminSeoController::class, 'pagesDestroy'])->where('routeKey', '.*');
            Route::post('seo/cache/clear', [AdminSeoController::class, 'clearCache']);
            Route::get('seo/registry', [AdminSeoController::class, 'registry']);
            Route::get('seo/validate', [AdminSeoController::class, 'validate']);
            Route::get('seo/preview', [AdminSeoController::class, 'preview']);
            Route::post('seo/assets', [AdminSeoController::class, 'uploadAsset']);

            Route::get('roles', [RoleController::class, 'index']);
            Route::post('roles', [RoleController::class, 'store']);
            Route::patch('roles/{role}', [RoleController::class, 'update']);
            Route::delete('roles/{role}', [RoleController::class, 'destroy']);

            Route::get('users/roles-list', [UserAdminController::class, 'rolesList']);
            Route::get('users', [UserAdminController::class, 'index']);
            Route::patch('users/{user}', [UserAdminController::class, 'update']);
            Route::delete('users/{user}', [UserAdminController::class, 'destroy']);
        });
    });
});
