<?php

namespace App\Http\Controllers;

use App\Http\Requests\ApproveReviewRequest;
use App\Http\Requests\StoreReviewRequest;
use App\Http\Resources\ReviewResource;
use App\Models\Review;
use App\Models\Robot;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class ReviewController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => ['nullable', 'uuid', 'exists:products,id'],
        ]);

        $reviews = Review::query()
            ->where('is_approved', true)
            ->with(['user:id,name', 'robot.product'])
            ->when($validated['product_id'] ?? null, fn ($query, string $productId) => $query
                ->whereHas('robot', fn ($query) => $query->where('product_id', $productId)))
            ->latest()
            ->paginate($this->perPage());

        return $this->paginatedResponse($reviews, ReviewResource::class, 'Approved reviews retrieved successfully.');
    }

    public function store(StoreReviewRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $robot = Robot::query()
            ->where('id', $validated['robot_id'])
            ->where('user_id', $request->user()->id)
            ->first();

        if (! $robot) {
            return $this->errorResponse('You can only review robots that belong to your account.', [], 403);
        }

        $review = Review::query()->create([
            'rating' => $validated['rating'],
            'title' => $validated['title'] ?? null,
            'comment' => $validated['comment'] ?? null,
            'pros' => $validated['pros'] ?? null,
            'cons' => $validated['cons'] ?? null,
            'robot_id' => $robot->id,
            'user_id' => $request->user()->id,
            'is_approved' => false,
        ]);

        $review->load(['user:id,name', 'robot.product']);

        return $this->successResponse(new ReviewResource($review), 'Review submitted successfully and is pending admin approval.', 201);
    }

    public function show(string $id): JsonResponse
    {
        $review = Review::query()
            ->where('is_approved', true)
            ->with(['user:id,name', 'robot.product'])
            ->findOrFail($id);

        return $this->successResponse(new ReviewResource($review), 'Review retrieved successfully.');
    }

    public function myReviews(Request $request): JsonResponse
    {
        $reviews = Review::query()
            ->where('user_id', $request->user()->id)
            ->with(['user:id,name', 'robot.product'])
            ->latest()
            ->paginate($this->perPage());

        return $this->paginatedResponse($reviews, ReviewResource::class, 'Your reviews retrieved successfully.');
    }

    public function approve(ApproveReviewRequest $request, string $id): JsonResponse
    {
        $review = Review::query()->with(['user:id,name', 'robot.product'])->findOrFail($id);

        if (Gate::denies('approve', $review)) {
            return $this->errorResponse('Only admins can approve or reject reviews.', [], 403);
        }

        $review->update([
            'is_approved' => $request->boolean('is_approved'),
        ]);

        return $this->successResponse(
            new ReviewResource($review->refresh()->load(['user:id,name', 'robot.product'])),
            $review->is_approved ? 'Review approved successfully.' : 'Review rejected successfully.',
        );
    }

    private function successResponse(mixed $data, string $message, int $status = 200): JsonResponse
    {
        return response()->json([
            'data' => $data,
            'message' => $message,
            'status' => $status,
        ], $status);
    }

    private function paginatedResponse($paginator, string $resourceClass, string $message): JsonResponse
    {
        return response()->json([
            'data' => $resourceClass::collection($paginator->getCollection()),
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
            'message' => $message,
            'status' => 200,
        ]);
    }

    private function errorResponse(string $message, array $errors = [], int $status = 422): JsonResponse
    {
        return response()->json([
            'message' => $message,
            'errors' => (object) $errors,
            'status' => $status,
        ], $status);
    }
}
