<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('documents', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->foreignUuid('category_id')->constrained('document_categories')->restrictOnDelete();
            $table->foreignUuid('upload_id')->constrained('uploads')->restrictOnDelete();
            $table->enum('document_type', ['pdf', 'image', 'video', 'presentation', 'other']);
            $table->enum('visibility', ['client', 'internal', 'restricted'])->default('client');
            $table->boolean('is_published')->default(false);
            $table->timestampTz('published_at')->nullable();
            $table->foreignUuid('uploaded_by')->constrained('users')->restrictOnDelete();
            $table->string('version')->default('1.0');
            $table->string('language')->default('en');
            $table->unsignedBigInteger('download_count')->default(0);
            $table->unsignedBigInteger('view_count')->default(0);
            $table->string('thumbnail')->nullable();
            $table->softDeletesTz();
            $table->timestamps();

            $table->index('category_id');
            $table->index('upload_id');
            $table->index('uploaded_by');
            $table->index('is_published');
            $table->index('visibility');
            $table->index('document_type');
            $table->index('language');
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement(<<<'SQL'
                ALTER TABLE documents
                ADD COLUMN search_vector tsvector
                GENERATED ALWAYS AS (
                    to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(description, ''))
                ) STORED
            SQL);
            DB::statement('CREATE INDEX documents_search_vector_gin_index ON documents USING GIN (search_vector)');
        } else {
            Schema::table('documents', function (Blueprint $table) {
                $table->text('search_vector')->nullable();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
