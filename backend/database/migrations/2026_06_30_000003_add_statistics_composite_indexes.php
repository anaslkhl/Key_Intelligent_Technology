<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('page_views', function (Blueprint $table) {
            $table->index(['created_at', 'path'], 'page_views_created_at_path_idx');
            $table->index(['session_id', 'created_at'], 'page_views_session_id_created_at_idx');
        });

        Schema::table('user_activity_logs', function (Blueprint $table) {
            $table->index(['action', 'created_at'], 'user_activity_logs_action_created_at_idx');
        });
    }

    public function down(): void
    {
        Schema::table('user_activity_logs', function (Blueprint $table) {
            $table->dropIndex('user_activity_logs_action_created_at_idx');
        });

        Schema::table('page_views', function (Blueprint $table) {
            $table->dropIndex('page_views_session_id_created_at_idx');
            $table->dropIndex('page_views_created_at_path_idx');
        });
    }
};
