<?php

use App\Http\Controllers\TicketController;
use App\Http\Controllers\KbArticleController;
use Illuminate\Support\Facades\Route;

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

