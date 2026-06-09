<?php

namespace App\Controllers\Auth;

use App\Core\Controller;
use App\Core\Request;
use App\Core\Response;
use App\Core\Database;
use App\Infrastructure\Auth\Services\AuthService;
use App\Infrastructure\Auth\Services\SessionManager;
use App\Infrastructure\Auth\Services\PasswordHasher;
use App\Infrastructure\Auth\Services\RoleValidator;
use App\Infrastructure\Http\RequestValidator;
use App\Infrastructure\Http\ResponseFormatter;
use App\Infrastructure\Http\RateLimiter;
use App\Infrastructure\Http\IPValidator;
use App\Infrastructure\Http\ErrorHandler;
use App\Infrastructure\Auth\Exceptions\AuthenticationException;

/**
 * Authentication Controller
 * 
 * Handles HTTP requests for authentication operations including
 * registration, login, logout, and current user retrieval.
 * 
 * Requirements: Design API Endpoints 1-4
 */
class AuthController extends Controller
{
    private AuthService $authService;
    private SessionManager $sessionManager;
    private PasswordHasher $passwordHasher;
    private RoleValidator $roleValidator;

    public function __construct()
    {
        $this->passwordHasher = new PasswordHasher();
        $this->sessionManager = new SessionManager();
        $this->authService = new AuthService($this->passwordHasher, $this->sessionManager);
        $this->roleValidator = new RoleValidator();
    }

    /**
     * Register new user
     * 
     * POST /api/auth/register
     * 
     * Requirements: 1.1-1.8, Design API Endpoint 1
     * 
     * @param Request $request HTTP request
     * @return Response HTTP response
     */
    public function register(Request $request): Response
    {
        try {
            // Validate Content-Type
            $contentTypeValidation = RequestValidator::validateContentType($request, 'POST');
            if (!$contentTypeValidation['valid']) {
                return ResponseFormatter::error(
                    $contentTypeValidation['error'],
                    null,
                    $contentTypeValidation['statusCode']
                );
            }

            // Parse JSON body
            $jsonValidation = RequestValidator::parseJsonBody($request);
            if (!$jsonValidation['valid']) {
                return ResponseFormatter::error(
                    $jsonValidation['error'],
                    null,
                    $jsonValidation['statusCode']
                );
            }

            // Validate registration request
            $validation = RequestValidator::validateRegistrationRequest($request);
            if (!$validation['valid']) {
                return ResponseFormatter::validationError($validation['errors']);
            }

            // Extract and sanitize input
            $email = RequestValidator::sanitizeString($request->input('email'));
            $password = $request->input('password');
            $firstName = RequestValidator::sanitizeString($request->input('first_name'));
            $lastName = RequestValidator::sanitizeString($request->input('last_name'));
            $phone = $request->input('phone') ? RequestValidator::sanitizeString($request->input('phone')) : null;

            // Check if email already exists
            $existingUser = Database::fetchOne(
                'SELECT id FROM users WHERE email = ? AND deleted_at IS NULL',
                [$email]
            );

            if ($existingUser !== null) {
                return ResponseFormatter::conflict('Email already exists');
            }

            // Hash password
            $passwordHash = $this->passwordHasher->hash($password);

            // Start database transaction
            Database::beginTransaction();

            try {
                // Insert user
                $userId = Database::insert('users', [
                    'email' => $email,
                    'password_hash' => $passwordHash,
                    'first_name' => $firstName,
                    'last_name' => $lastName,
                    'phone' => $phone,
                    'account_status' => 'active',
                    'created_at' => date('Y-m-d H:i:s'),
                    'updated_at' => date('Y-m-d H:i:s')
                ]);

                // Get default 'customer' role ID
                $customerRole = Database::fetchOne(
                    'SELECT id FROM roles WHERE slug = ? AND is_active = TRUE',
                    ['customer']
                );

                if ($customerRole === null) {
                    throw new \Exception('Default customer role not found');
                }

                // Assign default 'customer' role
                Database::insert('user_roles', [
                    'user_id' => $userId,
                    'role_id' => $customerRole['id'],
                    'assigned_at' => date('Y-m-d H:i:s'),
                    'is_active' => true
                ]);

                // Create session
                $sessionId = $this->sessionManager->create($userId, [
                    'ip_address' => IPValidator::getClientIP($request),
                    'user_agent' => $request->userAgent(),
                    'remember' => false
                ]);

                // Commit transaction
                Database::commit();

                // Fetch created user
                $user = Database::fetchOne(
                    'SELECT id, email, first_name, last_name, account_status, created_at
                     FROM users
                     WHERE id = ?',
                    [$userId]
                );

                // Get user roles
                $roles = $this->roleValidator->getUserRoles($userId);

                // Prepare response data
                $responseData = [
                    'user' => [
                        'id' => (int)$user['id'],
                        'email' => $user['email'],
                        'firstName' => $user['first_name'],
                        'lastName' => $user['last_name'],
                        'accountStatus' => $user['account_status'],
                        'roles' => $roles
                    ],
                    'session' => [
                        'id' => $sessionId,
                        'expiresAt' => time() + 7200 // 2 hours
                    ]
                ];

                // Set session cookie
                $response = ResponseFormatter::success(
                    $responseData,
                    'Registration successful',
                    201
                );

                ResponseFormatter::setSessionCookie($response, $sessionId, false);

                return $response;

            } catch (\Exception $e) {
                // Rollback transaction on error
                Database::rollback();
                throw $e;
            }

        } catch (AuthenticationException $e) {
            return ErrorHandler::handleException($e);

        } catch (\Exception $e) {
            return ErrorHandler::handleException($e);
        }
    }

