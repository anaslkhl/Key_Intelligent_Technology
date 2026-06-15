<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE sessions DROP COLUMN IF EXISTS user_id');
        DB::statement('ALTER TABLE sessions ADD COLUMN user_id uuid NULL');
        DB::statement('CREATE INDEX IF NOT EXISTS sessions_user_id_index ON sessions (user_id)');

        DB::statement('ALTER TABLE users ALTER COLUMN id DROP DEFAULT');
        DB::statement('ALTER TABLE users ALTER COLUMN id TYPE uuid USING gen_random_uuid()');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE sessions DROP COLUMN IF EXISTS user_id');
        DB::statement('ALTER TABLE sessions ADD COLUMN user_id bigint NULL');
        DB::statement('CREATE INDEX IF NOT EXISTS sessions_user_id_index ON sessions (user_id)');

        DB::statement('ALTER TABLE users ALTER COLUMN id TYPE bigint USING 0');
    }
};
