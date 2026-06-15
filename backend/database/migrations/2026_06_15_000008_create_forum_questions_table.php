<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('forum_questions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->longText('content');
            $table->jsonb('tags')->nullable();
            $table->integer('upvotes')->default(0);
            $table->boolean('is_solved')->default(false)->index();
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
            $table->index(['is_solved', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('forum_questions');
    }
};