    /**
     * Login user
     * 
     * POST /api/auth/login
     * 
     * Requirements: 1.1-1.8, 19.1-19.7, Design API Endpoint 2
     * 
     * @param Request $request HTTP request
     * @return Response HTTP response
     */
    public function login(Request $request): Response
    {
        try {
            // Requirement 20.1, 20.2: Get client IP address using IPValidator
            $ipAddress = IPValidator::getClientIP($request);

            // Requirement 6.1, 6.2, 6.3: Check rate limit before authentication
            $rateLimitCheck = RateLimiter::check('login', $ipAddress);
            
            if (!$rateLimitCheck['allowed']) {
                // Requirement 6.4: Return 429 with Retry-After header
                $retryAfter = $rateLimitCheck['reset_at'] - time();
                return ResponseFormatter::rateLimitExceeded($retryAfter);
            }

            // Validate Content-Type
            $contentTypeValidation = RequestValidator::validateContentType($request, 'POST');
            if (!$contentTypeValidation['valid']) {
                return ResponseFormatter::error(
                    $contentTypeValidation['error'],
                    null,
                    $contentTypeValidation['statusCode']
                );
            }

            // Parse JSON body
            $jsonValidation = RequestValidator::parseJsonBody($request);
            if (!$jsonValidation['valid']) {
                return ResponseFormatter::error(
                    $jsonValidation['error'],
                    null,
                    $jsonValidation['statusCode']
                );
            }

            // Validate login request
            $validation = RequestValidator::validateLoginRequest($request);
            if (!$validation['valid']) {
                return ResponseFormatter::validationError($validation['errors']);
            }

            // Extract input
            $email = RequestValidator::sanitizeString($request->input('email'));
            $password = $request->input('password');
            $remember = $request->input('remember', false);

            // Normalize remember to boolean
            if (!is_bool($remember)) {
                $remember = filter_var($remember, FILTER_VALIDATE_BOOLEAN);
            }

            // Requirement 20.2: Authenticate via AuthService with IP address and user agent
            $userAgent = $request->userAgent();
            $authResult = $this->authService->authenticate($email, $password, $remember, $ipAddress, $userAgent);

            // Check authentication result
            if (!$authResult->success) {
                // Record failed attempt for rate limiting
                RateLimiter::recordAttempt('login', $ipAddress);
                
                // Return 401 with generic error message (prevent user enumeration)
                return ResponseFormatter::unauthorized($authResult->message);
            }

            // Requirement 6.5: Reset rate limit on successful login
            RateLimiter::reset('login', $ipAddress);

            // Fetch user data
            $user = Database::fetchOne(
                'SELECT id, email, first_name, last_name, account_status, last_login_at
                 FROM users
                 WHERE id = ?',
                [$authResult->userId]
            );

            // Get user roles
            $roles = $this->roleValidator->getUserRoles($authResult->userId);

            // Calculate session expiration
            $expiresAt = $remember 
                ? time() + (30 * 24 * 60 * 60) // 30 days
                : time() + 7200; // 2 hours

            // Prepare response data
            $responseData = [
                'user' => [
                    'id' => (int)$user['id'],
                    'email' => $user['email'],
                    'firstName' => $user['first_name'],
                    'lastName' => $user['last_name'],
                    'accountStatus' => $user['account_status'],
                    'lastLoginAt' => $user['last_login_at'],
                    'roles' => $roles
                ],
                'session' => [
                    'id' => $authResult->sessionId,
                    'expiresAt' => $expiresAt
                ]
            ];

            // Set session cookie
            $response = ResponseFormatter::success(
                $responseData,
                'Login successful',
                200
            );

            ResponseFormatter::setSessionCookie($response, $authResult->sessionId, $remember);

            return $response;

        } catch (AuthenticationException $e) {
            // Record failed attempt for rate limiting
            RateLimiter::recordAttempt('login', $ipAddress);
            
            return ErrorHandler::handleException($e);

        } catch (\Exception $e) {
            return ErrorHandler::handleException($e);
        }
    }

