<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreFeatureRequest;
use App\Http\Requests\UpdateFeatureStatusRequest;
use App\Http\Resources\FeatureRequestResource;
use App\Models\FeatureRequest;
use App\Models\FeatureVote;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class FeatureRequestController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $featureRequests = FeatureRequest::query()
            ->with('user:id,name')
            ->orderByDesc('upvotes_count')
            ->latest()
            ->paginate($this->perPage());

        return $this->paginatedResponse($featureRequests, FeatureRequestResource::class, 'Feature requests retrieved successfully.');
    }

    public function store(StoreFeatureRequest $request): JsonResponse
    {
        $featureRequest = FeatureRequest::query()->create([
            ...$request->validated(),
            'user_id' => $request->user()->id,
            'status' => 'pending',
            'upvotes_count' => 0,
        ]);

        $featureRequest->load('user:id,name');

        return $this->successResponse(new FeatureRequestResource($featureRequest), 'Feature request submitted successfully.', 201);
    }

    public function show(string $id): JsonResponse
    {
        $featureRequest = FeatureRequest::query()
            ->with('user:id,name')
            ->findOrFail($id);

        return $this->successResponse(new FeatureRequestResource($featureRequest), 'Feature request retrieved successfully.');
    }

    public function vote(Request $request, string $id): JsonResponse
    {
        if ($request->user()->role !== 'client') {
            return $this->errorResponse('Only clients can vote for feature requests.', [], 403);
        }

        $featureRequest = FeatureRequest::query()->findOrFail($id);

        if (FeatureVote::query()
            ->where('feature_id', $featureRequest->id)
            ->where('user_id', $request->user()->id)
            ->exists()) {
            return $this->errorResponse('You have already voted for this feature request.', [
                'feature_request_id' => ['Each user can vote once per feature request.'],
            ]);
        }

        try {
            DB::transaction(function () use ($featureRequest, $request): void {
                FeatureVote::query()->create([
                    'feature_id' => $featureRequest->id,
                    'user_id' => $request->user()->id,
                ]);

                $featureRequest->increment('upvotes_count');
            });
        } catch (QueryException) {
            return $this->errorResponse('You have already voted for this feature request.', [
                'feature_request_id' => ['Each user can vote once per feature request.'],
            ]);
        }

        return $this->successResponse(
            new FeatureRequestResource($featureRequest->refresh()->load('user:id,name')),
            'Vote recorded successfully.',
        );
    }

    public function updateStatus(UpdateFeatureStatusRequest $request, string $id): JsonResponse
    {
        $featureRequest = FeatureRequest::query()->with('user:id,name')->findOrFail($id);

        if (Gate::denies('updateStatus', $featureRequest)) {
            return $this->errorResponse('Only admins can update feature request status.', [], 403);
        }

        $featureRequest->update([
            'status' => $request->validated()['status'],
        ]);

        return $this->successResponse(
            new FeatureRequestResource($featureRequest->refresh()->load('user:id,name')),
            'Feature request status updated successfully.',
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
            'errors' => $errors,
            'status' => $status,
        ], $status);
    }
}
