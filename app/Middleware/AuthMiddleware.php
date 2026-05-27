<?php

namespace App\Middleware;

use App\Core\Request;
use App\Core\Response;
use App\Core\Database;
use App\Infrastructure\Auth\Services\SessionManager;
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

    public function __construct()
    {
        $this->sessionManager = new SessionManager();
    }

    /**
     * Handle incoming request
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

            // Requirement 10.7: Continue to next middleware/controller
            return $next($request);

        } catch (\Exception $e) {
            // Log error
            error_log("AuthMiddleware error: " . $e->getMessage());
            
            return ResponseFormatter::serverError('Authentication service unavailable');
        }
    }
}
