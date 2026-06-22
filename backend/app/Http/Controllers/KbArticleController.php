<?php

namespace App\Http\Controllers;

use App\Models\KbArticle;
use App\Models\KbRecentView;
use App\Models\Product;
use App\Models\User;
use App\Services\KbSearchService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class KbArticleController extends Controller
{
    public function __construct(private readonly KbSearchService $searchService) {}

    public function manageIndex(Request $request): JsonResponse
    {
        $this->authorizeKnowledgeBaseWriter($request);
        $validated = $request->validate([
            'family_id' => ['nullable', 'uuid', 'exists:product_families,id'],
            'q' => ['nullable', 'string', 'max:255'],
            'category' => ['nullable', Rule::in(KbArticle::CATEGORIES)],
        ]);

        $articles = KbArticle::query()
            ->with(['family:id,name', 'product:id,model,name', 'author:id,name,email,role'])
            ->when($validated['family_id'] ?? null, fn (Builder $query, string $familyId) => $query->where('family_id', $familyId))
            ->when($validated['q'] ?? null, fn (Builder $query, string $term) => $this->applySearch($query, $term))
            ->when($validated['category'] ?? null, fn (Builder $query, string $category) => $query->where('category', $category))
            ->latest()
            ->paginate($this->perPage());

        $articles->getCollection()->transform(fn (KbArticle $article) => [
            ...$this->articleListPayload($article),
            'is_published' => $article->is_published,
            'product' => $article->product,
            'updated_at' => $article->updated_at,
        ]);

        return $this->success($this->paginatorPayload($articles), 'Knowledge base management articles retrieved successfully.');
    }

    public function manageShow(Request $request, string $id): JsonResponse
    {
        $this->authorizeKnowledgeBaseWriter($request);
        $article = KbArticle::query()
            ->with(['family:id,name', 'product:id,model,name', 'author:id,name,email,role'])
            ->findOrFail($id);

        return $this->success($this->articleDetailPayload($article), 'Knowledge base management article retrieved successfully.');
    }

    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'family_id' => ['nullable', 'uuid', 'exists:product_families,id'],
            'q' => ['nullable', 'string', 'max:255'],
            'category' => ['nullable', Rule::in(KbArticle::CATEGORIES)],
        ]);

        $articles = $this->publishedArticleQuery()
            ->when($validated['family_id'] ?? null, fn (Builder $query, string $familyId) => $query->where('family_id', $familyId))
            ->when($validated['q'] ?? null, fn (Builder $query, string $term) => $this->applySearch($query, $term))
            ->when($validated['category'] ?? null, fn (Builder $query, string $category) => $query->where('category', $category))
            ->latest()
            ->paginate($this->perPage());

        $articles->getCollection()->transform(fn (KbArticle $article) => $this->articleListPayload($article));

        if (! empty($validated['q'])) {
            $this->searchService->track($validated['q'], $articles->total(), $this->sanctumUser($request));
        }

        return $this->success($this->paginatorPayload($articles), 'Knowledge base articles retrieved successfully.');
    }

    public function search(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'q' => ['nullable', 'string', 'max:255'],
            'family_id' => ['nullable', 'uuid', 'exists:product_families,id'],
            'category' => ['nullable', Rule::in(KbArticle::CATEGORIES)],
        ]);

        $articles = $this->publishedArticleQuery()
            ->when($validated['q'] ?? null, fn (Builder $query, string $term) => $this->applySearch($query, $term))
            ->when($validated['family_id'] ?? null, fn (Builder $query, string $familyId) => $query->where('family_id', $familyId))
            ->when($validated['category'] ?? null, fn (Builder $query, string $category) => $query->where('category', $category))
            ->latest()
            ->paginate($this->perPage());

        $articles->getCollection()->transform(fn (KbArticle $article) => $this->articleListPayload($article));

        if (! empty($validated['q'])) {
            $this->searchService->track($validated['q'], $articles->total(), $this->sanctumUser($request));
        }

        return $this->success($this->paginatorPayload($articles), 'Knowledge base search results retrieved successfully.');
    }

    public function show(Request $request, string $slug): JsonResponse
    {
        $article = $this->publishedArticleQuery()
            ->where('slug', $slug)
            ->firstOrFail();

        $article->increment('views');
        $article->refresh();

        if ($user = $this->sanctumUser($request)) {
            $this->searchService->recordView($user, $article);
        }

        return $this->success($this->articleDetailPayload($article), 'Knowledge base article retrieved successfully.');
    }

    public function highlights(Request $request): JsonResponse
    {
        $mostViewed = $this->publishedArticleQuery()
            ->orderByDesc('views')
            ->limit(5)
            ->get()
            ->map(fn (KbArticle $article) => $this->articleListPayload($article));

        $mostHelpful = $this->publishedArticleQuery()
            ->orderByDesc('helpful_count')
            ->orderByDesc('views')
            ->limit(5)
            ->get()
            ->map(fn (KbArticle $article) => $this->articleListPayload($article));

        $recentlyViewed = collect();
        if ($user = $this->sanctumUser($request)) {
            $recentlyViewed = KbRecentView::query()
                ->where('user_id', $user->id)
                ->with(['article' => fn ($query) => $query
                    ->where('is_published', true)
                    ->with(['family:id,name', 'product:id,model,name'])])
                ->latest('viewed_at')
                ->limit(5)
                ->get()
                ->filter(fn (KbRecentView $view) => $view->article !== null)
                ->map(fn (KbRecentView $view) => [
                    ...$this->articleListPayload($view->article),
                    'viewed_at' => $view->viewed_at,
                ])
                ->values();
        }

        return $this->success([
            'most_viewed' => $mostViewed,
            'most_helpful' => $mostHelpful,
            'recently_viewed' => $recentlyViewed,
        ], 'Knowledge base highlights retrieved successfully.');
    }

    public function suggest(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'q' => ['required', 'string', 'min:2', 'max:255'],
        ]);

        return $this->success(
            $this->searchService->autocomplete($validated['q']),
            'Knowledge base suggestions retrieved successfully.',
        );
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorizeKnowledgeBaseWriter($request);

        $validated = $this->validateArticle($request);
        $this->ensureProductMatchesFamily($validated);

        $article = KbArticle::query()->create([
            ...$validated,
            'slug' => $this->uniqueSlug($validated['slug'] ?? $validated['title']),
            'author_id' => $request->user()->id,
            'views' => 0,
            'helpful_count' => 0,
        ]);

        $article->load(['family', 'product', 'author:id,name,email,role']);

        return $this->success($this->articleDetailPayload($article), 'Knowledge base article created successfully.', 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $this->authorizeKnowledgeBaseWriter($request);

        $article = KbArticle::query()->findOrFail($id);
        $validated = $this->validateArticle($request, $article);
        $this->ensureProductMatchesFamily([
            'family_id' => $validated['family_id'] ?? $article->family_id,
            'product_id' => $validated['product_id'] ?? $article->product_id,
        ]);

        if (! array_key_exists('slug', $validated) && array_key_exists('title', $validated)) {
            $validated['slug'] = $this->uniqueSlug($validated['title'], $article->id);
        } elseif (array_key_exists('slug', $validated)) {
            $validated['slug'] = $this->uniqueSlug($validated['slug'], $article->id);
        }

        $article->update($validated);
        $article->load(['family', 'product', 'author:id,name,email,role']);

        return $this->success($this->articleDetailPayload($article), 'Knowledge base article updated successfully.');
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $this->authorizeKnowledgeBaseWriter($request);

        KbArticle::query()->findOrFail($id)->delete();

        return $this->success(null, 'Knowledge base article deleted successfully.');
    }

    public function feedback(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'helpful' => ['required', 'boolean'],
        ]);

        $article = KbArticle::query()->where('is_published', true)->findOrFail($id);

        $article->increment($validated['helpful'] ? 'helpful_count' : 'not_helpful_count');
        $article->refresh();

        return $this->success([
            'id' => $article->id,
            'helpful' => $validated['helpful'],
            'helpful_count' => $article->helpful_count,
            'not_helpful_count' => $article->not_helpful_count,
        ], 'Feedback recorded successfully.');
    }

    private function publishedArticleQuery(): Builder
    {
        return KbArticle::query()
            ->where('is_published', true)
            ->with(['family:id,name', 'product:id,model,name', 'author:id,name,email,role']);
    }

    private function applySearch(Builder $query, string $term): Builder
    {
        return $query->where(function (Builder $query) use ($term) {
            $query->where('title', 'ilike', "%{$term}%")
                ->orWhere('content', 'ilike', "%{$term}%");
        });
    }

    private function validateArticle(Request $request, ?KbArticle $article = null): array
    {
        $slugRule = Rule::unique('kb_articles', 'slug')->ignore($article?->id);
        $required = $article ? 'sometimes' : 'required';

        return $request->validate([
            'title' => [$required, 'string', 'max:255'],
            'slug' => ['sometimes', 'string', 'max:255', $slugRule],
            'content' => [$required, 'string'],
            'category' => [$required, Rule::in(KbArticle::CATEGORIES)],
            'family_id' => ['nullable', 'uuid', 'exists:product_families,id'],
            'product_id' => ['nullable', 'uuid', 'exists:products,id'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:50'],
            'is_published' => ['sometimes', 'boolean'],
        ]);
    }

    private function ensureProductMatchesFamily(array $validated): void
    {
        if (empty($validated['family_id']) || empty($validated['product_id'])) {
            return;
        }

        $product = Product::query()->findOrFail($validated['product_id']);

        abort_unless(
            $product->family_id === $validated['family_id'],
            422,
            'The selected product does not belong to the selected product family.',
        );
    }

    private function authorizeKnowledgeBaseWriter(Request $request): void
    {
        abort_unless($request->user()?->is_active, 403, 'Your account is inactive.');
        abort_unless(in_array($request->user()?->role, ['agent', 'admin'], true), 403, 'Only agents and admins can manage knowledge base articles.');
    }

    private function uniqueSlug(string $value, ?string $ignoreId = null): string
    {
        $baseSlug = Str::slug($value) ?: Str::uuid()->toString();
        $slug = $baseSlug;
        $suffix = 2;

        while (KbArticle::query()
            ->where('slug', $slug)
            ->when($ignoreId, fn (Builder $query) => $query->where('id', '!=', $ignoreId))
            ->exists()
        ) {
            $slug = "{$baseSlug}-{$suffix}";
            $suffix++;
        }

        return $slug;
    }

    private function articleListPayload(KbArticle $article): array
    {
        return [
            'id' => $article->id,
            'title' => $article->title,
            'slug' => $article->slug,
            'excerpt' => Str::limit(strip_tags($this->renderMarkdown($article->content)), 180),
            'category' => $article->category,
            'reading_time' => $article->readingTime(),
            'family' => $article->family,
            'tags' => $article->tags ?? [],
            'helpful_count' => $article->helpful_count,
            'not_helpful_count' => $article->not_helpful_count,
            'views' => $article->views,
        ];
    }

    private function articleDetailPayload(KbArticle $article): array
    {
        return [
            'id' => $article->id,
            'title' => $article->title,
            'slug' => $article->slug,
            'content' => $article->content,
            'content_html' => $this->renderMarkdown($article->content),
            'category' => $article->category,
            'reading_time' => $article->readingTime(),
            'family' => $article->family,
            'product' => $article->product,
            'tags' => $article->tags ?? [],
            'author' => $article->author,
            'views' => $article->views,
            'helpful_count' => $article->helpful_count,
            'not_helpful_count' => $article->not_helpful_count,
            'is_published' => $article->is_published,
            'created_at' => $article->created_at,
            'updated_at' => $article->updated_at,
            'suggested_ticket_category_id' => $this->searchService->suggestedTicketCategoryId($article),
            'related_articles' => $this->searchService->relatedArticles($article)->map(fn (KbArticle $related) => [
                'id' => $related->id,
                'title' => $related->title,
                'slug' => $related->slug,
                'category' => $related->category,
                'reading_time' => $related->readingTime(),
            ])->values(),
        ];
    }

    private function renderMarkdown(string $content): string
    {
        return (string) Str::markdown(strip_tags($content));
    }

    private function sanctumUser(Request $request): ?User
    {
        $user = $request->user('sanctum');

        return $user instanceof User ? $user : null;
    }

    private function paginatorPayload($paginator): array
    {
        return [
            'data' => $paginator->getCollection(),
            'links' => [
                'first' => $paginator->url(1),
                'last' => $paginator->url($paginator->lastPage()),
                'prev' => $paginator->previousPageUrl(),
                'next' => $paginator->nextPageUrl(),
            ],
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'from' => $paginator->firstItem(),
                'last_page' => $paginator->lastPage(),
                'path' => $paginator->path(),
                'per_page' => $paginator->perPage(),
                'to' => $paginator->lastItem(),
                'total' => $paginator->total(),
            ],
        ];
    }
}
