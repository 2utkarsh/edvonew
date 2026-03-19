<?php

use App\Http\Controllers\Api\AlumniApiController;
use App\Http\Controllers\Api\AuthApiController;
use App\Http\Controllers\Api\CoursesApiController;
use App\Http\Controllers\Api\JobsApiController;
use App\Models\ContactMessage;
use App\Models\Subscribe;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('subscribes', function (Request $request) {
    $data = $request->validate([
        'email' => ['required', 'email', 'max:190', 'unique:subscribes,email', 'unique:users,email'],
    ]);

    $subscribe = Subscribe::create($data);

    return response()->json([
        'message' => 'Subscribed successfully',
        'data' => $subscribe,
    ], 201);
});

Route::post('contact-messages', function (Request $request) {
    $data = $request->validate([
        'name' => ['required', 'string', 'max:120'],
        'email' => ['required', 'email', 'max:190'],
        'phone' => ['nullable', 'string', 'max:40'],
        'subject' => ['nullable', 'string', 'max:190'],
        'message' => ['required', 'string', 'max:5000'],
    ]);

    $message = ContactMessage::create([
        ...$data,
        'ip' => $request->ip(),
        'user_agent' => (string) $request->userAgent(),
    ]);

    return response()->json([
        'message' => 'Message saved',
        'data' => $message,
    ], 201);
});

// Courses (public)
Route::get('courses', [CoursesApiController::class, 'index']);
Route::get('courses/{id}', [CoursesApiController::class, 'show']);

// Jobs (public)
Route::get('jobs', [JobsApiController::class, 'index']);

// Auth (public)
Route::post('auth/register', [AuthApiController::class, 'register']);
Route::post('auth/login', [AuthApiController::class, 'login']);

// Auth (protected)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('auth/logout', [AuthApiController::class, 'logout']);
    Route::get('auth/me', [AuthApiController::class, 'me']);
});

// Alumni (public)
Route::get('alumni/achievements', [AlumniApiController::class, 'achievements']);
Route::get('alumni/stats', [AlumniApiController::class, 'stats']);

