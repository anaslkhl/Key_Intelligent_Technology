<?php

namespace App\Http\Controllers;
use App\Models\Robot;
use App\Models\Ticket;
use App\Models\TicketCategory;
use App\Models\TicketMessage;
use App\Models\Upload;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TicketController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorizeClient($request);

        $tickets = Ticket::query()
            ->where('user_id', $request->user()->id)
            ->with([
                'robot.product.family',
                'category',
                'assignee:id,name,email',
            ])
            ->withCount('messages')
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return response()->json($tickets);
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorizeClient($request);

        $validated = $request->validate([
            'robot_id' => ['required', 'uuid', 'exists:robots,id'],
            'category_id' => ['required', 'uuid', 'exists:ticket_categories,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'priority' => ['required', 'string', Rule::in(['low', 'medium', 'high', 'urgent'])],
            'attachments' => ['sometimes', 'array'],
            'attachments.*' => ['string', 'max:2048', 'exists:uploads,file_path'],
        ]);

        $robot = Robot::query()
            ->with('product')
            ->where('id', $validated['robot_id'])
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $category = TicketCategory::query()->findOrFail($validated['category_id']);

        if ($category->family_id !== $robot->product->family_id) {
            return response()->json([
                'message' => 'The selected ticket category does not belong to this robot product family.',
            ], 422);
        }

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

        $ticket->load([
            'robot.product.family',
            'category',
            'messages.user:id,name,email,role',
        ]);

        return response()->json($ticket, 201);
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

        return response()->json($ticket);
    }

    private function authorizeClient(Request $request): void
    {
        abort_unless($request->user()?->is_active, 403, 'Your account is inactive.');
        abort_unless($request->user()?->role === 'client', 403, 'Only authenticated clients can access tickets.');
    }
}

