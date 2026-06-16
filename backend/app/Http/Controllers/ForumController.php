<?php

namespace App\Http\Controllers;

use App\Models\ForumQuestion;
use App\Models\ForumAnswer;
use Illuminate\Http\Request;

class ForumController extends Controller
{
    // === QUESTIONS ===

    public function questions(Request $request)
    {
        $query = ForumQuestion::with('user')->withCount('answers');

        if ($request->tag) {
            $query->whereJsonContains('tags', $request->tag);
        }

        if ($request->solved !== null) {
            $query->where('is_solved', $request->solved);
        }

        return response()->json($query->latest()->paginate(15));
    }

    public function storeQuestion(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'tags' => 'nullable|array|max:5',
        ]);

        $question = ForumQuestion::create([
            'user_id' => auth()->id(),
            'title' => $data['title'],
            'content' => $data['content'],
            'tags' => $data['tags'] ?? [],
        ]);

        return response()->json($question->load('user'), 201);
    }

    public function showQuestion($id)
    {
        $question = ForumQuestion::with('user', 'answers.user')->findOrFail($id);
        $question->loadCount('answers');
        return response()->json($question);
    }

    public function updateQuestion(Request $request, $id)
    {
        $question = ForumQuestion::findOrFail($id);

        if ($question->user_id !== auth()->id() && auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $data = $request->validate([
            'title' => 'sometimes|string|max:255',
            'content' => 'sometimes|string',
            'tags' => 'nullable|array|max:5',
        ]);

        $question->update($data);
        return response()->json($question);
    }

    public function deleteQuestion($id)
    {
        $question = ForumQuestion::findOrFail($id);

        if ($question->user_id !== auth()->id() && auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $question->delete();
        return response()->json(['message' => 'Question deleted']);
    }

    // === ANSWERS ===

    public function storeAnswer(Request $request, $questionId)
    {
        $data = $request->validate([
            'content' => 'required|string',
        ]);

        $question = ForumQuestion::findOrFail($questionId);

        $answer = $question->answers()->create([
            'user_id' => auth()->id(),
            'content' => $data['content'],
        ]);

        return response()->json($answer->load('user'), 201);
    }

    public function updateAnswer(Request $request, $id)
    {
        $answer = ForumAnswer::findOrFail($id);

        if ($answer->user_id !== auth()->id() && auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $data = $request->validate([
            'content' => 'sometimes|string',
        ]);

        $answer->update($data);
        return response()->json($answer);
    }

    public function deleteAnswer($id)
    {
        $answer = ForumAnswer::findOrFail($id);

        if ($answer->user_id !== auth()->id() && auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $answer->delete();
        return response()->json(['message' => 'Answer deleted']);
    }

    public function acceptAnswer($id)
    {
        $answer = ForumAnswer::findOrFail($id);
        $question = $answer->question;

        // Only question author can accept
        if ($question->user_id !== auth()->id()) {
            return response()->json(['message' => 'Only the question author can accept answers'], 403);
        }

        // Remove previous accepted
        $question->answers()->where('is_accepted', true)->update(['is_accepted' => false]);

        // Accept this answer
        $answer->update(['is_accepted' => true]);
        $question->update(['is_solved' => true]);

        return response()->json(['message' => 'Answer accepted']);
    }

    // === VOTES ===

    public function voteQuestion(Request $request, $id)
    {
        $data = $request->validate(['vote' => 'required|in:up,down']);
        $question = ForumQuestion::findOrFail($id);

        return $this->toggleVote($question, $data['vote']);
    }

    public function voteAnswer(Request $request, $id)
    {
        $data = $request->validate(['vote' => 'required|in:up,down']);
        $answer = ForumAnswer::findOrFail($id);

        return $this->toggleVote($answer, $data['vote']);
    }

    private function toggleVote($model, $voteType)
    {
        $user = auth()->user();
        $existing = $model->votes()->where('user_id', $user->id)->first();

        if ($existing) {
            if ($existing->vote_type === $voteType) {
                $existing->delete();
                $message = 'Vote removed';
            } else {
                $existing->update(['vote_type' => $voteType]);
                $message = 'Vote updated';
            }
        } else {
            $model->votes()->create([
                'user_id' => $user->id,
                'vote_type' => $voteType,
            ]);
            $message = 'Vote added';
        }

        $upvotes = $model->votes()->where('vote_type', 'up')->count();
        $downvotes = $model->votes()->where('vote_type', 'down')->count();

        return response()->json([
            'message' => $message,
            'upvotes' => $upvotes,
            'downvotes' => $downvotes,
        ]);
    }
}