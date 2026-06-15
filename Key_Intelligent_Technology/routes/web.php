<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome');
});

Route::get('/health', function () {
    return response()->json([
        'status' => 'healthy',
        'app' => 'Key Intelligent Technology',
        'version' => '1.0.0'
    ]);
});