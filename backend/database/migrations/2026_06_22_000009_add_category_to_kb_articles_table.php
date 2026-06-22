<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('kb_articles', function (Blueprint $table) {
            $table->enum('category', [
                'getting_started',
                'troubleshooting',
                'maintenance',
                'product_guides',
                'faqs',
                'video_tutorials',
            ])->default('getting_started')->index();
        });
    }

    public function down(): void
    {
        Schema::table('kb_articles', function (Blueprint $table) {
            $table->dropColumn('category');
        });
    }
};
