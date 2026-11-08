<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('static_pages', function (Blueprint $table) {
            $table->boolean('show_in_header')->default(true)->after('is_published');
        });

        DB::table('static_pages')->update(['show_in_header' => true]);
        DB::table('static_pages')->where('is_published', true)->update(['show_in_footer' => true]);
    }

    public function down(): void
    {
        Schema::table('static_pages', function (Blueprint $table) {
            $table->dropColumn('show_in_header');
        });
    }
};
