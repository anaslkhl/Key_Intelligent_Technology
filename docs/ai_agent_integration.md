# AI Agent Integration

## 1. Overview

The **AI Agent** is a dedicated microservice that provides intelligent conversational capabilities to the KIT Support Hub. It acts as a bridge between the Laravel application and the Groq LLM API, processing user prompts and returning natural-language responses.

**Purpose:** Enable users to ask questions about robots, troubleshooting steps, documents, calculations, web searches, and more — directly from the support hub interface.

**How it helps users:**
- Reduces time spent searching knowledge base articles
- Provides instant answers to common support questions
- Offers troubleshooting guidance without opening a ticket
- Accessible from any authenticated session via the `/ai-chat` page

---

## 2. Architecture

The integration follows a three-tier architecture:

```
┌─────────────┐     HTTP      ┌──────────────┐     HTTP      ┌───────────┐
│  Frontend   │ ───────────▶ │   Laravel    │ ───────────▶ │ AI Agent  │
│ (React SPA) │ ◀─────────── │  (API)       │ ◀─────────── │ (Flask)   │
└─────────────┘     JSON      └──────────────┘     JSON      └─────┬─────┘
                                                                   │
                                                                   ▼
                                                              ┌───────────┐
                                                              │ Groq API  │
                                                              │   (LLM)   │
                                                              └───────────┘
```

### Flow

1. The user submits a message from the React frontend (`/ai-chat` page).
2. The frontend sends a `POST /api/ai/chat` request with the prompt to the Laravel API.
3. Laravel validates the request, then forwards it to the AI Agent at `/ask`.
4. The AI Agent processes the prompt via the Groq API and returns a response.
5. Laravel validates the agent's response and returns it to the frontend.
6. The frontend displays the AI response in the chat interface.

### Components Involved

| Component | Role |
|---|---|
| **React SPA** (frontend) | User interface for the chat |
| **Laravel API** (backend) | Authentication, rate limiting, proxying |
| **AI Agent** (Flask microservice) | Prompt processing, Groq API integration |
| **Groq API** (external) | LLM inference |

---

## 3. Configuration

### Environment Variables

The AI Agent integration is configured via environment variables in `backend/.env`:

| Variable | Default | Description |
|---|---|---|
| `AI_AGENT_BASE_URL` | `http://localhost:5000` | URL of the running AI Agent service |
| `AI_AGENT_TIMEOUT` | `30` | HTTP request timeout in seconds |

### Example

```ini
AI_AGENT_BASE_URL=http://first-ai-agent--project_api_1:5000
AI_AGENT_TIMEOUT=30
```

### Where to Configure

These values are read in `backend/config/services.php`:

```php
'ai_agent' => [
    'base_url' => env('AI_AGENT_BASE_URL', 'http://localhost:5000'),
    'timeout'  => env('AI_AGENT_TIMEOUT', 30),
],
```

Access them at runtime via:

```php
config('services.ai_agent.base_url');
config('services.ai_agent.timeout');
```

---

## 4. API Integration

### Endpoint

```
POST /api/ai/chat
Content-Type: application/json
Accept: application/json
```

### Authentication

- **Middleware:** `auth:sanctum`
- A valid Sanctum token must be provided in the `Authorization: Bearer <token>` header.
- Only authenticated users may access this endpoint.

### Rate Limiting

- **Limit:** 10 requests per minute
- **Middleware:** `throttle:10,1`
- Exceeding the limit returns a `429 Too Many Requests` response.

### Request

```json
{
  "prompt": "How do I calibrate OMNIE?"
}
```

| Field | Type | Constraints |
|---|---|---|
| `prompt` | string | Required, 1–5000 characters |

### Response (200 OK)

```json
{
  "data": {
    "response": "To calibrate OMNIE, first ensure the robot is on a flat surface..."
  },
  "message": "AI response generated successfully.",
  "status": 200
}
```

### Error Responses

| Status | Condition |
|---|---|
| `422` | Validation failure (e.g., missing or empty prompt) |
| `502` | AI Agent returned an invalid or unexpected response |
| `503` | AI Agent is unreachable (connection refused/timeout) |
| `429` | Rate limit exceeded |

---

## 5. Code Structure

### Backend

