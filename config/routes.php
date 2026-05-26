<?php

/**
 * Route Definitions
 * 
 * Define all application routes here.
 * Routes are registered with the router instance.
 */

$router = $app->getRouter();

// ============================================================================
// Global Middleware (runs on every request)
// ============================================================================

$router->middleware([\App\Middleware\RequestLoggerMiddleware::class]);

// ============================================================================
// Public Routes (No Authentication Required)
// ============================================================================

$router->get('/', function($request) {
    return (new \App\Core\Response())->html('
        <!DOCTYPE html>
        <html>
        <head>
            <title>P.A.R.C.E - Home</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body>
            <h1>Welcome to P.A.R.C.E</h1>
            <p>Plataforma de Asistencia Rápida para Conductores en Emergencia</p>
            <p>Backend infrastructure is ready!</p>
        </body>
        </html>
    ');
})->name('home');

// API Health Check
$router->get('/api/health', [\App\Controllers\HealthController::class, 'index'])->name('api.health');

// Database Health Check
$router->get('/api/health/database', [\App\Controllers\HealthController::class, 'database'])->name('api.health.database');

// System Health Check
$router->get('/api/health/system', [\App\Controllers\HealthController::class, 'system'])->name('api.health.system');

// ============================================================================
// Example Routes (for testing)
// ============================================================================

// Example: Route with parameters
$router->get('/user/{id}', function($request, $id) {
    return \App\Core\Response::success([
        'user_id' => $id,
        'message' => 'User route working with parameter'
    ]);
})->name('user.show');

// Example: POST route
$router->post('/api/test', function($request) {
    $data = $request->all();
    return \App\Core\Response::success($data, 'Data received successfully');
})->name('api.test');

// ============================================================================
// Route Groups (for future middleware)
// ============================================================================

// API Routes Group
$router->group(['prefix' => 'api/v1'], function($router) {
    
    $router->get('/status', function($request) {
        return \App\Core\Response::success([
            'api_version' => 'v1',
            'status' => 'operational'
        ]);
    });
    
});

// ============================================================================
// Future Routes (to be implemented)
// ============================================================================

// ============================================================================
// Authentication API Routes
// ============================================================================

// Public authentication routes
$router->post('/api/auth/register', [\App\Controllers\Auth\AuthController::class, 'register'])
    ->name('api.auth.register');

$router->post('/api/auth/login', [\App\Controllers\Auth\AuthController::class, 'login'])
    ->name('api.auth.login');

// Protected authentication routes (require AuthMiddleware)
$router->post('/api/auth/logout', [\App\Controllers\Auth\AuthController::class, 'logout'])
    ->middleware([\App\Middleware\AuthMiddleware::class])
    ->name('api.auth.logout');

$router->get('/api/auth/me', [\App\Controllers\Auth\AuthController::class, 'me'])
    ->middleware([\App\Middleware\AuthMiddleware::class])
    ->name('api.auth.me');

// ============================================================================
// Future Routes (to be implemented)
// ============================================================================

// Authentication routes will be added here
// - POST /auth/login
// - POST /auth/logout
// - POST /auth/register
// - POST /auth/forgot-password
// - POST /auth/reset-password

// Customer routes will be added here
// - GET /services/request
// - POST /services/request
// - GET /services/my-services

// Mechanic routes will be added here
// - GET /mechanic/services
// - POST /mechanic/services/{id}/accept

// Admin routes will be added here
// - GET /admin/dashboard
// - GET /admin/users
