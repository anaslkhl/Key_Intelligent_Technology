<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kb_articles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title');
            $table->string('slug')->unique();
            $table->longText('content');
            $table->foreignUuid('family_id')->nullable()->constrained('product_families')->nullOnDelete();
            $table->foreignUuid('product_id')->nullable()->constrained()->nullOnDelete();
            $table->jsonb('tags')->nullable();
            $table->foreignUuid('author_id')->nullable()->constrained('users')->nullOnDelete();
            $table->unsignedBigInteger('views')->default(0);
            $table->unsignedBigInteger('helpful_count')->default(0);
            $table->boolean('is_published')->default(false)->index();
            $table->timestamps();

            $table->index(['family_id', 'is_published']);
            $table->index(['product_id', 'is_published']);
            $table->index(['author_id', 'is_published']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kb_articles');
    }
};
