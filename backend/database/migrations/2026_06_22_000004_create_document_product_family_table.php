<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('document_product_family', function (Blueprint $table) {
            $table->foreignUuid('document_id')->constrained('documents')->cascadeOnDelete();
            $table->foreignUuid('product_family_id')->constrained('product_families')->cascadeOnDelete();

            $table->unique(['document_id', 'product_family_id']);
            $table->index('product_family_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_product_family');
    }
};
