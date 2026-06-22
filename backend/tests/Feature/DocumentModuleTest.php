<?php

namespace Tests\Feature;

use App\Models\Document;
use App\Models\DocumentCategory;
use App\Models\Product;
use App\Models\ProductFamily;
use App\Models\Robot;
use App\Models\Upload;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DocumentModuleTest extends TestCase
{
    use DatabaseTransactions;

    public function test_agent_can_create_a_document_with_relationships(): void
    {
        $agent = User::factory()->create(['role' => 'agent']);
        $category = $this->category();
        $upload = $this->upload($agent);
        $family = ProductFamily::query()->create([
            'name' => 'Document Test Family',
            'description' => null,
            'sort_order' => 99,
        ]);
        Sanctum::actingAs($agent);

        $response = $this->postJson('/api/documents', [
            'title' => 'AMR installation manual',
            'slug' => 'amr-installation-manual',
            'category_id' => $category->id,
            'upload_id' => $upload->id,
            'document_type' => 'pdf',
            'visibility' => 'client',
            'product_family_ids' => [$family->id],
        ]);

        $response->assertCreated()
            ->assertJsonPath('status', 201)
            ->assertJsonPath('data.slug', 'amr-installation-manual')
            ->assertJsonCount(1, 'data.families');
        $this->assertDatabaseHas('document_versions', [
            'document_id' => $response->json('data.id'),
            'version' => '1.0',
        ]);
    }

    public function test_guest_only_sees_published_unscoped_client_documents(): void
    {
        $owner = User::factory()->create(['role' => 'agent']);
        $category = $this->category();
        $visible = $this->document($owner, $category, ['slug' => 'public-manual']);
        $targeted = $this->document($owner, $category, ['slug' => 'targeted-manual']);
        $family = ProductFamily::query()->create([
            'name' => 'Targeted Document Family',
            'description' => null,
            'sort_order' => 100,
        ]);
        $targeted->productFamilies()->attach($family);

        $this->getJson('/api/documents')
            ->assertOk()
            ->assertJsonPath('status', 200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $visible->id);

        $this->getJson('/api/documents/targeted-manual')->assertNotFound();
    }

    public function test_client_can_preview_a_document_for_an_owned_product(): void
    {
        $client = User::factory()->create(['role' => 'client']);
        $agent = User::factory()->create(['role' => 'agent']);
        $family = ProductFamily::query()->create([
            'name' => 'Owned Document Family',
            'description' => null,
            'sort_order' => 101,
        ]);
        $product = Product::query()->create([
            'family_id' => $family->id,
            'model' => 'DOC-TEST',
            'name' => 'Document Test Robot',
        ]);
        Robot::query()->create([
            'user_id' => $client->id,
            'product_id' => $product->id,
            'serial_number' => 'DOC-'.str()->uuid(),
            'status' => 'active',
        ]);
        $document = $this->document($agent, $this->category(), ['slug' => 'owned-product-manual']);
        $document->products()->attach($product);
        Sanctum::actingAs($client);

        $this->getJson("/api/documents/{$document->id}/preview")
            ->assertOk()
            ->assertJsonPath('status', 200)
            ->assertJsonPath('data.id', $document->id)
            ->assertJsonPath('data.expires_in', 900);

        $this->getJson('/api/documents')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $document->id);
    }

    public function test_unsigned_download_is_rejected(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $document = $this->document($admin, $this->category(), ['slug' => 'signed-download']);
        Sanctum::actingAs($admin);

        $this->get("/api/documents/{$document->id}/download")->assertForbidden();
    }

    public function test_authorized_user_can_download_with_a_signed_url(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $document = $this->document($admin, $this->category(), ['slug' => 'valid-signed-download']);
        Storage::disk('public')->put($document->upload->file_path, 'PDF test content');
        Sanctum::actingAs($admin);

        $preview = $this->getJson("/api/documents/{$document->id}/preview")->assertOk();

        $this->get($preview->json('data.download_url'))
            ->assertOk()
            ->assertDownload('manual.pdf');
        $this->assertDatabaseHas('documents', [
            'id' => $document->id,
            'download_count' => 1,
        ]);
    }

    public function test_only_admin_can_grant_restricted_document_access(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $agent = User::factory()->create(['role' => 'agent']);
        $client = User::factory()->create(['role' => 'client']);
        $document = $this->document($admin, $this->category(), [
            'slug' => 'restricted-document',
            'visibility' => 'restricted',
        ]);

        Sanctum::actingAs($agent);
        $this->postJson("/api/documents/{$document->id}/permissions", [
            'user_id' => $client->id,
        ])->assertForbidden();
        $this->getJson("/api/documents/{$document->id}/preview")->assertForbidden();

        Sanctum::actingAs($admin);
        $this->postJson("/api/documents/{$document->id}/permissions", [
            'user_id' => $client->id,
            'can_view' => true,
            'can_download' => false,
        ])->assertCreated();

        Sanctum::actingAs($client);
        $this->getJson("/api/documents/{$document->id}/preview")
            ->assertOk()
            ->assertJsonPath('data.download_url', null)
            ->assertJsonPath('data.expires_in', null);
    }

    public function test_client_cannot_create_documents(): void
    {
        $client = User::factory()->create(['role' => 'client']);
        Sanctum::actingAs($client);

        $this->postJson('/api/documents', [])->assertForbidden();
    }

    private function category(): DocumentCategory
    {
        return DocumentCategory::query()->firstOrCreate(
            ['slug' => 'technical-test'],
            ['name' => 'Technical Test', 'sort_order' => 99],
        );
    }

    /**
     * @param  array<string, mixed>  $overrides
     */
    private function document(User $owner, DocumentCategory $category, array $overrides = []): Document
    {
        return Document::query()->create(array_merge([
            'title' => 'Document test',
            'slug' => 'document-'.str()->uuid(),
            'category_id' => $category->id,
            'upload_id' => $this->upload($owner)->id,
            'document_type' => 'pdf',
            'visibility' => 'client',
            'is_published' => true,
            'published_at' => now(),
            'uploaded_by' => $owner->id,
        ], $overrides));
    }

    private function upload(User $owner): Upload
    {
        Storage::fake('public');

        return Upload::query()->create([
            'user_id' => $owner->id,
            'original_name' => 'manual.pdf',
            'file_path' => 'uploads/tests/manual.pdf',
            'file_size' => 1024,
            'mime_type' => 'application/pdf',
            'disk' => 'public',
        ]);
    }
}
