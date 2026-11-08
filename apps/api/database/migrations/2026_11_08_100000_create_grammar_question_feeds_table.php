<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('grammar_question_feeds', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('feed_url', 2048);
            $table->string('adapter', 64)->default('json_feed');
            $table->boolean('is_enabled')->default(true);
            $table->string('default_tense_group_slug')->nullable();
            $table->string('license')->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('last_fetched_at')->nullable();
            $table->json('last_result')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('grammar_question_feeds');
    }
};
