<?php

namespace Tests\Feature;

use App\Models\KbArticle;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
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
