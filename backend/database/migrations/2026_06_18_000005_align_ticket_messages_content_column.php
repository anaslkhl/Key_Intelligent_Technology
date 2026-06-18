<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('ticket_messages')) {
            return;
        }

        if (Schema::hasColumn('ticket_messages', 'message') && ! Schema::hasColumn('ticket_messages', 'content')) {
            DB::statement('ALTER TABLE ticket_messages RENAME COLUMN message TO content');
        }

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('CREATE INDEX IF NOT EXISTS ticket_messages_ticket_id_index ON ticket_messages (ticket_id)');
            DB::statement('CREATE INDEX IF NOT EXISTS ticket_messages_user_id_index ON ticket_messages (user_id)');
            DB::statement('CREATE INDEX IF NOT EXISTS ticket_messages_created_at_index ON ticket_messages (created_at)');
        }
    }

    public function down(): void
    {
        if (! Schema::hasTable('ticket_messages')) {
            return;
        }

        if (Schema::hasColumn('ticket_messages', 'content') && ! Schema::hasColumn('ticket_messages', 'message')) {
            DB::statement('ALTER TABLE ticket_messages RENAME COLUMN content TO message');
        }
    }
};
