<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\ContentSourceController;
use App\Http\Controllers\Api\V1\ExamAttemptController;
use App\Http\Controllers\Api\V1\ExamController;
use App\Http\Controllers\Api\V1\GrammarController;
use App\Http\Controllers\Api\V1\MockExamController;
use App\Http\Controllers\Api\V1\QuizAttemptController;
use App\Http\Controllers\Api\V1\UserProgressController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::prefix('grammar')->group(function (): void {
        Route::get('tense-groups', [GrammarController::class, 'groups']);
        Route::get('tenses', [GrammarController::class, 'tenses']);
        Route::get('tenses/{slug}', [GrammarController::class, 'show']);
        Route::get('tense-groups/{slug}/quiz', [GrammarController::class, 'quiz']);
    });

    Route::post('quizzes/tense-groups/{slug}/attempts', [QuizAttemptController::class, 'store']);

    Route::prefix('auth')->group(function (): void {
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
    });
});
