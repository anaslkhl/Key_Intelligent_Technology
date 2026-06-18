<?php

namespace App\Http\Controllers;

use App\Models\KbArticle;
use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class KbArticleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'family_id' => ['nullable', 'uuid', 'exists:product_families,id'],
            'q' => ['nullable', 'string', 'max:255'],
        ]);

        $articles = $this->publishedArticleQuery()
            ->when($validated['family_id'] ?? null, fn(Builder $query, string $familyId) => $query->where('family_id', $familyId))
            ->when($validated['q'] ?? null, fn(Builder $query, string $term) => $this->applySearch($query, $term))
            ->latest()
            ->paginate($request->integer('per_page', 15));

        $articles->getCollection()->transform(fn(KbArticle $article) => $this->articleListPayload($article));

        return response()->json($articles);
    }

    public function search(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'q' => ['nullable', 'string', 'max:255'],
            'family_id' => ['nullable', 'uuid', 'exists:product_families,id'],
        ]);

        $articles = $this->publishedArticleQuery()
            ->when($validated['q'] ?? null, fn(Builder $query, string $term) => $this->applySearch($query, $term))
            ->when($validated['family_id'] ?? null, fn(Builder $query, string $familyId) => $query->where('family_id', $familyId))
            ->latest()
            ->paginate($request->integer('per_page', 15));

        $articles->getCollection()->transform(fn(KbArticle $article) => $this->articleListPayload($article));

        return response()->json($articles);
    }

    public function show(string $slug): JsonResponse
    {
        $article = $this->publishedArticleQuery()
            ->where('slug', $slug)
            ->firstOrFail();

        $article->increment('views');
        $article->refresh();

        return response()->json($this->articleDetailPayload($article));
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

        return response()->json($this->articleDetailPayload($article), 201);
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

        return response()->json($this->articleDetailPayload($article));
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $this->authorizeKnowledgeBaseWriter($request);

        KbArticle::query()->findOrFail($id)->delete();

        return response()->noContent();
    }

    public function feedback(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'helpful' => ['required', 'boolean'],
        ]);

        $article = KbArticle::query()->where('is_published', true)->findOrFail($id);

        $article->increment($validated['helpful'] ? 'helpful_count' : 'not_helpful_count');
        $article->refresh();

        return response()->json([
            'id' => $article->id,
            'helpful' => $validated['helpful'],
            'helpful_count' => $article->helpful_count,
            'not_helpful_count' => $article->not_helpful_count,
        ]);
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
            ->when($ignoreId, fn(Builder $query) => $query->where('id', '!=', $ignoreId))
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
            'excerpt' => Str::limit(strip_tags((string) Str::markdown($article->content)), 180),
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
            'content_html' => (string) Str::markdown($article->content),
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
        ];
    }
}
