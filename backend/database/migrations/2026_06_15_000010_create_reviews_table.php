<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('robot_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('rating');
            $table->string('title');
            $table->longText('comment');
            $table->text('pros')->nullable();
            $table->text('cons')->nullable();
            $table->boolean('is_approved')->default(false)->index();
            $table->timestamps();

            $table->index(['robot_id', 'is_approved']);
            $table->index(['user_id', 'created_at']);
            $table->index(['rating', 'is_approved']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
