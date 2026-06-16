<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('forum_questions', function (Blueprint $table) {
            $table->integer('downvotes')->default(0)->after('upvotes');
        });

        Schema::table('forum_answers', function (Blueprint $table) {
            $table->integer('downvotes')->default(0)->after('upvotes');
        });
    }

    public function down(): void
    {
        Schema::table('forum_answers', function (Blueprint $table) {
            $table->dropColumn('downvotes');
        });

        Schema::table('forum_questions', function (Blueprint $table) {
            $table->dropColumn('downvotes');
        });
    }
};
