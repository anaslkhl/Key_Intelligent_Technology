<?php

namespace App\Http\Controllers;

use App\Http\Resources\AdminTicketResource;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AgentController extends Controller
{
    public function stats(): JsonResponse
    {
        $counts = Ticket::query()
            ->selectRaw('COUNT(*) as total')
            ->selectRaw("COUNT(*) FILTER (WHERE status IN ('new', 'open', 'waiting_client')) as open")
            ->selectRaw("COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress")
            ->selectRaw("COUNT(*) FILTER (WHERE status IN ('resolved', 'closed')) as resolved")
            ->first();

        $priorities = Ticket::query()
            ->selectRaw('priority, COUNT(*) as count')
            ->groupBy('priority')
            ->pluck('count', 'priority');

        $recent = Ticket::query()
            ->with(['user:id,name,email', 'robot:id,name,product_id', 'assignee:id,name,email'])
            ->latest()
            ->limit(6)
            ->get();

        return $this->success([
            'total_tickets' => (int) $counts->total,
            'open_tickets' => (int) $counts->open,
            'in_progress_tickets' => (int) $counts->in_progress,
            'resolved_tickets' => (int) $counts->resolved,
            'priority_breakdown' => [
                'critical' => (int) ($priorities['critical'] ?? $priorities['urgent'] ?? 0),
                'high' => (int) ($priorities['high'] ?? 0),
                'medium' => (int) ($priorities['medium'] ?? 0),
                'low' => (int) ($priorities['low'] ?? 0),
            ],
            'recent_tickets' => AdminTicketResource::collection($recent),
        ], 'Agent dashboard statistics retrieved successfully.');
    }

    public function tickets(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['nullable', Rule::in(['new', 'open', 'in_progress', 'waiting_client', 'resolved', 'closed'])],
            'priority' => ['nullable', Rule::in(['low', 'medium', 'high', 'urgent', 'critical'])],
            'category_id' => ['nullable', 'uuid', 'exists:ticket_categories,id'],
            'assigned_to' => ['nullable', 'uuid', 'exists:users,id'],
            'search' => ['nullable', 'string', 'max:255'],
        ]);

        $priority = $validated['priority'] ?? null;

        $tickets = Ticket::query()
            ->with(['user:id,name,email', 'robot.product.family', 'category:id,name', 'assignee:id,name,email'])
            ->when($validated['status'] ?? null, fn (Builder $query, string $status) => $query->where('status', $status))
            ->when($priority, fn (Builder $query) => $priority === 'critical'
                ? $query->whereIn('priority', ['critical', 'urgent'])
                : $query->where('priority', $priority)
            )
            ->when($validated['category_id'] ?? null, fn (Builder $query, string $categoryId) => $query->where('category_id', $categoryId))
            ->when($validated['assigned_to'] ?? null, fn (Builder $query, string $agentId) => $query->where('assigned_to', $agentId))
            ->when($validated['search'] ?? null, fn (Builder $query, string $search) => $query->where(function (Builder $searchQuery) use ($search) {
                $searchQuery
                    ->where('title', 'ILIKE', "%{$search}%")
                    ->orWhere('description', 'ILIKE', "%{$search}%");
            }))
            ->latest()
            ->paginate($this->perPage());

        return $this->paginated($tickets, AdminTicketResource::class, 'Agent tickets retrieved successfully.');
    }

    public function ticket(string $id): JsonResponse
    {
        $ticket = Ticket::query()
            ->with([
                'user:id,name,email,company_name',
                'robot.product.family',
                'category',
                'assignee:id,name,email',
                'messages' => fn ($query) => $query->oldest(),
                'messages.user:id,name,email,role',
            ])
            ->findOrFail($id);

        return $this->success([
            ...((new AdminTicketResource($ticket))->resolve()),
            'description' => $ticket->description,
            'category' => $ticket->category,
            'csat_rating' => $ticket->csat_rating,
            'messages' => $ticket->messages,
        ], 'Agent ticket detail retrieved successfully.');
    }

    public function updateTicket(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['sometimes', Rule::in(['new', 'open', 'in_progress', 'waiting_client', 'resolved', 'closed'])],
            'assigned_to' => [
                'sometimes',
                'nullable',
                'uuid',
                Rule::exists('users', 'id')->where(fn ($query) => $query->whereIn('role', ['agent', 'admin'])->where('is_active', true)),
            ],
        ]);

        $ticket = Ticket::query()->findOrFail($id);
        $ticket->update($validated);
        $ticket->load(['user:id,name,email', 'robot.product.family', 'assignee:id,name,email']);

        return $this->success(new AdminTicketResource($ticket), 'Ticket updated successfully.');
    }

    public function staff(): JsonResponse
    {
        $staff = User::query()
            ->whereIn('role', ['agent', 'admin'])
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'role']);

        return $this->success($staff, 'Support staff retrieved successfully.');
    }
}
