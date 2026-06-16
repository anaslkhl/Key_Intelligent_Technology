<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('forum_answer_votes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('answer_id')->constrained('forum_answers')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();
            $table->string('vote');
            $table->timestamps();

            $table->unique(['answer_id', 'user_id']);
            $table->index(['user_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('forum_answer_votes');
    }
};
