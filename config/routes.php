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
    \App\Middleware\SecurityHeadersMiddleware::class,
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

$router->put('/api/auth/profile', [\App\Controllers\Auth\AuthController::class, 'profile'])
    ->middleware([\App\Middleware\AuthMiddleware::class])
    ->name('api.auth.profile');

$router->put('/api/auth/password', [\App\Controllers\Auth\AuthController::class, 'changePassword'])
    ->middleware([\App\Middleware\AuthMiddleware::class])
    ->name('api.auth.password');

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

// Customer endpoints (RBAC: customer only)
$router->get('/api/service-requests', [\App\Controllers\ServiceRequestController::class, 'index'])
    ->middleware([
        \App\Middleware\AuthMiddleware::class,
        [\App\Middleware\RBACMiddleware::class, ['customer']]
    ])
    ->name('api.service-requests.index');

$router->post('/api/service-requests', [\App\Controllers\ServiceRequestController::class, 'store'])
    ->middleware([
        \App\Middleware\AuthMiddleware::class,
        [\App\Middleware\RBACMiddleware::class, ['customer']]
    ])
    ->name('api.service-requests.store');

$router->get('/api/service-requests/{id}', [\App\Controllers\ServiceRequestController::class, 'show'])
    ->middleware([
        \App\Middleware\AuthMiddleware::class,
        [\App\Middleware\RBACMiddleware::class, ['customer']]
    ])
    ->name('api.service-requests.show');

$router->put('/api/service-requests/{id}', [\App\Controllers\ServiceRequestController::class, 'update'])
    ->middleware([
        \App\Middleware\AuthMiddleware::class,
        [\App\Middleware\RBACMiddleware::class, ['customer']]
    ])
    ->name('api.service-requests.update');

$router->post('/api/service-requests/{id}/cancel', [\App\Controllers\ServiceRequestController::class, 'cancel'])
    ->middleware([
        \App\Middleware\AuthMiddleware::class,
        [\App\Middleware\RBACMiddleware::class, ['customer']]
    ])
    ->name('api.service-requests.cancel');

$router->post('/api/service-requests/{id}/rate', [\App\Controllers\ServiceRequestController::class, 'rate'])
    ->middleware([
        \App\Middleware\AuthMiddleware::class,
        [\App\Middleware\RBACMiddleware::class, ['customer']]
    ])
    ->name('api.service-requests.rate');

$router->get('/api/service-requests/{id}/evidences', [\App\Controllers\ServiceRequestController::class, 'getEvidences'])
    ->middleware([
        \App\Middleware\AuthMiddleware::class,
        [\App\Middleware\RBACMiddleware::class, ['customer']]
    ])
    ->name('api.service-requests.evidences');

// Mechanic endpoints (RBAC: mechanic only)
$router->get('/api/mechanic/requests', [\App\Controllers\ServiceRequestController::class, 'mechanicIndex'])
    ->middleware([
        \App\Middleware\AuthMiddleware::class,
        [\App\Middleware\RBACMiddleware::class, ['mechanic']]
    ])
    ->name('api.mechanic.requests.index');

$router->get('/api/mechanic/requests/available', [\App\Controllers\ServiceRequestController::class, 'availableForMechanic'])
    ->middleware([
        \App\Middleware\AuthMiddleware::class,
        [\App\Middleware\RBACMiddleware::class, ['mechanic']]
    ])
    ->name('api.mechanic.requests.available');

// IMPORTANTE: debe registrarse después de '/available' — el router hace matching
// por orden de registro y '{id}' capturaría "available" como si fuera un ID.
$router->get('/api/mechanic/requests/{id}', [\App\Controllers\ServiceRequestController::class, 'show'])
    ->middleware([
        \App\Middleware\AuthMiddleware::class,
        [\App\Middleware\RBACMiddleware::class, ['mechanic']]
    ])
    ->name('api.mechanic.requests.show');

$router->post('/api/mechanic/requests/{id}/accept', [\App\Controllers\ServiceRequestController::class, 'accept'])
    ->middleware([
        \App\Middleware\AuthMiddleware::class,
        [\App\Middleware\RBACMiddleware::class, ['mechanic']]
    ])
    ->name('api.mechanic.requests.accept');

$router->put('/api/mechanic/requests/{id}/start', [\App\Controllers\ServiceRequestController::class, 'start'])
    ->middleware([
        \App\Middleware\AuthMiddleware::class,
        [\App\Middleware\RBACMiddleware::class, ['mechanic']]
    ])
    ->name('api.mechanic.requests.start');

$router->put('/api/mechanic/requests/{id}/complete', [\App\Controllers\ServiceRequestController::class, 'complete'])
    ->middleware([
        \App\Middleware\AuthMiddleware::class,
        [\App\Middleware\RBACMiddleware::class, ['mechanic']]
    ])
    ->name('api.mechanic.requests.complete');

$router->post('/api/mechanic/requests/{id}/evidence', [\App\Controllers\ServiceRequestController::class, 'addEvidence'])
    ->middleware([
        \App\Middleware\AuthMiddleware::class,
        [\App\Middleware\RBACMiddleware::class, ['mechanic']]
    ])
    ->name('api.mechanic.requests.addEvidence');

$router->get('/api/mechanic/requests/{id}/evidences', [\App\Controllers\ServiceRequestController::class, 'getEvidences'])
    ->middleware([
        \App\Middleware\AuthMiddleware::class,
        [\App\Middleware\RBACMiddleware::class, ['mechanic']]
    ])
    ->name('api.mechanic.requests.evidences');

