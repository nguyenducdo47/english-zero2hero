<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('seo_sitemap_urls', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('loc', 2048);
            $table->string('locale', 8)->nullable();
            $table->decimal('priority', 2, 1)->nullable();
            $table->string('changefreq', 16)->nullable();
            $table->boolean('is_enabled')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['is_enabled', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('seo_sitemap_urls');
    }
};
