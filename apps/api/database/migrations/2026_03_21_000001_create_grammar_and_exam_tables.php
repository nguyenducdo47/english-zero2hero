<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tense_groups', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name_vi');
            $table->string('name_en');
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('tenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tense_group_id')->constrained('tense_groups')->cascadeOnDelete();
            $table->string('slug')->unique();
            $table->string('name_en');
            $table->string('name_vi');
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->text('structure');
            $table->json('usage_vi');
            $table->json('signals');
            $table->text('pitfalls_vi')->nullable();
            $table->json('examples');
            $table->timestamps();
        });

        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tense_group_id')->nullable()->constrained('tense_groups')->nullOnDelete();
            $table->foreignId('exam_id')->nullable();
            $table->string('type', 32);
            $table->text('prompt_en');
            $table->text('prompt_vi')->nullable();
            $table->json('payload');
            $table->text('explanation_vi')->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('exams', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('title');
            $table->enum('exam_type', ['toeic', 'ielts']);
            $table->enum('skill_mode', ['two', 'four'])->default('two');
            $table->unsignedSmallInteger('target_score_min')->nullable();
            $table->unsignedSmallInteger('target_score_max')->nullable();
            $table->decimal('target_band_min', 3, 1)->nullable();
            $table->decimal('target_band_max', 3, 1)->nullable();
            $table->unsignedInteger('duration_minutes')->default(120);
            $table->json('metadata')->nullable();
            $table->boolean('is_published')->default(false);
            $table->timestamps();
        });

        Schema::table('questions', function (Blueprint $table) {
            $table->foreign('exam_id')->references('id')->on('exams')->nullOnDelete();
        });

        Schema::create('exam_sections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_id')->constrained()->cascadeOnDelete();
            $table->string('skill', 32);
            $table->string('title');
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->unsignedInteger('time_limit_minutes')->nullable();
            $table->timestamps();
        });

        Schema::create('attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('exam_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('tense_group_id')->nullable()->constrained('tense_groups')->nullOnDelete();
            $table->string('attempt_type', 32);
            $table->string('status', 32)->default('in_progress');
            $table->unsignedInteger('score')->nullable();
            $table->unsignedInteger('max_score')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        Schema::create('attempt_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('attempt_id')->constrained()->cascadeOnDelete();
            $table->foreignId('question_id')->constrained()->cascadeOnDelete();
            $table->json('user_answer')->nullable();
            $table->boolean('is_correct')->nullable();
            $table->json('grading_detail')->nullable();
            $table->timestamps();
        });

        Schema::create('mock_exam_registrations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('exam_id')->constrained()->cascadeOnDelete();
            $table->timestamp('scheduled_at');
            $table->string('status', 32)->default('registered');
            $table->foreignId('attempt_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('content_sources', function (Blueprint $table) {
            $table->id();
            $table->string('source_url', 2048);
            $table->string('domain');
            $table->string('license')->nullable();
            $table->enum('review_status', ['draft', 'reviewed', 'published', 'rejected'])->default('draft');
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        Schema::create('ai_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('attempt_id')->constrained()->cascadeOnDelete();
            $table->string('skill', 32)->nullable();
            $table->json('rubric_json');
            $table->string('model_version')->nullable();
            $table->timestamps();
        });

        Schema::create('user_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('progress_key');
            $table->json('payload');
            $table->timestamps();
            $table->unique(['user_id', 'progress_key']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->string('google_id')->nullable()->unique();
            $table->string('avatar')->nullable();
            $table->string('exam_track', 16)->nullable();
            $table->unsignedSmallInteger('target_toeic_score')->nullable();
            $table->decimal('target_ielts_band', 3, 1)->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_progress');
        Schema::dropIfExists('ai_reviews');
        Schema::dropIfExists('content_sources');
        Schema::dropIfExists('mock_exam_registrations');
        Schema::dropIfExists('attempt_answers');
        Schema::dropIfExists('attempts');
        Schema::dropIfExists('exam_sections');
        Schema::table('questions', function (Blueprint $table) {
            $table->dropForeign(['exam_id']);
        });
        Schema::dropIfExists('exams');
        Schema::dropIfExists('questions');
        Schema::dropIfExists('tenses');
        Schema::dropIfExists('tense_groups');
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['google_id', 'avatar', 'exam_track', 'target_toeic_score', 'target_ielts_band']);
        });
    }
};
