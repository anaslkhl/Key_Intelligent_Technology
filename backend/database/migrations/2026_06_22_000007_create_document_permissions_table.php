<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('document_permissions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('document_id')->constrained('documents')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->boolean('can_view')->default(true);
            $table->boolean('can_download')->default(true);
            $table->foreignUuid('granted_by')->constrained('users')->restrictOnDelete();
            $table->timestamps();

            $table->unique(['document_id', 'user_id']);
            $table->index('user_id');
            $table->index('granted_by');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_permissions');
    }
};
