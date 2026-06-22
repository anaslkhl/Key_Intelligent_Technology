<?php

namespace App\Services;

use App\Models\KbArticle;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class KbSearchService
{
    /**
     * @return Collection<int, array<string, mixed>>
     */
    public function autocomplete(string $query): Collection
    {
        $term = trim($query);

        if (mb_strlen($term) < 2) {
            return collect();
        }

        return KbArticle::query()
            ->where('is_published', true)
            ->where('title', 'ilike', "%{$term}%")
            ->orderByRaw('CASE WHEN lower(title) LIKE lower(?) THEN 0 ELSE 1 END', ["{$term}%"])
            ->orderByDesc('views')
            ->limit(5)
            ->get(['id', 'title', 'slug', 'category', 'content'])
            ->map(fn (KbArticle $article) => [
                'id' => $article->id,
                'title' => $article->title,
                'slug' => $article->slug,
                'category' => $article->category,
                'reading_time' => $article->readingTime(),
            ]);
    }

    /**
     * @return Collection<int, KbArticle>
     */
    public function relatedArticles(KbArticle $article, int $limit = 5): Collection
    {
        $tags = $article->tags ?? [];

        return KbArticle::query()
            ->where('is_published', true)
            ->whereKeyNot($article->id)
            ->where(function (Builder $query) use ($article, $tags): void {
                $query->where('category', $article->category);

                foreach ($tags as $tag) {
                    $query->orWhereJsonContains('tags', $tag);
                }
            })
            ->orderByRaw('CASE WHEN category = ? THEN 0 ELSE 1 END', [$article->category])
            ->orderByDesc('views')
            ->limit(min(max($limit, 3), 5))
            ->get();
    }
}
