<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\FeatureRequestController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\KbArticleController;
use App\Http\Controllers\ReviewController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ForumController;
use App\Http\Controllers\RobotController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);





Route::get('/knowledge-base', [KbArticleController::class, 'index']);
Route::get('/knowledge-base/search', [KbArticleController::class, 'search']);
Route::get('/knowledge-base/{slug}', [KbArticleController::class, 'show']);
Route::get('/reviews', [ReviewController::class, 'index']);
Route::get('/reviews/{id}', [ReviewController::class, 'show'])->whereUuid('id');
Route::get('/feature-requests', [FeatureRequestController::class, 'index']);
Route::get('/feature-requests/{id}', [FeatureRequestController::class, 'show'])->whereUuid('id');

Route::middleware('auth:sanctum')->group(function () {
    
    Route::get('/robots', [RobotController::class, 'index']);
    Route::post('/robots', [RobotController::class, 'store']);
    Route::get('/robots/{id}', [RobotController::class, 'show']);

    Route::post('/tickets', [TicketController::class, 'store']);
    Route::get('/tickets', [TicketController::class, 'index']);
    Route::get('/tickets/{id}', [TicketController::class, 'show']);

    Route::post('/knowledge-base', [KbArticleController::class, 'store']);
    Route::put('/knowledge-base/{id}', [KbArticleController::class, 'update']);
    Route::delete('/knowledge-base/{id}', [KbArticleController::class, 'destroy']);
    Route::post('/knowledge-base/{id}/feedback', [KbArticleController::class, 'feedback']);

    Route::get('/reviews/my', [ReviewController::class, 'myReviews']);
    Route::post('/reviews', [ReviewController::class, 'store']);
    Route::patch('/reviews/{id}/approve', [ReviewController::class, 'approve']);

    Route::post('/feature-requests', [FeatureRequestController::class, 'store']);
    Route::post('/feature-requests/{id}/vote', [FeatureRequestController::class, 'vote']);
    Route::patch('/feature-requests/{id}/status', [FeatureRequestController::class, 'updateStatus']);
});




Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/refresh', [AuthController::class, 'refresh']);
    Route::get('/forum/questions', [ForumController::class, 'questions']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);
    // Questions
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
