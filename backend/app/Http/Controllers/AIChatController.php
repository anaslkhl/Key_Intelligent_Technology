<?php

namespace App\Http\Controllers;

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

        try {
            $response = Http::timeout($timeout)
                ->acceptJson()
                ->asJson()
                ->post("{$baseUrl}/ask", [
                    'prompt' => $validated['prompt'],
                ])
                ->throw();

            $payload = $response->json();

            if (! is_array($payload) || ($payload['success'] ?? false) !== true || ! isset($payload['response'])) {
                Log::warning('AI agent returned an unexpected response.', [
                    'user_id' => $request->user()?->id,
                    'status' => $response->status(),
                    'payload' => $payload,
                ]);

                return $this->error('The AI assistant returned an invalid response.', [], 502);
            }

            Log::info('AI chat request completed.', [
                'user_id' => $request->user()?->id,
                'prompt_length' => mb_strlen($validated['prompt']),
            ]);

            return $this->success([
                'response' => (string) $payload['response'],
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
}
