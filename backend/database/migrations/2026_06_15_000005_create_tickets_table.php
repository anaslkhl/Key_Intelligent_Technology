<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tickets', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('robot_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('category_id')->constrained('ticket_categories')->restrictOnDelete();
            $table->string('title');
            $table->text('description');
            $table->string('priority')->default('medium')->index();
            $table->string('status')->default('new')->index();
            $table->foreignUuid('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->unsignedTinyInteger('csat_rating')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index(['robot_id', 'status']);
            $table->index(['category_id', 'status']);
            $table->index(['assigned_to', 'status']);
            $table->index(['priority', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};