| File | Purpose |
|---|---|
| `backend/app/Http/Controllers/AIChatController.php` | Controller that receives the chat request, forwards it to the AI Agent, and returns the response |
| `backend/routes/api.php` | Defines `POST /api/ai/chat` with `auth:sanctum` and `throttle:10,1` middleware |
| `backend/config/services.php` | Holds the `ai_agent` configuration array (base URL, timeout) |
| `backend/tests/Feature/AIChatControllerTest.php` | Feature tests for the AI chat endpoint |

### Frontend

| File | Purpose |
|---|---|
| `frontend/src/pages/AIChat.jsx` | Full-page chat UI component with message history, input form, and loading states |
| `frontend/src/api/ai.js` | API client function `sendMessage(prompt)` that calls `POST /ai/chat` |
| `frontend/src/router.jsx` | Registers the `/ai-chat` protected route |
| `frontend/src/components/common/Header.jsx` | Navigation link to `/ai-chat` |
| `frontend/src/components/common/Sidebar.jsx` | Sidebar link to `/ai-chat` for agent/admin roles |

### Key Controller Logic (`AIChatController.php`)

```php
$response = Http::timeout($timeout)
    ->acceptJson()
    ->asJson()
    ->post("{$baseUrl}/ask", ['prompt' => $validated['prompt']])
    ->throw();
```

The controller:
1. Validates the incoming prompt.
2. Sends it to the AI Agent's `/ask` endpoint.
3. Checks that the response contains `success: true` and a `response` field.
4. Returns the AI response or an appropriate error.

---

## 6. How It Works

### Step-by-Step Flow

1. **User sends a message** — The user types a prompt in the chat input on `/ai-chat` and presses Enter (or clicks Send).

2. **Frontend calls the API** — `src/api/ai.js` sends an authenticated POST request to `/api/ai/chat` with the prompt payload.

3. **Laravel validates** — `AIChatController::chat()` validates the prompt (required, max 5000 chars) and checks the user is authenticated via Sanctum.

4. **Laravel forwards to AI Agent** — The controller sends the prompt to the AI Agent's `POST /ask` endpoint with a configurable timeout.

5. **AI Agent processes with Groq** — The AI Agent (Flask microservice) receives the prompt, calls the Groq API, and returns a JSON response with the LLM's answer.

6. **Laravel validates the agent response** — The controller verifies the agent returned `{"success": true, "response": "..."}`. If not, it logs a warning and returns a 502 error.

7. **Response returned to user** — The AI response is returned to the frontend, where it is appended to the chat message list.

### Error Handling

- If the AI Agent is unreachable (`ConnectionException`), a 503 error is returned: *"The AI assistant is currently unavailable."*
- If the AI Agent returns a non-2xx status (`RequestException`), a 502 error is returned: *"The AI assistant could not process this message."*
- If the AI Agent response structure is invalid, a 502 error is returned: *"The AI assistant returned an invalid response."*
- All errors are logged with user ID and context for debugging.

---

## 7. AI Agent Dependencies

### Prerequisites

The AI Agent microservice must be **running and accessible** for the chat integration to work.

### Container Details

| Property | Value |
|---|---|
| Container name | `first-ai-agent--project_api_1` |
| Internal port | `5000` |
| Docker network | `key_intelligent_technology_app-network` |

### Network Connectivity

The Laravel container and the AI Agent container must be connected to the same Docker network. The active `.env` points to:

```
AI_AGENT_BASE_URL=http://first-ai-agent--project_api_1:5000
```

This uses Docker's internal DNS resolution so the Laravel container can reach the AI Agent by container name.

### Starting the AI Agent

```bash
# Verify the AI Agent container is running
docker ps | grep first-ai-agent

# If not running, start it from its project directory
docker compose up -d
```

> **Note:** The AI Agent is defined in a separate Docker Compose project (named `first-ai-agent`), not in the main `docker-compose.yml` of this repository.

---

## 8. Troubleshooting

### AI Agent Not Running

**Symptom:** 503 error — "The AI assistant is currently unavailable."

**Solution:**
```bash
docker ps | grep first-ai-agent
```
If the container is not listed, start it:
```bash
cd /path/to/first-ai-agent && docker compose up -d
```

### Connection Refused

**Symptom:** 503 error, or logs showing `ConnectionException`.

