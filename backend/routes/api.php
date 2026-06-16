<?php

use App\Http\Controllers\TicketController;
use App\Http\Controllers\KbArticleController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ForumController;

Route::get('/knowledge-base', [KbArticleController::class, 'index']);
Route::get('/knowledge-base/search', [KbArticleController::class, 'search']);
Route::get('/knowledge-base/{slug}', [KbArticleController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/tickets', [TicketController::class, 'store']);
    Route::get('/tickets', [TicketController::class, 'index']);
    Route::get('/tickets/{id}', [TicketController::class, 'show']);

    Route::post('/knowledge-base', [KbArticleController::class, 'store']);
    Route::put('/knowledge-base/{id}', [KbArticleController::class, 'update']);
    Route::delete('/knowledge-base/{id}', [KbArticleController::class, 'destroy']);
    Route::post('/knowledge-base/{id}/feedback', [KbArticleController::class, 'feedback']);
});



Route::middleware('auth:sanctum')->group(function () {
    // Questions
    Route::get('/forum/questions', [ForumController::class, 'questions']);
    Route::post('/forum/questions', [ForumController::class, 'storeQuestion']);
    Route::get('/forum/questions/{id}', [ForumController::class, 'showQuestion']);
    Route::put('/forum/questions/{id}', [ForumController::class, 'updateQuestion']);
    Route::delete('/forum/questions/{id}', [ForumController::class, 'deleteQuestion']);
    Route::post('/forum/questions/{id}/vote', [ForumController::class, 'voteQuestion']);

    // Answers
    Route::post('/forum/questions/{questionId}/answers', [ForumController::class, 'storeAnswer']);
    Route::put('/forum/answers/{id}', [ForumController::class, 'updateAnswer']);
    Route::delete('/forum/answers/{id}', [ForumController::class, 'deleteAnswer']);
    Route::post('/forum/answers/{id}/vote', [ForumController::class, 'voteAnswer']);
    Route::post('/forum/answers/{id}/accept', [ForumController::class, 'acceptAnswer']);
});
