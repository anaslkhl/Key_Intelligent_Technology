<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('error_codes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('code');
            $table->string('meaning');
            $table->enum('severity', ['low', 'medium', 'high', 'critical'])->default('medium');
            $table->text('cause');
            $table->text('solution');
            $table->foreignUuid('product_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('article_id')->nullable()->constrained('kb_articles')->nullOnDelete();
            $table->timestamps();

            $table->unique(['product_id', 'code']);
            $table->index(['severity', 'code']);
            $table->index('article_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('error_codes');
    }
};
