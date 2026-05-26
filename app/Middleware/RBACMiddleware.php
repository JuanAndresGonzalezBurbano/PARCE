<?php

namespace App\Middleware;

use App\Core\Request;
use App\Core\Response;
use App\Infrastructure\Auth\Services\RoleValidator;
use App\Infrastructure\Http\ResponseFormatter;

/**
 * RBAC Middleware
 * 
 * Enforces role-based access control for protected routes.
 * Checks if authenticated user has at least one of the required roles.
 * 
 * Requirements: Design Component 3 (RBACMiddleware)
 */
class RBACMiddleware
{
    private RoleValidator $roleValidator;
    private array $allowedRoles;

    /**
     * Create RBAC middleware instance
     * 
     * @param array $allowedRoles Array of role slugs that are allowed to access the route
     */
    public function __construct(array $allowedRoles)
    {
        $this->allowedRoles = $allowedRoles;
        $this->roleValidator = new RoleValidator();
    }

    /**
     * Handle incoming request
     * 
     * Requirements: Design Component 3
     * 
     * @param Request $request HTTP request object
     * @param callable $next Next middleware/controller in chain
     * @return Response HTTP response
     */
    public function handle(Request $request, callable $next): Response
    {
        // Retrieve authenticated user from request attributes (set by AuthMiddleware)
        $user = $request->getAttribute('user');

        // Return 401 if user not attached (AuthMiddleware should have run first)
        if ($user === null) {
            return ResponseFormatter::unauthorized('Authentication required');
        }

        $userId = (int)$user['id'];

        // Fetch user's active roles via RoleValidator
        $userRoles = $this->roleValidator->getUserRoles($userId);

        // Check if user has at least one of the required roles
        $hasRequiredRole = $this->roleValidator->hasAnyRole($userId, $this->allowedRoles);

        // Return 403 Forbidden if user lacks required role
        if (!$hasRequiredRole) {
            return ResponseFormatter::forbidden('Insufficient permissions')
                ->json([
                    'success' => false,
                    'error' => 'Insufficient permissions',
                    'details' => [
                        'requiredRoles' => $this->allowedRoles,
                        'userRoles' => $userRoles
                    ]
                ], 403);
        }

        // Allow request to proceed if user has required role
        return $next($request);
    }

    /**
     * Get allowed roles for this middleware instance
     * 
     * @return array Array of allowed role slugs
     */
    public function getAllowedRoles(): array
    {
        return $this->allowedRoles;
    }
}
