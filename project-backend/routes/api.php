<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\DashboardController;

// Public Routes (មិនបាច់ Login ក៏អាចចូលបាន)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected Routes (ទាល់តែ Login មាន Token ទើបអាចចូលប្រើបានដោយឆ្លងកាត់ Sanctum Middleware)
Route::middleware('auth:sanctum')->group(function(){

    Route::get('/dashboard/stats', [DashboardController::class, 'index']);
        // Auth Routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

        // Project CRUD Routes
    Route::apiResource('projects', ProjectController::class);

        // Task Nested CRUD Routes (Tasks ស្ថិតក្រោម Projects នីមួយៗ)
    Route::apiResource('projects.tasks', TaskController::class);

        // Manager & Admin routes (សម្រាប់ Features បន្ទាប់ដូចជា Teams / Project Collaboration)
    Route::middleware('role:manager, admin')->group(function (){

    });

        // Admin-only routes (សម្រាប់ Feature 2: Admin Dashboard & User Management)
    Route::middleware('role:admin')->prefix('admin')->group(function (){
        
    }); 
});
