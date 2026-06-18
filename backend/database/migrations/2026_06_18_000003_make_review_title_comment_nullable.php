<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE reviews ALTER COLUMN title DROP NOT NULL');
            DB::statement('ALTER TABLE reviews ALTER COLUMN comment DROP NOT NULL');
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE reviews ALTER COLUMN title SET NOT NULL');
            DB::statement('ALTER TABLE reviews ALTER COLUMN comment SET NOT NULL');
        }
    }
};
