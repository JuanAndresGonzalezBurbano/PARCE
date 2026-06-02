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

// CORS must run first to handle preflight requests
$router->middleware([
    \App\Middleware\CORSMiddleware::class,
    \App\Middleware\RequestLoggerMiddleware::class
]);

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
$router->get('/api/auth/health', [\App\Controllers\Auth\AuthController::class, 'health'])
    ->name('api.auth.health');

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
// Vehicle API Routes (Protected)
// ============================================================================

$router->get('/api/vehicles', [\App\Controllers\VehicleController::class, 'index'])
    ->middleware([\App\Middleware\AuthMiddleware::class])
    ->name('api.vehicles.index');

$router->post('/api/vehicles', [\App\Controllers\VehicleController::class, 'store'])
    ->middleware([\App\Middleware\AuthMiddleware::class])
    ->name('api.vehicles.store');

$router->get('/api/vehicles/{id}', [\App\Controllers\VehicleController::class, 'show'])
    ->middleware([\App\Middleware\AuthMiddleware::class])
    ->name('api.vehicles.show');

$router->put('/api/vehicles/{id}', [\App\Controllers\VehicleController::class, 'update'])
    ->middleware([\App\Middleware\AuthMiddleware::class])
    ->name('api.vehicles.update');

$router->delete('/api/vehicles/{id}', [\App\Controllers\VehicleController::class, 'destroy'])
    ->middleware([\App\Middleware\AuthMiddleware::class])
    ->name('api.vehicles.destroy');

$router->put('/api/vehicles/{id}/primary', [\App\Controllers\VehicleController::class, 'setPrimary'])
    ->middleware([\App\Middleware\AuthMiddleware::class])
    ->name('api.vehicles.setPrimary');

// ============================================================================
// Service Request API Routes (Protected)
// ============================================================================

// Customer endpoints
$router->get('/api/service-requests', [\App\Controllers\ServiceRequestController::class, 'index'])
    ->middleware([\App\Middleware\AuthMiddleware::class])
    ->name('api.service-requests.index');

$router->post('/api/service-requests', [\App\Controllers\ServiceRequestController::class, 'store'])
    ->middleware([\App\Middleware\AuthMiddleware::class])
    ->name('api.service-requests.store');

$router->get('/api/service-requests/{id}', [\App\Controllers\ServiceRequestController::class, 'show'])
    ->middleware([\App\Middleware\AuthMiddleware::class])
    ->name('api.service-requests.show');

$router->put('/api/service-requests/{id}', [\App\Controllers\ServiceRequestController::class, 'update'])
    ->middleware([\App\Middleware\AuthMiddleware::class])
    ->name('api.service-requests.update');

$router->post('/api/service-requests/{id}/cancel', [\App\Controllers\ServiceRequestController::class, 'cancel'])
    ->middleware([\App\Middleware\AuthMiddleware::class])
    ->name('api.service-requests.cancel');

$router->post('/api/service-requests/{id}/rate', [\App\Controllers\ServiceRequestController::class, 'rate'])
    ->middleware([\App\Middleware\AuthMiddleware::class])
    ->name('api.service-requests.rate');

// Mechanic endpoints
$router->get('/api/mechanic/requests', [\App\Controllers\ServiceRequestController::class, 'mechanicIndex'])
    ->middleware([\App\Middleware\AuthMiddleware::class])
    ->name('api.mechanic.requests.index');

$router->get('/api/mechanic/requests/available', [\App\Controllers\ServiceRequestController::class, 'availableForMechanic'])
    ->middleware([\App\Middleware\AuthMiddleware::class])
    ->name('api.mechanic.requests.available');

$router->post('/api/mechanic/requests/{id}/accept', [\App\Controllers\ServiceRequestController::class, 'accept'])
    ->middleware([\App\Middleware\AuthMiddleware::class])
    ->name('api.mechanic.requests.accept');

$router->put('/api/mechanic/requests/{id}/start', [\App\Controllers\ServiceRequestController::class, 'start'])
    ->middleware([\App\Middleware\AuthMiddleware::class])
    ->name('api.mechanic.requests.start');

$router->put('/api/mechanic/requests/{id}/complete', [\App\Controllers\ServiceRequestController::class, 'complete'])
    ->middleware([\App\Middleware\AuthMiddleware::class])
    ->name('api.mechanic.requests.complete');

// ============================================================================
// Future Routes (to be implemented)
// ============================================================================

// Admin routes will be added here
// - GET /api/admin/dashboard
// - GET /api/admin/users
