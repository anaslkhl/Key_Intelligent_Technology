<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAnswerRequest;
use App\Http\Requests\StoreQuestionRequest;
use App\Http\Requests\UpdateAnswerRequest;
use App\Http\Requests\UpdateQuestionRequest;
use App\Http\Requests\VoteRequest;
use App\Http\Resources\AnswerResource;
use App\Http\Resources\QuestionResource;
use App\Models\ForumAnswer;
use App\Models\ForumQuestion;
use App\Services\AnswerService;
use App\Services\QuestionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use RuntimeException;

class ForumController extends Controller
{
    public function __construct(
        private readonly QuestionService $questions,
        private readonly AnswerService $answers,
    ) {
    }

    public function questions(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'tag' => ['nullable', 'string', 'max:50'],
            'solved' => ['nullable', 'boolean'],
        ]);

        $query = ForumQuestion::query()
            ->with('user:id,name')
            ->withCount('answers')
            ->when($validated['tag'] ?? null, fn ($query, string $tag) => $query->whereJsonContains('tags', $tag))
            ->when(array_key_exists('solved', $validated), fn ($query) => $query->where('is_solved', $validated['solved']))
            ->latest();

        return $this->paginated(
            $query->paginate($request->integer('per_page', 15)),
            QuestionResource::class,
            'Questions retrieved successfully.',
        );
    }

    public function storeQuestion(StoreQuestionRequest $request): JsonResponse
    {
        $question = $this->questions->create($request->user(), $request->validated())
            ->load('user:id,name')
            ->loadCount('answers');

        return $this->success(new QuestionResource($question), 'Question created successfully.', 201);
    }

    public function showQuestion(string $id): JsonResponse
    {
        $question = ForumQuestion::query()
            ->with(['user:id,name', 'answers.user:id,name'])
            ->withCount('answers')
            ->findOrFail($id);

        return $this->success(new QuestionResource($question), 'Question retrieved successfully.');
    }

    public function updateQuestion(UpdateQuestionRequest $request, string $id): JsonResponse
    {
        $question = ForumQuestion::query()->findOrFail($id);

        if (Gate::denies('update', $question)) {
            return $this->error('Only the question author can update this question.', [], 403);
        }

        $question = $this->questions->update($question, $request->validated())
            ->load('user:id,name')
            ->loadCount('answers');

        return $this->success(new QuestionResource($question), 'Question updated successfully.');
    }

    public function deleteQuestion(string $id): JsonResponse
    {
        $question = ForumQuestion::query()->findOrFail($id);

        if (Gate::denies('delete', $question)) {
            return $this->error('Only the question author or an admin can delete this question.', [], 403);
        }

        $question->delete();

        return $this->success(null, 'Question deleted successfully.');
    }

    public function voteQuestion(VoteRequest $request, string $id): JsonResponse
    {
        $question = ForumQuestion::query()->findOrFail($id);

        try {
            $question = $this->questions->toggleVote($question, $request->user(), $request->validated()['vote'])
                ->load('user:id,name')
                ->loadCount('answers');
        } catch (RuntimeException $exception) {
            return $this->error($exception->getMessage(), ['vote' => [$exception->getMessage()]]);
        }

        return $this->success(new QuestionResource($question), 'Vote recorded successfully.');
    }

    public function storeAnswer(StoreAnswerRequest $request, string $questionId): JsonResponse
    {
        $question = ForumQuestion::query()->findOrFail($questionId);
        $answer = $this->answers->create($question, $request->user(), $request->validated())->load('user:id,name');

        return $this->success(new AnswerResource($answer), 'Answer created successfully.', 201);
    }

    public function updateAnswer(UpdateAnswerRequest $request, string $id): JsonResponse
    {
        $answer = ForumAnswer::query()->with('question')->findOrFail($id);

        if (Gate::denies('update', $answer)) {
            return $this->error('Only the answer author can update this answer.', [], 403);
        }

        $answer = $this->answers->update($answer, $request->validated())->load('user:id,name');

        return $this->success(new AnswerResource($answer), 'Answer updated successfully.');
    }

    public function deleteAnswer(string $id): JsonResponse
    {
        $answer = ForumAnswer::query()->with('question')->findOrFail($id);

        if (Gate::denies('delete', $answer)) {
            return $this->error('Only the answer author or an admin can delete this answer.', [], 403);
        }

        $answer->delete();

        return $this->success(null, 'Answer deleted successfully.');
    }

    public function voteAnswer(VoteRequest $request, string $id): JsonResponse
    {
        $answer = ForumAnswer::query()->findOrFail($id);

        try {
            $answer = $this->answers->toggleVote($answer, $request->user(), $request->validated()['vote'])
                ->load('user:id,name');
        } catch (RuntimeException $exception) {
            return $this->error($exception->getMessage(), ['vote' => [$exception->getMessage()]]);
        }

        return $this->success(new AnswerResource($answer), 'Vote recorded successfully.');
    }

    public function acceptAnswer(string $id): JsonResponse
    {
        $answer = ForumAnswer::query()->with(['question', 'user:id,name'])->findOrFail($id);

        if (Gate::denies('accept', $answer)) {
            return $this->error('Only the question author can accept an answer.', [], 403);
        }

        $answer = $this->answers->acceptAnswer($answer)->load('user:id,name');

        return $this->success(new AnswerResource($answer), 'Answer accepted successfully.');
    }
}
