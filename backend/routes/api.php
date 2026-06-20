<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\AgentController;
use App\Http\Controllers\FeatureRequestController;
use App\Http\Controllers\ForumController;
use App\Http\Controllers\KbArticleController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProductFamilyController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\RobotController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\TicketMessageController;
use App\Http\Controllers\UploadController;
use Illuminate\Support\Facades\Route;

Route::middleware('throttle:5,5')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
});

Route::get('/knowledge-base', [KbArticleController::class, 'index']);
Route::get('/knowledge-base/search', [KbArticleController::class, 'search']);
Route::get('/knowledge-base/{slug}', [KbArticleController::class, 'show']);

Route::get('/reviews', [ReviewController::class, 'index']);
Route::get('/reviews/{id}', [ReviewController::class, 'show'])->whereUuid('id');

Route::get('/feature-requests', [FeatureRequestController::class, 'index']);
Route::get('/feature-requests/{id}', [FeatureRequestController::class, 'show'])->whereUuid('id');

Route::get('/forum/questions', [ForumController::class, 'questions']);
Route::get('/forum/questions/{id}', [ForumController::class, 'showQuestion'])->whereUuid('id');
Route::get('/families', [ProductFamilyController::class, 'index']);

Route::middleware(['auth:sanctum', 'active', 'throttle:60,1'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/refresh', [AuthController::class, 'refresh']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);
    Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])
        ->middleware(['signed', 'throttle:6,1'])
        ->name('verification.verify');
    Route::post('/email/verification-notification', [AuthController::class, 'resendEmailVerification'])
        ->middleware('throttle:6,1')
        ->name('verification.send');

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::patch('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->whereUuid('id');
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy'])->whereUuid('id');

    Route::post('/upload', [UploadController::class, 'upload'])->middleware('throttle:10,1');
    Route::post('/uploads', [UploadController::class, 'uploadMultiple'])->middleware('throttle:5,1');
    Route::get('/uploads/{id}', [UploadController::class, 'show'])->whereUuid('id');
    Route::delete('/uploads/{id}', [UploadController::class, 'destroy'])->whereUuid('id');

    Route::get('/robots', [RobotController::class, 'index']);
    Route::post('/robots', [RobotController::class, 'store']);
    Route::get('/robots/{id}', [RobotController::class, 'show'])->whereUuid('id');

    Route::get('/tickets', [TicketController::class, 'index']);
    Route::post('/tickets', [TicketController::class, 'store']);
    Route::get('/tickets/{id}', [TicketController::class, 'show'])->whereUuid('id');
    Route::patch('/tickets/{id}/close', [TicketController::class, 'close'])->whereUuid('id');
    Route::get('/tickets/{ticket}/messages', [TicketMessageController::class, 'index'])->whereUuid('ticket');
    Route::post('/tickets/{ticket}/messages', [TicketMessageController::class, 'store'])->whereUuid('ticket');
    Route::put('/messages/{message}', [TicketMessageController::class, 'update'])->whereUuid('message');
    Route::delete('/messages/{message}', [TicketMessageController::class, 'destroy'])->whereUuid('message');

    Route::post('/knowledge-base', [KbArticleController::class, 'store']);
    Route::put('/knowledge-base/{id}', [KbArticleController::class, 'update'])->whereUuid('id');
    Route::delete('/knowledge-base/{id}', [KbArticleController::class, 'destroy'])->whereUuid('id');
    Route::post('/knowledge-base/{id}/feedback', [KbArticleController::class, 'feedback'])->whereUuid('id');

    Route::get('/reviews/my', [ReviewController::class, 'myReviews']);
    Route::post('/reviews', [ReviewController::class, 'store']);
    Route::patch('/reviews/{id}/approve', [ReviewController::class, 'approve'])->whereUuid('id');

    Route::post('/feature-requests', [FeatureRequestController::class, 'store']);
    Route::post('/feature-requests/{id}/vote', [FeatureRequestController::class, 'vote'])->whereUuid('id');
    Route::patch('/feature-requests/{id}/status', [FeatureRequestController::class, 'updateStatus'])->whereUuid('id');

    Route::post('/forum/questions', [ForumController::class, 'storeQuestion']);
    Route::put('/forum/questions/{id}', [ForumController::class, 'updateQuestion'])->whereUuid('id');
    Route::delete('/forum/questions/{id}', [ForumController::class, 'deleteQuestion'])->whereUuid('id');
    Route::post('/forum/questions/{id}/vote', [ForumController::class, 'voteQuestion'])->whereUuid('id');
    Route::post('/forum/questions/{questionId}/answers', [ForumController::class, 'storeAnswer'])->whereUuid('questionId');
    Route::put('/forum/answers/{id}', [ForumController::class, 'updateAnswer'])->whereUuid('id');
    Route::delete('/forum/answers/{id}', [ForumController::class, 'deleteAnswer'])->whereUuid('id');
    Route::post('/forum/answers/{id}/vote', [ForumController::class, 'voteAnswer'])->whereUuid('id');
    Route::post('/forum/answers/{id}/accept', [ForumController::class, 'acceptAnswer'])->whereUuid('id');
});

Route::middleware(['auth:sanctum', 'active', 'admin', 'throttle:60,1'])
    ->prefix('admin')
    ->group(function () {
        Route::get('/stats', [AdminController::class, 'getStats']);
        Route::get('/users', [AdminController::class, 'getUsers']);
        Route::patch('/users/{id}/role', [AdminController::class, 'updateUserRole'])->whereUuid('id');
        Route::patch('/users/{id}/status', [AdminController::class, 'toggleUserStatus'])->whereUuid('id');
        Route::get('/tickets', [AdminController::class, 'getTickets']);
        Route::get('/tickets/{id}', [AdminController::class, 'getTicketDetail'])->whereUuid('id');
        Route::get('/analytics', [AdminController::class, 'getAnalytics']);
        Route::get('/export/users', [AdminController::class, 'exportUsers']);
        Route::get('/export/tickets', [AdminController::class, 'exportTickets']);
    });

Route::middleware(['auth:sanctum', 'active', 'role:agent,admin', 'throttle:60,1'])
    ->group(function () {
        Route::prefix('agent')->group(function () {
            Route::get('/stats', [AgentController::class, 'stats']);
            Route::get('/staff', [AgentController::class, 'staff']);
            Route::get('/tickets', [AgentController::class, 'tickets']);
            Route::get('/tickets/{id}', [AgentController::class, 'ticket'])->whereUuid('id');
            Route::patch('/tickets/{id}', [AgentController::class, 'updateTicket'])->whereUuid('id');
        });

        Route::get('/kb-articles', [KbArticleController::class, 'manageIndex']);
        Route::get('/kb-articles/{id}', [KbArticleController::class, 'manageShow'])->whereUuid('id');
        Route::post('/kb-articles', [KbArticleController::class, 'store']);
        Route::put('/kb-articles/{id}', [KbArticleController::class, 'update'])->whereUuid('id');
        Route::delete('/kb-articles/{id}', [KbArticleController::class, 'destroy'])->whereUuid('id');
    });

