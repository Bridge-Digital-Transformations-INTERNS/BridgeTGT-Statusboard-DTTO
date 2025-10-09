<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\DeveloperController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\DeveloperRoleController;
use App\Http\Controllers\TaskAssigneeController;
use App\Http\Controllers\ChangeLogController;
use App\Http\Middleware\SessionAuth;
use Illuminate\Support\Facades\Route;

// Dashboard route - single-request initial data loading
Route::get('/dashboard/initial', [DashboardController::class, 'getInitialData'])->middleware(SessionAuth::class);

// Auth routes
Route::prefix('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/sessions', [AuthController::class, 'getActiveSessions']);
    Route::post('/validate-session', [AuthController::class, 'validateSession']);
    Route::post('/company-key', [AuthController::class, 'loginWithCompanyKey']);
    Route::get('/github', [AuthController::class, 'githubRedirect']);
    Route::get('/github/callback', [AuthController::class, 'githubCallback']);
    Route::get('/github/exchange', [AuthController::class, 'githubExchange']);
});

// Projects routes
Route::prefix('projects')->group(function () {
    Route::get('/', [ProjectController::class, 'index']);
    Route::get('/{id}', [ProjectController::class, 'show']);
    Route::post('/', [ProjectController::class, 'store'])->middleware(SessionAuth::class);
    Route::put('/{id}', [ProjectController::class, 'update'])->middleware(SessionAuth::class);
    Route::delete('/{id}', [ProjectController::class, 'destroy'])->middleware(SessionAuth::class);
});

// Developers routes
Route::prefix('developers')->group(function () {
    Route::get('/', [DeveloperController::class, 'index']);
    Route::get('/{id}', [DeveloperController::class, 'show']);
    Route::post('/', [DeveloperController::class, 'store'])->middleware(SessionAuth::class);
    Route::put('/{id}', [DeveloperController::class, 'update'])->middleware(SessionAuth::class);
    Route::delete('/{id}', [DeveloperController::class, 'destroy'])->middleware(SessionAuth::class);
});

// Roles routes
Route::prefix('roles')->group(function () {
    Route::get('/', [RoleController::class, 'index']);
    Route::get('/{id}', [RoleController::class, 'show']);
    Route::post('/', [RoleController::class, 'store'])->middleware(SessionAuth::class);
    Route::put('/{id}', [RoleController::class, 'update'])->middleware(SessionAuth::class);
    Route::delete('/{id}', [RoleController::class, 'destroy'])->middleware(SessionAuth::class);
});

// Tasks routes
Route::prefix('tasks')->group(function () {
    // Specific routes MUST come before parameterized routes
    Route::get('/with-assignees', [TaskController::class, 'getAllWithAssignees'])->middleware(SessionAuth::class);
    Route::get('/gantt/all', [TaskController::class, 'getAllWithAssignees'])->middleware(SessionAuth::class);
    Route::get('/gantt/structured/{projectId}', [TaskController::class, 'getStructuredGanttData'])->middleware(SessionAuth::class);
    Route::get('/gantt/project/{projectId}', [TaskController::class, 'getWithAssigneesByProject'])->middleware(SessionAuth::class);
    Route::get('/project/{projectId}/with-assignees', [TaskController::class, 'getWithAssigneesByProject'])->middleware(SessionAuth::class);
    Route::get('/project/{projectId}', [TaskController::class, 'getByProject']);
    
    // CRUD operations - specific routes first
    Route::put('/bulk', [TaskController::class, 'bulkUpdate'])->middleware(SessionAuth::class);
    Route::post('/', [TaskController::class, 'store'])->middleware(SessionAuth::class);
    Route::put('/{id}/timeline', [TaskController::class, 'updateTimeline'])->middleware(SessionAuth::class);
    Route::put('/{id}', [TaskController::class, 'update'])->middleware(SessionAuth::class);
    Route::delete('/{id}', [TaskController::class, 'destroy'])->middleware(SessionAuth::class);
    
    // Generic routes MUST come last
    Route::get('/{id}', [TaskController::class, 'show']);
    Route::get('/', [TaskController::class, 'index']);
});

// Developer Roles routes
Route::prefix('developer-roles')->group(function () {
    Route::get('/', [DeveloperRoleController::class, 'index']);
    Route::get('/{developerId}', [DeveloperRoleController::class, 'getDeveloperRoles']);
    Route::post('/', [DeveloperRoleController::class, 'store'])->middleware(SessionAuth::class);
    Route::delete('/{id}', [DeveloperRoleController::class, 'destroy'])->middleware(SessionAuth::class);
});

// Task Assignees routes
Route::prefix('task-assignees')->group(function () {
    Route::get('/', [TaskAssigneeController::class, 'index']);
    Route::get('/{taskId}', [TaskAssigneeController::class, 'getTaskAssignees']);
    Route::post('/', [TaskAssigneeController::class, 'store'])->middleware(SessionAuth::class);
    Route::delete('/{id}', [TaskAssigneeController::class, 'destroy'])->middleware(SessionAuth::class);
});

// Change Logs routes
Route::prefix('change-logs')->group(function () {
    Route::get('/', [ChangeLogController::class, 'index']);
    Route::get('/{id}', [ChangeLogController::class, 'show']);
});