    /**
     * Logout user
     * 
     * POST /api/auth/logout
     * 
     * Requirements: 2.1-2.7, Design API Endpoint 3
     * 
     * @param Request $request HTTP request
     * @return Response HTTP response
     */
    public function logout(Request $request): Response
    {
        try {
            // Extract session ID from cookie
            $sessionId = $request->cookie(ResponseFormatter::getSessionCookieName());

            // If no session cookie, return success anyway (idempotent)
            if ($sessionId === null || empty($sessionId)) {
                $response = ResponseFormatter::success(null, 'Logout successful', 200);
                ResponseFormatter::clearSessionCookie($response);
                return $response;
            }

            // Destroy session via AuthService
            $this->authService->logout($sessionId);

            // Clear session cookie
            $response = ResponseFormatter::success(null, 'Logout successful', 200);
            ResponseFormatter::clearSessionCookie($response);

            return $response;

        } catch (\Exception $e) {
            return ErrorHandler::handleException($e);
        }
    }

    /**
     * Get current authenticated user
     * 
     * GET /api/auth/me
     * 
     * Requirements: 4.1-4.7, Design API Endpoint 4
     * 
     * @param Request $request HTTP request
     * @return Response HTTP response
     */
    public function me(Request $request): Response
    {
        try {
            // Get user from request attributes (set by AuthMiddleware)
            $user = $request->getAttribute('user');

            // This should not happen if AuthMiddleware is working correctly
            if ($user === null) {
                return ResponseFormatter::unauthorized('Authentication required');
            }

            $userId = (int)$user['id'];

            // Get user roles
            $roles = $this->roleValidator->getUserRoles($userId);

            // Prepare response data
            $responseData = [
                'id' => $userId,
                'email' => $user['email'],
                'firstName' => $user['first_name'],
                'lastName' => $user['last_name'],
                'accountStatus' => $user['account_status'],
                'lastLoginAt' => $user['last_login_at'],
                'roles' => $roles
            ];

            return ResponseFormatter::success($responseData, 'User retrieved successfully', 200);

        } catch (\Exception $e) {
            return ErrorHandler::handleException($e);
        }
    }

    /**
     * Health check endpoint
     * 
     * GET /api/auth/health
     * 
     * Requirements: 14.1-14.7
     * 
     * @param Request $request HTTP request
     * @return Response HTTP response
     */
    public function health(Request $request): Response
    {
        $startTime = microtime(true);

        try {
            // Test database connectivity
            $result = Database::fetchOne('SELECT 1 as test');

            if ($result === null || $result['test'] !== 1) {
                throw new \Exception('Database health check failed');
            }

            // Calculate response time in milliseconds
            $responseTime = round((microtime(true) - $startTime) * 1000, 2);

            // Prepare response data
            $responseData = [
                'status' => 'healthy',
                'version' => '1.0.0',
                'timestamp' => date('Y-m-d H:i:s'),
                'responseTime' => $responseTime
            ];

            return ResponseFormatter::success($responseData, 'Service is healthy', 200);

        } catch (\Exception $e) {
            // Calculate response time even on failure
            $responseTime = round((microtime(true) - $startTime) * 1000, 2);

            // Prepare unhealthy response data
            $responseData = [
                'status' => 'unhealthy',
                'version' => '1.0.0',
                'timestamp' => date('Y-m-d H:i:s'),
                'responseTime' => $responseTime
            ];

            // Log exception via ErrorHandler
            ErrorHandler::logException($e);

            return ResponseFormatter::error(
                'Service is unhealthy',
                $responseData,
                503
            );
        }
    }
}