**Solution:** Verify `AI_AGENT_BASE_URL` is correct in `backend/.env`:
```bash
# Check current value
grep AI_AGENT_BASE_URL backend/.env

# Expected for Docker: http://first-ai-agent--project_api_1:5000
# Expected for local dev: http://localhost:5000
```

Also verify the AI Agent container is listening on port 5000:
```bash
docker inspect first-ai-agent--project_api_1 | grep -A 5 PortBindings
```

### Timeout

**Symptom:** Slow responses followed by a 503 error.

**Solution:** Check network connectivity between containers:
```bash
docker exec laravel_app curl -s -o /dev/null -w "%{http_code}" http://first-ai-agent--project_api_1:5000/health
```
If this fails, ensure both containers share the same Docker network (`key_intelligent_technology_app-network`).

Increase the timeout if the AI Agent takes longer than 30 seconds:
```ini
AI_AGENT_TIMEOUT=60
```

### Invalid Response

**Symptom:** 502 error — "The AI assistant returned an invalid response."

**Solution:** Check the Laravel logs for the full agent payload:
```bash
tail -f backend/storage/logs/laravel.log | grep "unexpected response"
```
This indicates the AI Agent returned a malformed response. Verify the AI Agent's Groq API key is valid and the agent service is functioning correctly.

### Common Errors

| Error | Likely Cause | Solution |
|---|---|---|
| `ConnectionException` | AI Agent not running or wrong URL | Check `docker ps` and `AI_AGENT_BASE_URL` |
| `RequestException` with 4xx/5xx | AI Agent returned an error | Check AI Agent logs |
| `cURL error 28: Connection timed out` | Network isolation or timeout | Check Docker network, increase `AI_AGENT_TIMEOUT` |
| `419 unknown status` | Sanctum token missing/expired | Re-authenticate |

---

## 9. Testing

### Automated Tests

The integration is covered by `backend/tests/Feature/AIChatControllerTest.php` (3 tests):

| Test | Description |
|---|---|
| `test_authenticated_user_can_chat_with_ai_agent` | Sends a valid prompt and verifies the AI response is returned correctly |
| `test_prompt_is_required` | Sends an empty request and asserts a 422 validation error |
| `test_ai_agent_connection_failure_returns_service_unavailable` | Simulates a connection failure and asserts a 503 response |

Run the tests:

```bash
cd backend && php artisan test --filter=AIChatControllerTest
```

Or with Pest (if configured):

```bash
cd backend && ./vendor/bin/pest --filter=AIChatControllerTest
```

### Manual Testing

1. Start the Laravel development server and the AI Agent.
2. Navigate to `/ai-chat` in the browser.
3. Authenticate (login or register).
4. Type a message in the chat input and press Enter.
5. Verify the AI responds within a few seconds.
6. Test error handling by stopping the AI Agent and sending another message — expect a 503 error toast.

### Testing with cURL

```bash
# Authenticate first
TOKEN=$(curl -s -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' \
  | jq -r '.data.token')

# Send a chat message
curl -s -X POST http://localhost:8000/api/ai/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"How do I calibrate OMNIE?"}' | jq
```

---

## 10. Future Improvements

### Streaming Responses

Currently, the AI response is returned as a single JSON payload. Streaming (server-sent events or WebSockets) would allow the frontend to display the AI response token-by-token as it is generated, improving perceived responsiveness.

- **Frontend:** Use `EventSource` or `fetch` with `ReadableStream` instead of Axios.
- **Backend:** Return a streaming response from the AI Agent's endpoint rather than buffering the full response.

### Conversation Memory

The current implementation treats each message independently. Adding conversation history would enable context-aware follow-up questions.

- **Approach:** Append prior messages to each prompt sent to the AI Agent.
- **Storage:** Keep conversation history in-memory (session) or persist to the database.
- **Frontend:** Already maintains a local `messages` array — this could be sent to the backend with each request.

### User Context

Passing user metadata (role, company, associated robots) to the AI Agent would enable context-aware answers:

```json
{
  "prompt": "How do I fix error 503?",
  "context": {
    "user_id": 42,
    "role": "customer",
    "company": "Acme Robotics",
    "robots": ["OMNIE", "KIT-K9"]
  }
}
```

This requires extending the AI Agent's `/ask` endpoint to accept and utilize a `context` object.
