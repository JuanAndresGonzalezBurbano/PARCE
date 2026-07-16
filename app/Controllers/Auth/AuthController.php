<?php

namespace App\Controllers\Auth;

use App\Core\Controller;
use App\Core\Request;
use App\Core\Response;
use App\Core\Database;
use App\Core\DomainException;
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
            // Requirement 20.1, 20.2: obtener IP del cliente para limitar tasa
            $ipAddress = IPValidator::getClientIP($request);

            // Limitar tasa de registros por IP para evitar creación masiva de cuentas
            $rateLimitCheck = RateLimiter::check('register', $ipAddress);

            if (!$rateLimitCheck['allowed']) {
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
                RateLimiter::recordAttempt('register', $ipAddress);
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

                // Contar el registro exitoso para el límite de tasa (evita creación masiva)
                RateLimiter::recordAttempt('register', $ipAddress);

                // Prepare response data — mismo perfil completo que devuelve GET /api/auth/me
                $responseData = [
                    'user' => $this->buildUserProfile($userId),
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

            // Calculate session expiration
            $expiresAt = $remember
                ? time() + (30 * 24 * 60 * 60) // 30 days
                : time() + 7200; // 2 hours

            // Prepare response data — mismo perfil completo que devuelve GET /api/auth/me
            // (incluye phone, createdAt y driverLicense) para que el frontend no dependa
            // de un refresh posterior para ver esos campos.
            $responseData = [
                'user' => $this->buildUserProfile($authResult->userId),
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
     * Obtener usuario autenticado actual
     *
     * GET /api/auth/me
     *
     * Retorna el perfil completo del usuario incluyendo datos de licencia de conducción.
     *
     * @param Request $request HTTP request
     * @return Response HTTP response
     */
    public function me(Request $request): Response
    {
        try {
            // Obtener usuario desde los atributos del request (establecido por AuthMiddleware)
            $user = $request->getAttribute('user');

            if ($user === null) {
                return ResponseFormatter::unauthorized('Autenticación requerida');
            }

            $responseData = $this->buildUserProfile((int)$user['id']);

            if ($responseData === null) {
                return ResponseFormatter::unauthorized('Usuario no encontrado');
            }

            return ResponseFormatter::success($responseData, 'Usuario obtenido correctamente', 200);

        } catch (\Exception $e) {
            return ErrorHandler::handleException($e);
        }
    }

    /**
     * Construye el perfil completo de un usuario (mismos campos que GET /api/auth/me).
     *
     * Usado por register(), login() y me() para que los tres endpoints devuelvan
     * exactamente la misma forma de objeto `user` — antes cada uno armaba su propio
     * arreglo a mano y quedaban desincronizados (login/register nunca incluían
     * `phone`, `createdAt` ni `driverLicense`, rompiendo cualquier UI que dependiera
     * de esos campos justo después de iniciar sesión, antes de un refresh manual).
     *
     * @param int $userId ID del usuario
     * @return array|null Perfil completo, o null si el usuario no existe
     */
    private function buildUserProfile(int $userId): ?array
    {
        $userData = Database::fetchOne(
            'SELECT id, email, first_name, last_name, phone, account_status,
                    last_login_at, created_at,
                    driver_license_number, driver_license_expiration_date,
                    driver_license_document_url, driver_license_status,
                    driver_license_uploaded_at
             FROM users
             WHERE id = ? AND deleted_at IS NULL',
            [$userId]
        );

        if ($userData === null) {
            return null;
        }

        $roles = $this->roleValidator->getUserRoles($userId);

        // Construir objeto de licencia de conducción (null si no se ha registrado)
        $driverLicense = null;
        if ($userData['driver_license_status'] !== 'not_set' || $userData['driver_license_number'] !== null) {
            $driverLicense = [
                'number'         => $userData['driver_license_number'],
                'expirationDate' => $userData['driver_license_expiration_date'],
                'documentUrl'    => $userData['driver_license_document_url'],
                'status'         => $userData['driver_license_status'] ?? 'not_set',
                'uploadedAt'     => $userData['driver_license_uploaded_at'],
            ];
        }

        return [
            'id'            => $userId,
            'email'         => $userData['email'],
            'firstName'     => $userData['first_name'],
            'lastName'      => $userData['last_name'],
            'phone'         => $userData['phone'],
            'accountStatus' => $userData['account_status'],
            'createdAt'     => $userData['created_at'],
            'lastLoginAt'   => $userData['last_login_at'],
            'roles'         => $roles,
            'driverLicense' => $driverLicense,
        ];
    }

    /**
     * Actualizar perfil del usuario autenticado
     *
     * PUT /api/auth/profile
     *
     * Permite actualizar los datos de la licencia de conducción.
     * El estado de la licencia se recalcula automáticamente según la fecha de vencimiento.
     *
     * @param Request $request HTTP request
     * @return Response HTTP response
     */
    public function profile(Request $request): Response
    {
        try {
            // Obtener usuario desde los atributos del request (establecido por AuthMiddleware)
            $user = $request->getAttribute('user');

            if ($user === null) {
                return ResponseFormatter::unauthorized('Autenticación requerida');
            }

            $userId = (int)$user['id'];

            // Parsear cuerpo JSON
            $jsonValidation = RequestValidator::parseJsonBody($request);
            if (!$jsonValidation['valid']) {
                return ResponseFormatter::error(
                    $jsonValidation['error'],
                    null,
                    $jsonValidation['statusCode']
                );
            }

            // Recopilar campos permitidos para actualización
            $updates = [];
            $now     = date('Y-m-d H:i:s');

            // Número de licencia
            $licenseNumber = $request->input('driver_license_number');
            if ($licenseNumber !== null) {
                $updates['driver_license_number'] = RequestValidator::sanitizeString($licenseNumber);
                $updates['driver_license_uploaded_at'] = $now;
            }

            // Fecha de vencimiento + recálculo de estado
            $expirationDate = $request->input('driver_license_expiration_date');
            if ($expirationDate !== null) {
                // Validar formato YYYY-MM-DD
                if (!\DateTime::createFromFormat('Y-m-d', $expirationDate)) {
                    return ResponseFormatter::validationError([
                        'driver_license_expiration_date' => 'El formato debe ser YYYY-MM-DD'
                    ]);
                }

                $updates['driver_license_expiration_date'] = $expirationDate;

                // Calcular estado según la fecha de vencimiento
                $today      = new \DateTime('today');
                $expiry     = new \DateTime($expirationDate);
                $daysToExpiry = (int)$today->diff($expiry)->days;
                $isPast     = $expiry < $today;

                if ($isPast) {
                    $updates['driver_license_status'] = 'expired';
                } elseif ($daysToExpiry <= 30) {
                    $updates['driver_license_status'] = 'expiring_soon';
                } else {
                    $updates['driver_license_status'] = 'valid';
                }

                $updates['driver_license_uploaded_at'] = $now;
            }

            // URL del documento
            $documentUrl = $request->input('driver_license_document_url');
            if ($documentUrl !== null) {
                $updates['driver_license_document_url'] = RequestValidator::sanitizeString($documentUrl);
            }

            // Si no hay nada que actualizar, retornar el perfil actual
            if (empty($updates)) {
                return $this->me($request);
            }

            $updates['updated_at'] = $now;

            // Aplicar actualización
            Database::update('users', $updates, 'id = ?', [$userId]);

            // Retornar perfil actualizado
            return $this->me($request);

        } catch (\Exception $e) {
            return ErrorHandler::handleException($e);
        }
    }

    /**
     * Cambiar la contraseña del usuario autenticado
     *
     * PUT /api/auth/password
     *
     * Requiere la contraseña actual. Al cambiarla exitosamente, se cierran todas
     * las sesiones existentes (incluida la actual) y se emite una nueva sesión
     * para el dispositivo que hizo la solicitud, forzando el cierre de sesión en
     * cualquier otro dispositivo — comportamiento estándar tras un cambio de contraseña.
     *
     * @param Request $request Solicitud HTTP
     * @return Response Respuesta HTTP
     */
    public function changePassword(Request $request): Response
    {
        try {
            $user = $request->getAttribute('user');
            if ($user === null) {
                return ResponseFormatter::unauthorized('Autenticación requerida');
            }
            $userId = (int)$user['id'];

            $ipAddress = IPValidator::getClientIP($request);

            // Limitar tasa por IP para evitar fuerza bruta sobre la contraseña actual
            $rateLimitCheck = RateLimiter::check('change-password', $ipAddress);
            if (!$rateLimitCheck['allowed']) {
                $retryAfter = $rateLimitCheck['reset_at'] - time();
                return ResponseFormatter::rateLimitExceeded($retryAfter);
            }

            $jsonValidation = RequestValidator::parseJsonBody($request);
            if (!$jsonValidation['valid']) {
                return ResponseFormatter::error(
                    $jsonValidation['error'],
                    null,
                    $jsonValidation['statusCode']
                );
            }

            $validation = RequestValidator::validateChangePasswordRequest($request);
            if (!$validation['valid']) {
                return ResponseFormatter::validationError($validation['errors']);
            }

            $currentPassword = $request->input('current_password');
            $newPassword     = $request->input('new_password');

            $userRecord = Database::fetchOne(
                'SELECT password_hash FROM users WHERE id = ? AND deleted_at IS NULL',
                [$userId]
            );

            if ($userRecord === null || !$this->passwordHasher->verify($currentPassword, $userRecord['password_hash'])) {
                RateLimiter::recordAttempt('change-password', $ipAddress);
                throw new DomainException('La contraseña actual es incorrecta', 400);
            }

            RateLimiter::reset('change-password', $ipAddress);

            $newHash = $this->passwordHasher->hash($newPassword);

            Database::update('users', [
                'password_hash' => $newHash,
                'updated_at'    => date('Y-m-d H:i:s'),
            ], 'id = ?', [$userId]);

            // Cerrar todas las sesiones existentes y emitir una nueva para este dispositivo
            $this->sessionManager->destroyAllUserSessions($userId);
            $sessionId = $this->sessionManager->create($userId, [
                'ip_address' => $ipAddress,
                'user_agent' => $request->userAgent(),
                'remember'   => false
            ]);

            $response = ResponseFormatter::success(
                null,
                'Contraseña actualizada correctamente. Se cerró la sesión en tus otros dispositivos.',
                200
            );

            ResponseFormatter::setSessionCookie($response, $sessionId, false);

            return $response;

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
