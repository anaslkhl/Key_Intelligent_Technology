<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() !== 'pgsql') {
            return;
        }

        if (! Schema::hasColumn('kb_articles', 'not_helpful_count')) {
            DB::statement('ALTER TABLE kb_articles ADD COLUMN not_helpful_count bigint NOT NULL DEFAULT 0');
        }

        if (Schema::hasColumn('feature_votes', 'feature_request_id') && ! Schema::hasColumn('feature_votes', 'feature_id')) {
            DB::statement('ALTER TABLE feature_votes RENAME COLUMN feature_request_id TO feature_id');
        }

        if (Schema::hasColumn('forum_question_votes', 'vote') && ! Schema::hasColumn('forum_question_votes', 'vote_type')) {
            DB::statement('ALTER TABLE forum_question_votes RENAME COLUMN vote TO vote_type');
        }

        if (Schema::hasColumn('forum_answer_votes', 'vote') && ! Schema::hasColumn('forum_answer_votes', 'vote_type')) {
            DB::statement('ALTER TABLE forum_answer_votes RENAME COLUMN vote TO vote_type');
        }

        if (Schema::hasColumn('forum_question_votes', 'votable_id')) {
            DB::statement('UPDATE forum_question_votes SET question_id = votable_id WHERE question_id IS NULL AND votable_id IS NOT NULL');
        }

        if (Schema::hasColumn('forum_answer_votes', 'votable_id')) {
            DB::statement('UPDATE forum_answer_votes SET answer_id = votable_id WHERE answer_id IS NULL AND votable_id IS NOT NULL');
        }

        DB::statement('DELETE FROM forum_question_votes WHERE question_id IS NULL');
        DB::statement('DELETE FROM forum_answer_votes WHERE answer_id IS NULL');

        if (Schema::hasColumn('forum_question_votes', 'question_id')) {
            DB::statement('ALTER TABLE forum_question_votes ALTER COLUMN question_id SET NOT NULL');
        }

        if (Schema::hasColumn('forum_answer_votes', 'answer_id')) {
            DB::statement('ALTER TABLE forum_answer_votes ALTER COLUMN answer_id SET NOT NULL');
        }

        if (Schema::hasColumn('forum_question_votes', 'votable_id')) {
            DB::statement('ALTER TABLE forum_question_votes DROP COLUMN votable_id');
        }

        if (Schema::hasColumn('forum_question_votes', 'votable_type')) {
            DB::statement('ALTER TABLE forum_question_votes DROP COLUMN votable_type');
        }

        if (Schema::hasColumn('forum_answer_votes', 'votable_id')) {
            DB::statement('ALTER TABLE forum_answer_votes DROP COLUMN votable_id');
        }

        if (Schema::hasColumn('forum_answer_votes', 'votable_type')) {
            DB::statement('ALTER TABLE forum_answer_votes DROP COLUMN votable_type');
        }

        DB::statement("ALTER TABLE feature_requests ALTER COLUMN status SET DEFAULT 'pending'");
        DB::statement('ALTER TABLE reviews ALTER COLUMN title DROP NOT NULL');
        DB::statement('ALTER TABLE reviews ALTER COLUMN comment DROP NOT NULL');
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'pgsql') {
            return;
        }

        if (Schema::hasColumn('kb_articles', 'not_helpful_count')) {
            DB::statement('ALTER TABLE kb_articles DROP COLUMN not_helpful_count');
        }

        if (Schema::hasColumn('feature_votes', 'feature_id') && ! Schema::hasColumn('feature_votes', 'feature_request_id')) {
            DB::statement('ALTER TABLE feature_votes RENAME COLUMN feature_id TO feature_request_id');
        }

        if (Schema::hasColumn('forum_question_votes', 'vote_type') && ! Schema::hasColumn('forum_question_votes', 'vote')) {
            DB::statement('ALTER TABLE forum_question_votes RENAME COLUMN vote_type TO vote');
        }

        if (Schema::hasColumn('forum_answer_votes', 'vote_type') && ! Schema::hasColumn('forum_answer_votes', 'vote')) {
            DB::statement('ALTER TABLE forum_answer_votes RENAME COLUMN vote_type TO vote');
        }
    }
};
