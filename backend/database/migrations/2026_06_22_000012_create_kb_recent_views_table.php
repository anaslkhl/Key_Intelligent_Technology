<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kb_recent_views', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('article_id')->constrained('kb_articles')->cascadeOnDelete();
            $table->timestampTz('viewed_at');
            $table->timestamps();

            $table->unique(['user_id', 'article_id']);
            $table->index(['user_id', 'viewed_at']);
            $table->index(['article_id', 'viewed_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kb_recent_views');
    }
};
