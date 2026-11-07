<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('locales', function (Blueprint $table) {
            $table->string('code', 16)->primary();
            $table->string('name');
            $table->string('native_name');
            $table->boolean('is_default')->default(false);
            $table->boolean('is_active')->default(true);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('translations', function (Blueprint $table) {
            $table->id();
            $table->string('locale', 16);
            $table->string('translatable_type');
            $table->unsignedBigInteger('translatable_id');
            $table->json('attributes');
            $table->timestamps();

            $table->foreign('locale')->references('code')->on('locales')->cascadeOnDelete();
            $table->unique(['locale', 'translatable_type', 'translatable_id'], 'translations_unique');
            $table->index(['translatable_type', 'translatable_id'], 'translations_target_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('translations');
        Schema::dropIfExists('locales');
    }
};
