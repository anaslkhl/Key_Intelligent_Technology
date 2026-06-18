<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTicketMessageRequest;
use App\Http\Requests\UpdateTicketMessageRequest;
use App\Http\Resources\TicketMessageResource;
use App\Models\Ticket;
use App\Models\TicketMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class TicketMessageController extends Controller
{
    /**
     * List messages for a ticket.
     */
    public function index(Ticket $ticket): JsonResponse
    {
        if (Gate::denies('viewAny', [TicketMessage::class, $ticket])) {
            return $this->error('You are not allowed to view messages for this ticket.', [], 403);
        }

        $messages = $ticket->messages()
            ->with('user:id,name,role')
            ->when(request()->user()->role === 'client', fn ($query) => $query->where('is_internal', false))
            ->oldest()
            ->paginate(request()->integer('per_page', 25));

        return $this->paginated($messages, TicketMessageResource::class, 'Ticket messages retrieved successfully.');
    }

    /**
     * Add a message to a ticket.
     */
    public function store(StoreTicketMessageRequest $request, Ticket $ticket): JsonResponse
    {
        if (Gate::denies('create', [TicketMessage::class, $ticket])) {
            return $this->error('You are not allowed to add messages to this ticket.', [], 403);
        }

        $validated = $request->validated();

        if ($request->user()->role === 'client' && ($validated['is_internal'] ?? false)) {
            return $this->error('Clients cannot create internal notes.', [
                'is_internal' => ['Only agents and admins can create internal notes.'],
            ], 403);
        }

        $message = DB::transaction(fn () => $ticket->messages()->create([
            'user_id' => $request->user()->id,
            'content' => $validated['content'],
            'is_internal' => $validated['is_internal'] ?? false,
            'attachments' => $validated['attachments'] ?? null,
        ]));

        $message->load('user:id,name,role');

        return $this->success(new TicketMessageResource($message), 'Ticket message created successfully.', 201);
    }

    /**
     * Update a recent message owned by the authenticated user.
     */
    public function update(UpdateTicketMessageRequest $request, TicketMessage $message): JsonResponse
    {
        if (Gate::denies('update', $message)) {
            return $this->error('You can only edit your own messages within 15 minutes of creation.', [], 403);
        }

        $validated = $request->validated();

        if ($request->user()->role === 'client' && ($validated['is_internal'] ?? false)) {
            return $this->error('Clients cannot create internal notes.', [
                'is_internal' => ['Only agents and admins can create internal notes.'],
            ], 403);
        }

        $message = DB::transaction(function () use ($message, $validated): TicketMessage {
            $message->update($validated);

            return $message;
        });

        $message->load('user:id,name,role');

        return $this->success(new TicketMessageResource($message), 'Ticket message updated successfully.');
    }

    /**
     * Delete a recent message owned by the authenticated user.
     */
    public function destroy(TicketMessage $message): JsonResponse
    {
        if (Gate::denies('delete', $message)) {
            return $this->error('You can only delete your own messages within 15 minutes of creation.', [], 403);
        }

        DB::transaction(fn () => $message->delete());

        return $this->success(null, 'Ticket message deleted successfully.');
    }
}
