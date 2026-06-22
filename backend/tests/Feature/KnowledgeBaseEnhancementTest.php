<?php

namespace Tests\Feature;

use App\Models\ErrorCode;
use App\Models\KbArticle;
use App\Models\KbSearchLog;
use App\Models\Product;
use App\Models\ProductFamily;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class KnowledgeBaseEnhancementTest extends TestCase
{
    use DatabaseTransactions;

    public function test_category_filter_and_reading_time_are_returned(): void
    {
        $article = $this->article([
            'title' => 'Battery diagnostics handbook',
            'slug' => 'battery-diagnostics-handbook-test',
            'category' => 'troubleshooting',
            'content' => implode(' ', array_fill(0, 201, 'diagnostics')),
        ]);

        $response = $this->getJson('/api/knowledge-base?category=troubleshooting&per_page=50')->assertOk();
        $listedArticle = collect($response->json('data.data'))->firstWhere('id', $article->id);

        $this->assertNotNull($listedArticle);
        $this->assertSame('troubleshooting', $listedArticle['category']);
        $this->assertSame(2, $listedArticle['reading_time']);
    }

    public function test_suggestions_return_up_to_five_matching_titles(): void
    {
        foreach (range(1, 6) as $index) {
            $this->article([
                'title' => "Calibration suggestion {$index}",
                'slug' => "calibration-suggestion-{$index}-test",
            ]);
        }

        $response = $this->getJson('/api/knowledge-base/suggest?q=Calibration')->assertOk();

        $response->assertJsonPath('status', 200);
        $this->assertCount(5, $response->json('data'));
        $this->assertStringContainsString('Calibration', $response->json('data.0.title'));
    }

    public function test_detail_includes_related_articles_by_category_or_tags(): void
    {
        $article = $this->article([
            'title' => 'Primary maintenance guide',
            'slug' => 'primary-maintenance-guide-test',
            'category' => 'maintenance',
            'tags' => ['battery'],
        ]);
        $related = $this->article([
            'title' => 'Related maintenance guide',
            'slug' => 'related-maintenance-guide-test',
            'category' => 'maintenance',
        ]);

        $response = $this->getJson("/api/knowledge-base/{$article->slug}")->assertOk();

        $this->assertTrue(collect($response->json('data.related_articles'))->pluck('id')->contains($related->id));
    }

    public function test_error_codes_can_be_searched_by_code_and_product(): void
    {
        $family = ProductFamily::query()->create(['name' => 'Diagnostics '.str()->uuid(), 'sort_order' => 99]);
        $product = Product::query()->create(['family_id' => $family->id, 'model' => 'TEST-'.str()->random(6), 'name' => 'Test robot']);
        $errorCode = ErrorCode::query()->create([
            'code' => 'E-'.str()->upper(str()->random(8)),
            'meaning' => 'Navigation sensor unavailable',
            'severity' => 'high',
            'cause' => 'The sensor is obstructed.',
            'solution' => 'Clean and recalibrate the sensor.',
            'product_id' => $product->id,
        ]);

        $response = $this->getJson("/api/error-codes?q={$errorCode->code}&product_id={$product->id}")->assertOk();

        $response->assertJsonPath('data.0.id', $errorCode->id);
        $response->assertJsonPath('data.0.product.id', $product->id);
    }

    public function test_authenticated_article_views_are_kept_in_recent_history(): void
    {
        $user = User::factory()->create();
        $article = $this->article(['slug' => 'recent-history-'.str()->uuid()]);
        Sanctum::actingAs($user);

        $this->getJson("/api/knowledge-base/{$article->slug}")->assertOk();
        $response = $this->getJson('/api/knowledge-base/highlights')->assertOk();

        $this->assertDatabaseHas('kb_recent_views', ['user_id' => $user->id, 'article_id' => $article->id]);
        $this->assertSame($article->id, $response->json('data.recently_viewed.0.id'));
    }

    public function test_searches_and_no_result_terms_are_available_to_admin_analytics(): void
    {
        $term = 'missing-'.str()->uuid();
        $this->getJson('/api/knowledge-base?q='.urlencode($term))->assertOk();
        $this->assertTrue(KbSearchLog::query()->where('normalized_query', str($term)->lower())->where('results_count', 0)->exists());

        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin);
        $response = $this->getJson('/api/admin/knowledge-base/analytics')->assertOk();

        $this->assertTrue(collect($response->json('data.no_result_searches'))->pluck('keyword')->contains(str($term)->lower()->toString()));
        $response->assertJsonStructure(['data' => ['most_viewed', 'least_helpful', 'no_result_searches', 'most_searched']]);
    }

    /**
     * @param  array<string, mixed>  $overrides
     */
    private function article(array $overrides = []): KbArticle
    {
        $author = User::factory()->create(['role' => 'agent']);

        return KbArticle::query()->create(array_merge([
            'title' => 'Knowledge article',
            'slug' => 'knowledge-article-'.str()->uuid(),
            'content' => '# Introduction'.PHP_EOL.PHP_EOL.'Article content for testing.',
            'category' => 'getting_started',
            'tags' => [],
            'author_id' => $author->id,
            'is_published' => true,
        ], $overrides));
    }
}
