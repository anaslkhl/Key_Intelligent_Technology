<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('page_views', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('path');
            $table->string('method', 10);
            $table->string('ip_address', 45);
            $table->string('user_agent')->nullable();
            $table->string('session_id')->nullable();
            $table->string('referer')->nullable();
            $table->unsignedInteger('response_time');
            $table->unsignedSmallInteger('status_code');
            $table->timestamp('created_at');

            $table->index('created_at');
            $table->index('path');
            $table->index('user_id');
            $table->index('session_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('page_views');
    }
};
