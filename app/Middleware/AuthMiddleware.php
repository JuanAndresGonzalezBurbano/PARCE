<?php

namespace App\Middleware;

use App\Core\Request;
use App\Core\Response;
use App\Core\Database;
use App\Infrastructure\Auth\Services\SessionManager;
use App\Infrastructure\Auth\Services\RoleValidator;
use App\Infrastructure\Http\ResponseFormatter;
use App\Infrastructure\Http\IPValidator;

/**
 * Authentication Middleware
 * 
 * Validates session authentication for protected routes by extracting session cookie,
 * validating session via SessionManager, fetching user data, and attaching to request.
 * 
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7
 */
class AuthMiddleware
{
    private SessionManager $sessionManager;
    private RoleValidator $roleValidator;

    public function __construct()
    {
        $this->sessionManager = new SessionManager();
        $this->roleValidator = new RoleValidator();
    }

    /**
     * Handle incoming request
     * 
     * Validates authentication and implements automatic session regeneration
     * for session fixation protection.
     * 
     * Requirements: 10.1-10.7
     * 
     * @param Request $request HTTP request object
     * @param callable $next Next middleware/controller in chain
     * @return Response HTTP response
     */
    public function handle(Request $request, callable $next): Response
    {
        // Requirement 10.1: Extract session ID from cookie
        $sessionId = $request->cookie(ResponseFormatter::getSessionCookieName());

        // Requirement 10.2: Return 401 if no session cookie present
        if ($sessionId === null || empty($sessionId)) {
            return ResponseFormatter::unauthorized('Authentication required');
        }

        // Requirement 10.3, 20.7: Validate session via SessionManager with IP change detection
        $currentIP = IPValidator::getClientIP($request);
        $sessionData = $this->sessionManager->validate($sessionId, $currentIP);

        // Requirement 10.4: Return 401 if session invalid
        if ($sessionData === null) {
            return ResponseFormatter::unauthorized('Invalid or expired session');
        }

        // Check if session should be regenerated for security (anti-fixation)
        $shouldRegenerate = $this->sessionManager->shouldRegenerate($sessionId);
        
        if ($shouldRegenerate) {
            // Regenerate session ID
            $newSessionId = $this->sessionManager->regenerate($sessionId);
            
            if (!empty($newSessionId)) {
                // Update session ID in request context
                $sessionId = $newSessionId;
                
                // Note: We'll set the new cookie in the response after calling $next()
                // Store flag for response modification
                $request->setAttribute('session_regenerated', true);
                $request->setAttribute('new_session_id', $newSessionId);
            }
        }

        // Requirement 10.5: Fetch user data from database
        try {
            $user = Database::fetchOne(
                'SELECT id, email, first_name, last_name, account_status, last_login_at, created_at
                 FROM users
                 WHERE id = ? AND deleted_at IS NULL',
                [$sessionData->userId]
            );

            // Return 401 if user not found or deleted
            if ($user === null) {
                return ResponseFormatter::unauthorized('User not found');
            }

            // Check if account is active
            if ($user['account_status'] !== 'active') {
                return ResponseFormatter::forbidden('Account is not active');
            }

            // Requirement 10.5, 10.6: Attach SessionData and user data to request
            $request->setAttribute('session', $sessionData);
            $request->setAttribute('user', $user);
            $request->setAttribute('userId', (int)$user['id']);

            // Fetch user roles and determine primary role
            $userRoles = $this->roleValidator->getUserRoles((int)$user['id']);
            $primaryRole = $this->determinePrimaryRole($userRoles);
            
            // Attach roles to request for RBAC and authorization
            $request->setAttribute('userRoles', $userRoles);  // Array of all active roles
            $request->setAttribute('userRole', $primaryRole); // Primary role for single-role decisions

            // Requirement 10.7: Continue to next middleware/controller
            $response = $next($request);
            
            // If session was regenerated, update the cookie in the response
            if ($request->getAttribute('session_regenerated') === true) {
                $newSessionId = $request->getAttribute('new_session_id');
                ResponseFormatter::setSessionCookie($response, $newSessionId, false);
            }
            
            return $response;

        } catch (\Exception $e) {
            // Log error
            error_log("AuthMiddleware error: " . $e->getMessage());
            
            return ResponseFormatter::serverError('Authentication service unavailable');
        }
    }

    /**
     * Determine primary role from array of roles
     * 
     * Uses hierarchical priority to select the most privileged role
     * when a user has multiple active roles.
     * 
     * Priority order (highest to lowest):
     * 1. super_admin     - Full system access
     * 2. administrator   - Admin access  
     * 3. mechanic        - Service provider
     * 4. customer        - Standard user
     * 5. support         - Read-only
     * 
     * @param array $roles Array of role slugs
     * @return string Primary role slug (defaults to 'customer' if no roles)
     */
    private function determinePrimaryRole(array $roles): string
    {
        if (empty($roles)) {
            return 'customer'; // Default to customer if no roles assigned
        }

        // Role priority (ordered from highest to lowest privilege)
        $rolePriority = [
            'super_admin',
            'administrator',
            'mechanic',
            'customer',
            'support'
        ];

        // Return the first role found in priority order
        foreach ($rolePriority as $role) {
            if (in_array($role, $roles, true)) {
                return $role;
            }
        }

        // If no recognized role, return the first role alphabetically
        return $roles[0];
    }
}
