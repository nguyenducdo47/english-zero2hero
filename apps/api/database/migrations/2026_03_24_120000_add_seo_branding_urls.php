<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('seo_global', function (Blueprint $table) {
            $table->string('favicon_url', 512)->nullable()->after('og_image_url');
            $table->string('site_logo_url', 512)->nullable()->after('favicon_url');
        });
    }

    public function down(): void
    {
        Schema::table('seo_global', function (Blueprint $table) {
            $table->dropColumn(['favicon_url', 'site_logo_url']);
        });
    }
};
