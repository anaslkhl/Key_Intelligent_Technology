<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('family_id')->constrained('product_families')->cascadeOnDelete();
            $table->string('model');
            $table->string('name');
            $table->jsonb('specifications')->nullable();
            $table->string('image_url')->nullable();
            $table->timestamps();

            $table->unique(['family_id', 'model']);
            $table->index(['family_id', 'name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
