<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('feature_requests')->where('status', 'submitted')->update(['status' => 'pending']);

        if (DB::getDriverName() === 'pgsql') {
            DB::statement("ALTER TABLE feature_requests ALTER COLUMN status SET DEFAULT 'pending'");
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'pgsql') {
            DB::statement("ALTER TABLE feature_requests ALTER COLUMN status SET DEFAULT 'submitted'");
        }
    }
};
