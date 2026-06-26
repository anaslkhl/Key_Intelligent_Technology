<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AIChatControllerTest extends TestCase
{
    use DatabaseTransactions;

    public function test_authenticated_user_can_chat_with_ai_agent(): void
    {
        config(['services.ai_agent.base_url' => 'http://ai-agent.test']);
        Http::fake([
            'ai-agent.test/ask' => Http::response([
                'success' => true,
                'response' => 'Here is the answer.',
            ]),
        ]);
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/ai/chat', [
            'prompt' => 'How do I calibrate OMNIE?',
        ])
            ->assertOk()
            ->assertJsonPath('status', 200)
            ->assertJsonPath('data.response', 'Here is the answer.');

        Http::assertSent(fn ($request) => $request->url() === 'http://ai-agent.test/ask'
            && $request['prompt'] === 'How do I calibrate OMNIE?');
    }

    public function test_prompt_is_required(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/ai/chat', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('prompt');
    }

    public function test_ai_agent_connection_failure_returns_service_unavailable(): void
    {
        config(['services.ai_agent.base_url' => 'http://ai-agent.test']);
        Http::fake(fn () => throw new ConnectionException('Connection refused'));
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/ai/chat', [
            'prompt' => 'Hello',
        ])
            ->assertStatus(503)
            ->assertJsonPath('message', 'The AI assistant is currently unavailable.');
    }
}
