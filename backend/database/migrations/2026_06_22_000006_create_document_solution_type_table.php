<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('document_solution_type', function (Blueprint $table) {
            $table->foreignUuid('document_id')->constrained('documents')->cascadeOnDelete();
            $table->foreignUuid('solution_type_id')->constrained('solution_types')->cascadeOnDelete();

            $table->unique(['document_id', 'solution_type_id']);
            $table->index('solution_type_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_solution_type');
    }
};
