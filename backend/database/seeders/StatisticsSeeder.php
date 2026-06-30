<?php

namespace Database\Seeders;

use App\Models\PageView;
use App\Models\User;
use App\Models\UserActivityLog;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class StatisticsSeeder extends Seeder
{
    private const PATHS = [
        'api/login', 'api/register', 'api/tickets', 'api/knowledge-base',
        'api/knowledge-base/search', 'api/forum/questions', 'api/reviews',
        'api/feature-requests', 'api/ai/chat', 'api/me', 'api/robots',
        'api/dashboard', 'api/notifications', 'api/error-codes',
        'api/admin/stats', 'api/admin/users', 'api/admin/tickets',
    ];

    private const USER_AGENTS = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/17.2',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/119.0.0.0',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',
        'PostmanRuntime/7.36.0',
    ];

    private const ACTIVITY_ACTIONS = [
        'login', 'logout', 'register', 'ticket_created', 'ticket_viewed',
        'kb_article_viewed', 'forum_post_created', 'ai_chat_message',
        'profile_updated', 'password_changed',
    ];

    public function run(): void
    {
        $userIds = User::query()->pluck('id')->toArray();
        $usersById = User::query()->pluck('name', 'id')->toArray();

        $this->seedPageViews($userIds);
        $this->seedActivityLogs($userIds, $usersById);
    }

    private function seedPageViews(array $userIds): void
    {
        $now = now();
        $batch = [];
        $count = 0;

        for ($day = 30; $day >= 0; $day--) {
            $viewsToday = random_int(1, 3);
            $sessionIds = [];
            for ($s = 0; $s < random_int(1, 2); $s++) {
                $sessionIds[] = (string) Str::uuid();
            }
            for ($i = 0; $i < $viewsToday; $i++) {
                $batch[] = [
                    'id' => (string) Str::uuid(),
                    'user_id' => random_int(0, 3) === 0 ? null : ($userIds ? $userIds[array_rand($userIds)] : null),
                    'path' => self::PATHS[array_rand(self::PATHS)],
                    'method' => 'GET',
                    'ip_address' => long2ip(random_int(0, 1 << 24) + random_int(0, (1 << 24) - 1)),
                    'user_agent' => self::USER_AGENTS[array_rand(self::USER_AGENTS)],
                    'session_id' => $sessionIds[array_rand($sessionIds)],
                    'referer' => random_int(0, 1) === 0 ? null : 'https://kitrobotics.com/knowledge-base',
                    'response_time' => random_int(50, 2000),
                    'status_code' => random_int(0, 10) === 0 ? 500 : (random_int(0, 5) === 0 ? 404 : 200),
                    'created_at' => $now->copy()->subDays($day)->subMinutes(random_int(0, 1439)),
                ];
                $count++;

                if ($count % 50 === 0) {
                    PageView::query()->insert($batch);
                    $batch = [];
                }
            }
        }

        if ($batch) {
            PageView::query()->insert($batch);
        }
    }

    private function seedActivityLogs(array $userIds, array $usersById): void
    {
        $now = now();
        $batch = [];
        $count = 0;

        for ($day = 30; $day >= 0; $day--) {
            $logsToday = random_int(1, 3);
            for ($i = 0; $i < $logsToday; $i++) {
                $action = self::ACTIVITY_ACTIONS[array_rand(self::ACTIVITY_ACTIONS)];
                $userId = $userIds ? $userIds[array_rand($userIds)] : null;

                $details = match ($action) {
                    'ai_chat_message' => [
                        'model' => 'gpt-4',
                        'tokens' => random_int(50, 500),
                        'response_time' => random_int(200, 5000),
                    ],
                    'ticket_created' => [
                        'priority' => ['low', 'medium', 'high', 'urgent'][array_rand(['low', 'medium', 'high', 'urgent'])],
                    ],
                    'kb_article_viewed' => [
                        'article_id' => (string) Str::uuid(),
                        'slug' => 'how-to-configure-robot',
                    ],
                    'password_changed' => [
                        'via' => 'profile',
                    ],
                    default => null,
                };

                $batch[] = [
                    'id' => (string) Str::uuid(),
                    'user_id' => $userId,
                    'action' => $action,
                    'ip_address' => long2ip(random_int(0, 1 << 24) + random_int(0, (1 << 24) - 1)),
                    'user_agent' => self::USER_AGENTS[array_rand(self::USER_AGENTS)],
                    'details' => $details ? json_encode($details) : null,
                    'created_at' => $now->copy()->subDays($day)->subMinutes(random_int(0, 1439)),
                ];
                $count++;

                if ($count % 50 === 0) {
                    UserActivityLog::query()->insert($batch);
                    $batch = [];
                }
            }
        }

        if ($batch) {
            UserActivityLog::query()->insert($batch);
        }
    }
}