$router->get('/api/mechanic/stats', [\App\Controllers\ServiceRequestController::class, 'mechanicStats'])
    ->middleware([
        \App\Middleware\AuthMiddleware::class,
        [\App\Middleware\RBACMiddleware::class, ['mechanic']]
    ])
    ->name('api.mechanic.stats');

// ============================================================================
// PQR API Routes (Protected) - PARCE-DEMO sustentación module
// ============================================================================

// Customer & mechanic endpoints (RBAC: customer or mechanic)
$router->get('/api/pqr', [\App\Controllers\PQRController::class, 'index'])
    ->middleware([
        \App\Middleware\AuthMiddleware::class,
        [\App\Middleware\RBACMiddleware::class, ['customer', 'mechanic']]
    ])
    ->name('api.pqr.index');

$router->post('/api/pqr', [\App\Controllers\PQRController::class, 'store'])
    ->middleware([
        \App\Middleware\AuthMiddleware::class,
        [\App\Middleware\RBACMiddleware::class, ['customer', 'mechanic']]
    ])
    ->name('api.pqr.store');

$router->get('/api/pqr/{id}', [\App\Controllers\PQRController::class, 'show'])
    ->middleware([
        \App\Middleware\AuthMiddleware::class,
        [\App\Middleware\RBACMiddleware::class, ['customer', 'mechanic']]
    ])
    ->name('api.pqr.show');

// Admin endpoints (RBAC: administrator, super_admin)
$router->get('/api/admin/pqr', [\App\Controllers\PQRController::class, 'adminIndex'])
    ->middleware([
        \App\Middleware\AuthMiddleware::class,
        [\App\Middleware\RBACMiddleware::class, ['administrator', 'super_admin']]
    ])
    ->name('api.admin.pqr.index');

$router->put('/api/admin/pqr/{id}/status', [\App\Controllers\PQRController::class, 'adminUpdateStatus'])
    ->middleware([
        \App\Middleware\AuthMiddleware::class,
        [\App\Middleware\RBACMiddleware::class, ['administrator', 'super_admin']]
    ])
    ->name('api.admin.pqr.updateStatus');

$router->post('/api/admin/pqr/{id}/respond', [\App\Controllers\PQRController::class, 'adminRespond'])
    ->middleware([
        \App\Middleware\AuthMiddleware::class,
        [\App\Middleware\RBACMiddleware::class, ['administrator', 'super_admin']]
    ])
    ->name('api.admin.pqr.respond');

// ============================================================================
// Survey API Routes (Protected) - PARCE-DEMO sustentación module
// ============================================================================

$router->post('/api/surveys', [\App\Controllers\SurveyController::class, 'store'])
    ->middleware([
        \App\Middleware\AuthMiddleware::class,
        [\App\Middleware\RBACMiddleware::class, ['customer']]
    ])
    ->name('api.surveys.store');

$router->get('/api/surveys', [\App\Controllers\SurveyController::class, 'index'])
    ->middleware([
        \App\Middleware\AuthMiddleware::class,
        [\App\Middleware\RBACMiddleware::class, ['customer']]
    ])
    ->name('api.surveys.index');

$router->get('/api/admin/surveys', [\App\Controllers\SurveyController::class, 'adminIndex'])
    ->middleware([
        \App\Middleware\AuthMiddleware::class,
        [\App\Middleware\RBACMiddleware::class, ['administrator', 'super_admin']]
    ])
    ->name('api.admin.surveys.index');

// ============================================================================
// Admin API Routes (Protected) - PARCE-DEMO sustentación module
// ============================================================================

$router->get('/api/admin/dashboard', [\App\Controllers\AdminController::class, 'dashboard'])
    ->middleware([
        \App\Middleware\AuthMiddleware::class,
        [\App\Middleware\RBACMiddleware::class, ['administrator', 'super_admin']]
    ])
    ->name('api.admin.dashboard');

$router->get('/api/admin/ratings', [\App\Controllers\AdminController::class, 'ratings'])
    ->middleware([
        \App\Middleware\AuthMiddleware::class,
        [\App\Middleware\RBACMiddleware::class, ['administrator', 'super_admin']]
    ])
    ->name('api.admin.ratings');

$router->get('/api/test', function($request) {
    return \App\Infrastructure\Http\ResponseFormatter::success(
        ['message' => 'Test OK'],
        'Test',
        200
    );
})->name('api.test');

$router->get('/api/admin/users', [\App\Controllers\AdminController::class, 'users'])
    ->name('api.admin.users');

// Endpoint de debug - SOLO PARA DESARROLLO
$router->get('/api/admin/users/debug/all', function($request) {
    try {
        $adminService = new \App\Infrastructure\Admin\AdminService();
        $users = $adminService->getUsers();
        return \App\Infrastructure\Http\ResponseFormatter::success([
            'users' => $users,
            'count' => count($users),
        ], 'Usuarios obtenidos (DEBUG)', 200);
    } catch (\Exception $e) {
        return \App\Infrastructure\Http\ResponseFormatter::error(
            'Error: ' . $e->getMessage(),
            null,
            500
        );
    }
})->name('api.admin.users.debug');

$router->get('/api/admin/vehicles', [\App\Controllers\AdminController::class, 'vehicles'])
    ->name('api.admin.vehicles');

$router->put('/api/admin/users/{id}/status', [\App\Controllers\AdminController::class, 'updateUserStatus'])
    ->middleware([
        \App\Middleware\AuthMiddleware::class,
        [\App\Middleware\RBACMiddleware::class, ['administrator', 'super_admin']]
    ])
    ->name('api.admin.users.updateStatus');
