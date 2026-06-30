<?php

namespace App\Http\Controllers;

use App\Models\UserActivityLog;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AIChatController extends Controller
{
    public function chat(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'prompt' => ['required', 'string', 'min:1', 'max:5000'],
        ], [
            'prompt.required' => 'Please enter a message for the AI assistant.',
            'prompt.max' => 'Messages may not be longer than 5,000 characters.',
        ]);

        $baseUrl = rtrim((string) config('services.ai_agent.base_url'), '/');
        $timeout = (int) config('services.ai_agent.timeout', 30);
        $startedAt = microtime(true);

        try {
            $response = Http::timeout($timeout)
                ->acceptJson()
                ->asJson()
                ->post("{$baseUrl}/ask", [
                    'prompt' => $validated['prompt'],
                ])
                ->throw();

            $payload = $response->json();
            $responseTime = (int) round((microtime(true) - $startedAt) * 1000);

            if (! is_array($payload) || ! isset($payload['success'])) {
                Log::warning('AI agent returned an unexpected response.', [
                    'user_id' => $request->user()?->id,
                    'status' => $response->status(),
                    'payload' => $payload,
                ]);

                return $this->error('The AI assistant returned an invalid response.', [], 502);
            }

            $this->logAIChat($request, $validated['prompt'], $payload, $responseTime);

            if ($payload['success'] === false) {
                return $this->error($payload['response'] ?? 'The AI assistant could not process this message.', [], 502);
            }

            if (isset($payload['type']) && $payload['type'] === 'navigation') {
                return $this->success([
                    'type' => 'navigation',
                    'page' => $payload['page'] ?? null,
                    'response' => $payload['response'] ?? 'Navigating...',
                ], 'AI response generated successfully.');
            }

            if (isset($payload['type']) && $payload['type'] === 'text') {
                return $this->success([
                    'type' => 'text',
                    'response' => $payload['response'] ?? 'No response.',
                ], 'AI response generated successfully.');
            }

            return $this->success([
                'type' => 'text',
                'response' => $payload['response'] ?? 'No response.',
                'sources' => $payload['sources'] ?? [],
                'context_used' => $payload['context_used'] ?? false,
            ], 'AI response generated successfully.');

        } catch (ConnectionException $exception) {
            Log::error('AI agent connection failed.', [
                'user_id' => $request->user()?->id,
                'base_url' => $baseUrl,
                'error' => $exception->getMessage(),
            ]);

            return $this->error('The AI assistant is currently unavailable.', [], 503);
        } catch (RequestException $exception) {
            Log::error('AI agent request failed.', [
                'user_id' => $request->user()?->id,
                'status' => $exception->response?->status(),
                'error' => $exception->getMessage(),
            ]);

            return $this->error('The AI assistant could not process this message.', [], 502);
        }
    }

    private function logAIChat(Request $request, string $prompt, array $payload, int $responseTime): void
    {
        try {
            UserActivityLog::query()->create([
                'user_id' => $request->user()?->id,
                'action' => 'ai_chat_message',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'details' => [
                    'message' => $prompt,
                    'response' => $payload['response'] ?? null,
                    'intent' => $payload['intent'] ?? $payload['type'] ?? 'text',
                    'response_time' => $responseTime,
                    'model' => $payload['model'] ?? data_get($payload, 'metadata.model', 'kit-ai-agent'),
                ],
                'created_at' => now(),
            ]);
        } catch (\Throwable $exception) {
            Log::warning('Unable to log AI chat activity.', [
                'user_id' => $request->user()?->id,
                'error' => $exception->getMessage(),
            ]);
        }
    }
}
