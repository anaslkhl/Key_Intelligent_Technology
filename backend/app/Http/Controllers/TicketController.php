<?php

namespace App\Http\Controllers;

use App\Events\TicketCreated;
use App\Http\Resources\TicketResource;
use App\Models\Robot;
use App\Models\Ticket;
use App\Models\TicketCategory;
use App\Models\TicketMessage;
use App\Models\Upload;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class TicketController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorizeClient($request);

        $validated = $request->validate([
            'status' => ['nullable', Rule::in(['new', 'open', 'in_progress', 'waiting_client', 'resolved', 'closed'])],
        ]);

        $tickets = Ticket::query()
            ->where('user_id', $request->user()->id)
            ->when($validated['status'] ?? null, fn ($query, string $status) => $query->where('status', $status))
            ->with([
                'robot.product.family',
                'category',
                'assignee:id,name,email',
            ])
            ->withCount('messages')
            ->latest()
            ->paginate($this->perPage());

        return $this->paginated($tickets, TicketResource::class, 'Tickets retrieved successfully.');
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorizeClient($request);

        $validated = $request->validate([
            'robot_id' => [
                'required',
                'uuid',
                Rule::exists('robots', 'id')->where(
                    fn ($query) => $query->where('user_id', $request->user()->id)
                ),
            ],
            'category_id' => ['required', 'uuid', 'exists:ticket_categories,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'priority' => ['required', 'string', Rule::in(['low', 'medium', 'high', 'urgent'])],
            'attachments' => ['sometimes', 'array'],
            'attachments.*' => ['string', 'max:2048', 'exists:uploads,file_path'],
        ], [
            'robot_id.exists' => 'The selected robot does not exist or does not belong to your account.',
            'category_id.exists' => 'The selected ticket category does not exist.',
        ]);

        $this->ensureAttachmentsBelongToUser($validated['attachments'] ?? [], $request->user()->id);

        $robot = Robot::query()
            ->with('product')
            ->find($validated['robot_id']);

        $category = TicketCategory::query()->find($validated['category_id']);

        if (! $robot || ! $category) {
            return $this->error('The selected robot or ticket category is no longer available.', [], 422);
        }

        if ($category->family_id !== $robot->product->family_id) {
            return $this->error('The selected ticket category does not belong to this robot product family.', [
                'category_id' => ['Choose a category from the selected robot product family.'],
            ], 422);
        }

        $ticket = DB::transaction(function () use ($request, $robot, $category, $validated): Ticket {
            $ticket = Ticket::query()->create([
                'user_id' => $request->user()->id,
                'robot_id' => $robot->id,
                'category_id' => $category->id,
                'title' => $validated['title'],
                'description' => $validated['description'],
                'priority' => $validated['priority'],
                'status' => 'new',
            ]);

            if (! empty($validated['attachments'])) {
                $message = $ticket->messages()->create([
                    'user_id' => $request->user()->id,
                    'content' => $validated['description'],
                    'attachments' => $validated['attachments'],
                    'is_internal' => false,
                ]);

                Upload::query()
                    ->where('user_id', $request->user()->id)
                    ->whereIn('file_path', $validated['attachments'])
                    ->update([
                        'attachable_type' => TicketMessage::class,
                        'attachable_id' => $message->id,
                    ]);
            }

            return $ticket;
        });

        $ticket->load([
            'robot.product.family',
            'category',
            'messages.user:id,name,email,role',
        ]);

        TicketCreated::dispatch($ticket);

        return $this->success(new TicketResource($ticket), 'Ticket created successfully.', 201);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $this->authorizeClient($request);

        $ticket = Ticket::query()
            ->where('id', $id)
            ->where('user_id', $request->user()->id)
            ->with([
                'robot.product.family',
                'category',
                'assignee:id,name,email',
                'messages' => fn ($query) => $query
                    ->where('is_internal', false)
                    ->oldest(),
                'messages.user:id,name,email,role',
            ])
            ->firstOrFail();

        return $this->success(new TicketResource($ticket), 'Ticket retrieved successfully.');
    }

    public function close(Request $request, string $id): JsonResponse
    {
        $this->authorizeClient($request);

        $validated = $request->validate([
            'csat_rating' => ['required', 'integer', 'between:1,5'],
        ]);

        $ticket = Ticket::query()
            ->where('user_id', $request->user()->id)
            ->where('id', $id)
            ->firstOrFail();

        if ($ticket->status === 'closed') {
            return $this->error('This ticket is already closed.', [], 422);
        }

        $ticket->update([
            'status' => 'closed',
            'csat_rating' => $validated['csat_rating'],
        ]);

        $ticket->load(['robot.product.family', 'category', 'assignee:id,name']);

        return $this->success(new TicketResource($ticket), 'Ticket closed successfully.');
    }

    private function authorizeClient(Request $request): void
    {
        abort_unless($request->user()?->is_active, 403, 'Your account is inactive.');
        abort_unless($request->user()?->role === 'client', 403, 'Only authenticated clients can access tickets.');
    }

    /**
     * @param array<int, string> $paths
     */
    private function ensureAttachmentsBelongToUser(array $paths, string $userId): void
    {
        $paths = array_unique($paths);

        if ($paths === []) {
            return;
        }

        $ownedUploads = Upload::query()
            ->where('user_id', $userId)
            ->whereIn('file_path', $paths)
            ->count();

        abort_unless($ownedUploads === count($paths), 403, 'All attachments must belong to the authenticated user.');
    }
}
