<?php

namespace App\Services;

use App\Models\KbArticle;
use App\Models\KbRecentView;
use App\Models\KbSearchLog;
use App\Models\TicketCategory;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class KbSearchService
{
    public function track(string $query, int $resultsCount, ?User $user = null): void
    {
        $term = trim(preg_replace('/\s+/u', ' ', $query) ?? '');

        if ($term === '') {
            return;
        }

        KbSearchLog::query()->create([
            'user_id' => $user?->id,
            'query' => Str::limit($term, 255, ''),
            'normalized_query' => Str::lower(Str::limit($term, 255, '')),
            'results_count' => max(0, $resultsCount),
        ]);
    }

    public function recordView(User $user, KbArticle $article): void
    {
        KbRecentView::query()->updateOrCreate(
            ['user_id' => $user->id, 'article_id' => $article->id],
            ['viewed_at' => now()],
        );

        $staleIds = KbRecentView::query()
            ->where('user_id', $user->id)
            ->latest('viewed_at')
            ->skip(5)
            ->take(100)
            ->pluck('id');

        if ($staleIds->isNotEmpty()) {
            KbRecentView::query()->whereKey($staleIds)->delete();
        }
    }

    public function suggestedTicketCategoryId(KbArticle $article): ?string
    {
        if (! $article->family_id) {
            return null;
        }

        $categories = TicketCategory::query()
            ->where('family_id', $article->family_id)
            ->orderBy('name')
            ->get(['id', 'name']);

        if ($categories->isEmpty()) {
            return null;
        }

        $context = Str::lower(implode(' ', [$article->title, $article->category, ...($article->tags ?? [])]));

        return $categories->sortByDesc(function (TicketCategory $category) use ($context): int {
            $words = preg_split('/[^a-z0-9]+/i', Str::lower($category->name), -1, PREG_SPLIT_NO_EMPTY) ?: [];

            return collect($words)->sum(fn (string $word): int => mb_strlen($word) >= 3 && str_contains($context, $word) ? 1 : 0);
        })->first()?->id;
    }

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
