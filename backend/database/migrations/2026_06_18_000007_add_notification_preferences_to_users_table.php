<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('users', 'notification_preferences')) {
            Schema::table('users', function (Blueprint $table) {
                $table->jsonb('notification_preferences')->nullable()->after('last_login_ip');
            });
        }

        if (DB::getDriverName() === 'pgsql') {
            DB::statement("UPDATE users SET notification_preferences = '{\"email\": true, \"in_app\": true}'::jsonb WHERE notification_preferences IS NULL");
            DB::statement("ALTER TABLE users ALTER COLUMN notification_preferences SET DEFAULT '{\"email\": true, \"in_app\": true}'::jsonb");
        } else {
            DB::table('users')
                ->whereNull('notification_preferences')
                ->update(['notification_preferences' => json_encode(['email' => true, 'in_app' => true])]);
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('users', 'notification_preferences')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('notification_preferences');
            });
        }
    }
};
