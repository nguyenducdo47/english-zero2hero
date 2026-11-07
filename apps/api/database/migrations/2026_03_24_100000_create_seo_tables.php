<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('seo_global', function (Blueprint $table) {
            $table->id();
            $table->string('site_name', 120)->default('English Zero2Hero');
            $table->string('default_title', 120)->nullable();
            $table->string('default_description', 320)->nullable();
            $table->string('default_keywords', 255)->nullable();
            $table->string('og_title', 120)->nullable();
            $table->string('og_description', 320)->nullable();
            $table->string('og_image_url', 512)->nullable();
            $table->string('twitter_card', 32)->default('summary_large_image');
            $table->string('canonical_base', 512)->nullable();
            $table->boolean('robots_default_index')->default(true);
            $table->boolean('robots_default_follow')->default(true);
            $table->string('default_locale', 8)->default('vi');
            $table->string('organization_name', 120)->nullable();
            $table->string('organization_logo_url', 512)->nullable();
            $table->string('organization_url', 512)->nullable();
            $table->boolean('maintenance_noindex')->default(false);
            $table->timestamps();
        });

        Schema::create('seo_pages', function (Blueprint $table) {
            $table->id();
            $table->string('route_key', 128);
            $table->string('locale', 8);
            $table->string('title', 120)->nullable();
            $table->string('description', 320)->nullable();
            $table->string('canonical_path', 512)->nullable();
            $table->string('og_title', 120)->nullable();
            $table->string('og_description', 320)->nullable();
            $table->string('og_image_url', 512)->nullable();
            $table->boolean('robots_index')->nullable();
            $table->boolean('robots_follow')->nullable();
            $table->json('structured_data')->nullable();
            $table->timestamps();

            $table->unique(['route_key', 'locale']);
            $table->index('route_key');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('seo_pages');
        Schema::dropIfExists('seo_global');
    }
};
