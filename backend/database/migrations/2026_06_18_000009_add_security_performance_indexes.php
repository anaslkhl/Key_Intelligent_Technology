<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() !== 'pgsql') {
            return;
        }

        DB::statement('CREATE INDEX IF NOT EXISTS uploads_file_path_index ON uploads (file_path)');
        DB::statement('CREATE INDEX IF NOT EXISTS uploads_created_at_index ON uploads (created_at)');
        DB::statement('CREATE INDEX IF NOT EXISTS tickets_status_priority_index ON tickets (status, priority)');
        DB::statement('CREATE INDEX IF NOT EXISTS tickets_assigned_to_index ON tickets (assigned_to)');
        DB::statement('CREATE INDEX IF NOT EXISTS reviews_is_approved_index ON reviews (is_approved)');
        DB::statement('CREATE INDEX IF NOT EXISTS kb_articles_is_published_views_index ON kb_articles (is_published, views)');
        DB::statement('CREATE INDEX IF NOT EXISTS feature_requests_status_votes_index ON feature_requests (status, upvotes_count)');
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'pgsql') {
            return;
        }

        DB::statement('DROP INDEX IF EXISTS uploads_file_path_index');
        DB::statement('DROP INDEX IF EXISTS uploads_created_at_index');
        DB::statement('DROP INDEX IF EXISTS tickets_status_priority_index');
        DB::statement('DROP INDEX IF EXISTS tickets_assigned_to_index');
        DB::statement('DROP INDEX IF EXISTS reviews_is_approved_index');
        DB::statement('DROP INDEX IF EXISTS kb_articles_is_published_views_index');
        DB::statement('DROP INDEX IF EXISTS feature_requests_status_votes_index');
    }
};
