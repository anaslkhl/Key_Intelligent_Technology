<?php

namespace App\Http\Controllers;

use App\Http\Requests\AdminTicketFilterRequest;
use App\Http\Requests\ToggleUserStatusRequest;
use App\Http\Requests\UpdateUserRoleRequest;
use App\Http\Resources\AdminStatsResource;
use App\Http\Resources\AdminTicketResource;
use App\Http\Resources\AdminUserResource;
use App\Models\KbArticle;
use App\Models\Review;
use App\Models\Robot;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminController extends Controller
{
    /**
     * Return dashboard counters for the admin overview.
     */
    public function getStats(): JsonResponse
    {
        $this->authorizeAdminDashboard();

        $stats = [
            'total_users' => User::query()->count(),
            'total_tickets' => Ticket::query()->count(),
            'total_robots' => Robot::query()->count(),
            'total_articles' => KbArticle::query()->count(),
            'total_reviews' => Review::query()->count(),
            'pending_reviews' => Review::query()->where('is_approved', false)->count(),
            'open_tickets' => Ticket::query()->whereIn('status', ['new', 'open', 'in_progress', 'waiting_client'])->count(),
            'csat_average' => round((float) Ticket::query()->whereNotNull('csat_rating')->avg('csat_rating'), 2),
        ];

        return $this->success(new AdminStatsResource($stats), 'Admin dashboard statistics retrieved successfully.');
    }

    /**
     * List users with role/search filters and pagination.
     */
    public function getUsers(Request $request): JsonResponse
    {
        $this->authorizeAdminDashboard();

        $validated = $request->validate([
            'role' => ['nullable', 'in:client,agent,admin'],
            'search' => ['nullable', 'string', 'max:255'],
        ]);

        $users = User::query()
            ->withCount(['tickets', 'robots'])
            ->when($validated['role'] ?? null, fn (Builder $query, string $role) => $query->where('role', $role))
            ->when($validated['search'] ?? null, function (Builder $query, string $search): void {
                $query->where(function (Builder $query) use ($search): void {
                    $query->where('name', 'ilike', "%{$search}%")
                        ->orWhere('email', 'ilike', "%{$search}%")
                        ->orWhere('company_name', 'ilike', "%{$search}%");
                });
            })
            ->latest()
            ->paginate($this->perPage());

        return $this->paginated($users, AdminUserResource::class, 'Users retrieved successfully.');
    }

    /**
     * Change a user's role.
     */
    public function updateUserRole(UpdateUserRoleRequest $request, string $id): JsonResponse
    {
        $this->authorizeAdminDashboard();

        $user = User::query()->findOrFail($id);
        $user->update(['role' => $request->validated()['role']]);
        $user->loadCount(['tickets', 'robots']);

        return $this->success(new AdminUserResource($user), 'User role updated successfully.');
    }

    /**
     * Block or unblock a user account.
     */
    public function toggleUserStatus(ToggleUserStatusRequest $request, string $id): JsonResponse
    {
        $this->authorizeAdminDashboard();

        $user = User::query()->findOrFail($id);
        $user->update(['is_active' => $request->boolean('is_active')]);
        $user->loadCount(['tickets', 'robots']);

        return $this->success(new AdminUserResource($user), 'User status updated successfully.');
    }

    /**
     * List all tickets with admin filters.
     */
    public function getTickets(AdminTicketFilterRequest $request): JsonResponse
    {
        $this->authorizeAdminDashboard();
        $validated = $request->validated();

        $tickets = Ticket::query()
            ->with(['user:id,name,email', 'robot.product.family', 'assignee:id,name,email'])
            ->when($validated['status'] ?? null, fn (Builder $query, string $status) => $query->where('status', $status))
            ->when($validated['priority'] ?? null, fn (Builder $query, string $priority) => $query->where('priority', $priority))
            ->when($validated['family_id'] ?? null, fn (Builder $query, string $familyId) => $query
                ->whereHas('robot.product', fn (Builder $query) => $query->where('family_id', $familyId)))
            ->latest()
            ->paginate($this->perPage());

        return $this->paginated($tickets, AdminTicketResource::class, 'Tickets retrieved successfully.');
    }

    /**
     * View any ticket and its conversation.
     */
    public function getTicketDetail(string $id): JsonResponse
    {
        $this->authorizeAdminDashboard();

        $ticket = Ticket::query()
            ->with([
                'user:id,name,email',
                'robot.product.family',
                'category',
                'assignee:id,name,email',
                'messages.user:id,name,email,role',
            ])
            ->findOrFail($id);

        return $this->success([
            ...((new AdminTicketResource($ticket))->resolve()),
            'description' => $ticket->description,
            'category' => $ticket->category,
            'csat_rating' => $ticket->csat_rating,
            'messages' => $ticket->messages,
        ], 'Ticket detail retrieved successfully.');
    }

    /**
     * Return chart-friendly admin analytics.
     */
    public function getAnalytics(): JsonResponse
    {
        $this->authorizeAdminDashboard();

        $ticketVolume = Ticket::query()
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->where('created_at', '>=', now()->subDays(30)->startOfDay())
            ->groupByRaw('DATE(created_at)')
            ->orderBy('date')
            ->get();

        $ticketsByStatus = Ticket::query()
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->orderBy('status')
            ->get();

        $popularKb = KbArticle::query()
            ->select(['id', 'title', 'slug', 'views'])
            ->orderByDesc('views')
            ->limit(5)
            ->get();

        return $this->success([
            'ticket_volume' => $ticketVolume,
            'csat_average' => round((float) Ticket::query()->whereNotNull('csat_rating')->avg('csat_rating'), 2),
            'popular_kb' => $popularKb,
            'tickets_by_status' => $ticketsByStatus,
        ], 'Analytics retrieved successfully.');
    }

    /**
     * Export users as CSV.
     */
    public function exportUsers(): StreamedResponse
    {
        $this->authorizeAdminDashboard();

        return response()->streamDownload(function (): void {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['name', 'email', 'role', 'is_active', 'created_at']);

            User::query()
                ->orderBy('created_at')
                ->chunk(500, function ($users) use ($handle): void {
                    foreach ($users as $user) {
                        fputcsv($handle, [
                            $this->csvCell($user->name),
                            $this->csvCell($user->email),
                            $this->csvCell($user->role),
                            $user->is_active ? 'true' : 'false',
                            $this->csvCell((string) $user->created_at),
                        ]);
                    }
                });

            fclose($handle);
        }, 'users.csv', ['Content-Type' => 'text/csv']);
    }

    /**
     * Export tickets as CSV.
     */
    public function exportTickets(): StreamedResponse
    {
        $this->authorizeAdminDashboard();

        return response()->streamDownload(function (): void {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['title', 'status', 'priority', 'user', 'robot', 'created_at', 'csat_rating']);

            Ticket::query()
                ->with(['user:id,name', 'robot:id,name'])
                ->orderBy('created_at')
                ->chunk(500, function ($tickets) use ($handle): void {
                    foreach ($tickets as $ticket) {
                        fputcsv($handle, [
                            $this->csvCell($ticket->title),
                            $this->csvCell($ticket->status),
                            $this->csvCell($ticket->priority),
                            $this->csvCell($ticket->user?->name),
                            $this->csvCell($ticket->robot?->name),
                            $this->csvCell((string) $ticket->created_at),
                            $ticket->csat_rating,
                        ]);
                    }
                });

            fclose($handle);
        }, 'tickets.csv', ['Content-Type' => 'text/csv']);
    }

    /**
     * Enforce the admin dashboard policy.
     */
    private function authorizeAdminDashboard(): void
    {
        Gate::authorize('viewAdminDashboard');
    }

    private function csvCell(mixed $value): string
    {
        $value = (string) $value;

        return preg_match('/^[=+\-@\t\r]/', $value) === 1 ? "'{$value}" : $value;
    }
}
