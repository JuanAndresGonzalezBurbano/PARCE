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
 * Expone los endpoints HTTP de autenticación:
 *   POST /api/auth/register  — registro de nuevo usuario
 *   POST /api/auth/login     — inicio de sesión
 *   POST /api/auth/logout    — cierre de sesión
 *   GET  /api/auth/me        — perfil del usuario autenticado
 *   PUT  /api/auth/profile   — actualización del perfil (licencia del mecánico)
 *   GET  /api/auth/health    — health-check del servicio de auth
 *
 * Convenciones de este controller:
 *  - Cada método está envuelto en try/catch; los errores van a ErrorHandler.
 *  - Toda respuesta usa ResponseFormatter para garantizar el formato JSON estándar.
 *  - Las cookies de sesión siempre se capturan del valor de retorno de
 *    ResponseFormatter::setSessionCookie() — este método retorna un nuevo
 *    Response con la cookie adjunta, no modifica el objeto original.
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
        $this->authService    = new AuthService($this->passwordHasher, $this->sessionManager);
        $this->roleValidator  = new RoleValidator();
    }

    // =========================================================================
    // POST /api/auth/register
    // =========================================================================

    /**
     * Registra un nuevo usuario como 'customer' y crea su sesión inicial.
     *
     * Flujo:
     *  1. Valida Content-Type y parsea JSON.
     *  2. Valida campos de registro (email, password, first_name, last_name).
     *  3. Verifica que el email no exista ya en la BD.
     *  4. Hashea el password con Argon2id via PasswordHasher.
     *  5. Transacción: crea usuario, asigna rol 'customer', crea sesión en BD.
     *  6. Retorna 201 con datos del usuario y la cookie de sesión.
     */
    public function register(Request $request): Response
    {
        try {
            // Validar que el request sea JSON
            $ctValidation = RequestValidator::validateContentType($request, 'POST');
            if (!$ctValidation['valid']) {
                return ResponseFormatter::error($ctValidation['error'], null, $ctValidation['statusCode']);
            }

            $jsonValidation = RequestValidator::parseJsonBody($request);
            if (!$jsonValidation['valid']) {
                return ResponseFormatter::error($jsonValidation['error'], null, $jsonValidation['statusCode']);
            }

            // Validar todos los campos de registro
            $validation = RequestValidator::validateRegistrationRequest($request);
            if (!$validation['valid']) {
                return ResponseFormatter::validationError($validation['errors']);
            }

            // Sanitizar inputs (elimina null bytes, trim)
            $email     = RequestValidator::sanitizeString($request->input('email'));
            $password  = $request->input('password');
            $firstName = RequestValidator::sanitizeString($request->input('first_name'));
            $lastName  = RequestValidator::sanitizeString($request->input('last_name'));
            $phone     = $request->input('phone')
                ? RequestValidator::sanitizeString($request->input('phone'))
                : null;

            // Verificar que el email no esté registrado
            $existingUser = Database::fetchOne(
                'SELECT id FROM users WHERE email = ? AND deleted_at IS NULL',
                [$email]
            );
            if ($existingUser !== null) {
                // 409 Conflict: el email ya está en uso
                return ResponseFormatter::conflict('Email already exists');
            }

            // Hashear la contraseña (Argon2id, memory-hard)
            $passwordHash = $this->passwordHasher->hash($password);

            // Transacción para garantizar consistencia: usuario + rol + sesión
            Database::beginTransaction();
            try {
                $userId = Database::insert('users', [
                    'email'          => $email,
                    'password_hash'  => $passwordHash,
                    'first_name'     => $firstName,
                    'last_name'      => $lastName,
                    'phone'          => $phone,
                    'account_status' => 'active',
                    'created_at'     => date('Y-m-d H:i:s'),
                    'updated_at'     => date('Y-m-d H:i:s'),
                ]);

                // El rol por defecto para cualquier registro es 'customer'
                $customerRole = Database::fetchOne(
                    'SELECT id FROM roles WHERE slug = ? AND is_active = TRUE',
                    ['customer']
                );
                if ($customerRole === null) {
                    throw new \Exception('Default customer role not found in database');
                }

                Database::insert('user_roles', [
                    'user_id'     => $userId,
                    'role_id'     => $customerRole['id'],
                    'assigned_at' => date('Y-m-d H:i:s'),
                    'is_active'   => true,
                ]);

                // Crear sesión en la tabla sessions (no filesystem)
                $sessionId = $this->sessionManager->create($userId, [
                    'ip_address' => IPValidator::getClientIP($request),
                    'user_agent' => $request->userAgent(),
                    'remember'   => false, // los nuevos registros nunca tienen remember
                ]);

                Database::commit();
            } catch (\Exception $e) {
                Database::rollback();
                throw $e;
            }

            // Recuperar usuario recién creado para incluirlo en la respuesta
            $user  = Database::fetchOne(
                'SELECT id, email, first_name, last_name, phone, account_status, created_at
                 FROM users WHERE id = ?',
                [$userId]
            );
            $roles = $this->roleValidator->getUserRoles($userId);

            $responseData = [
                'user' => [
                    'id'            => (int)$user['id'],
                    'email'         => $user['email'],
                    'firstName'     => $user['first_name'],
                    'lastName'      => $user['last_name'],
                    'phone'         => $user['phone'],
                    'accountStatus' => $user['account_status'],
                    'roles'         => $roles,
                ],
                'session' => [
                    'expiresAt' => time() + 7200, // 2 horas
                ],
            ];

            // CORRECCIÓN: setSessionCookie() retorna un Response nuevo con la cookie.
            // Debe capturarse; ignorar el return deja la cookie sin settear.
            $response = ResponseFormatter::success($responseData, 'Registration successful', 201);
            $response = ResponseFormatter::setSessionCookie($response, $sessionId, false);

            return $response;

        } catch (AuthenticationException $e) {
            return ErrorHandler::handleException($e);
        } catch (\Exception $e) {
            return ErrorHandler::handleException($e);
        }
    }

    // =========================================================================
    // POST /api/auth/login
    // =========================================================================

    /**
     * Autentica un usuario y abre una sesión.
     *
     * Flujo:
     *  1. Extrae la IP real del cliente (IPValidator maneja proxies).
     *  2. Verifica rate limit: 5 intentos / 15 minutos / IP.
     *  3. Valida Content-Type y JSON.
     *  4. Llama a AuthService::authenticate() que internamente:
     *     - Busca el usuario por email.
     *     - Si no existe: hace un dummy hash para que el tiempo de respuesta
     *       sea idéntico al caso de contraseña incorrecta (timing-attack protection).
     *     - Verifica el hash Argon2id.
     *     - Crea la sesión en BD y actualiza last_login_at / last_login_ip.
     *  5. Si falla: incrementa el contador de rate limiting.
     *  6. Si exitoso: resetea el contador y retorna 200 con cookie de sesión.
     */
    public function login(Request $request): Response
    {
        // La IP se extrae fuera del try para que esté disponible en los catch
        // (necesitamos registrar el intento fallido incluso si hay excepción)
        $ipAddress = IPValidator::getClientIP($request);

        try {
            // Verificar rate limit antes de procesar el request
            $rateLimitCheck = RateLimiter::check('login', $ipAddress);
            if (!$rateLimitCheck['allowed']) {
                $retryAfter = $rateLimitCheck['reset_at'] - time();
                return ResponseFormatter::rateLimitExceeded($retryAfter);
            }

            $ctValidation = RequestValidator::validateContentType($request, 'POST');
            if (!$ctValidation['valid']) {
                return ResponseFormatter::error($ctValidation['error'], null, $ctValidation['statusCode']);
            }

            $jsonValidation = RequestValidator::parseJsonBody($request);
            if (!$jsonValidation['valid']) {
                return ResponseFormatter::error($jsonValidation['error'], null, $jsonValidation['statusCode']);
            }

            $validation = RequestValidator::validateLoginRequest($request);
            if (!$validation['valid']) {
                return ResponseFormatter::validationError($validation['errors']);
            }

            $email    = RequestValidator::sanitizeString($request->input('email'));
            $password = $request->input('password');
            $remember = $request->input('remember', false);
            if (!is_bool($remember)) {
                $remember = filter_var($remember, FILTER_VALIDATE_BOOLEAN);
            }

            // AuthService::authenticate() orquesta toda la lógica de seguridad
            $authResult = $this->authService->authenticate(
                $email,
                $password,
                $remember,
                $ipAddress,
                $request->userAgent()
            );

            if (!$authResult->success) {
                // Credenciales inválidas: registrar intento para el rate limiter
                RateLimiter::recordAttempt('login', $ipAddress);
                // Mensaje genérico: no decimos si el email existe
                return ResponseFormatter::unauthorized($authResult->message);
            }

            // Login exitoso: limpiar el contador para que la IP no quede bloqueada
            RateLimiter::reset('login', $ipAddress);

            // Recuperar datos completos del usuario para la respuesta
            $user  = Database::fetchOne(
                'SELECT id, email, first_name, last_name, phone, account_status, last_login_at
                 FROM users WHERE id = ?',
                [$authResult->userId]
            );
            $roles = $this->roleValidator->getUserRoles($authResult->userId);

            $expiresAt = $remember
                ? time() + (30 * 24 * 60 * 60) // 30 días con remember me
                : time() + 7200;                 // 2 horas sin remember me

            $responseData = [
                'user' => [
                    'id'            => (int)$user['id'],
                    'email'         => $user['email'],
                    'firstName'     => $user['first_name'],
                    'lastName'      => $user['last_name'],
                    'phone'         => $user['phone'],
                    'accountStatus' => $user['account_status'],
                    'lastLoginAt'   => $user['last_login_at'],
                    'roles'         => $roles,
                ],
                'session' => [
                    'expiresAt' => $expiresAt,
                ],
            ];

            // CORRECCIÓN: capturar el retorno de setSessionCookie()
            $response = ResponseFormatter::success($responseData, 'Login successful', 200);
            $response = ResponseFormatter::setSessionCookie($response, $authResult->sessionId, $remember);

            return $response;

        } catch (AuthenticationException $e) {
            // Las excepciones de autenticación también cuentan como intento fallido
            RateLimiter::recordAttempt('login', $ipAddress);
            return ErrorHandler::handleException($e);
        } catch (\Exception $e) {
            return ErrorHandler::handleException($e);
        }
    }

    // =========================================================================
    // POST /api/auth/logout
    // =========================================================================

    /**
     * Cierra la sesión del usuario y expira la cookie.
     *
     * Es idempotente: si la cookie no existe o la sesión ya fue destruida,
     * retorna 200 de todas formas. Así el cliente siempre puede hacer logout limpio
     * sin preocuparse por el estado previo.
     */
    public function logout(Request $request): Response
    {
        try {
            $sessionId = $request->cookie(ResponseFormatter::getSessionCookieName());

            if (!empty($sessionId)) {
                // Eliminar la sesión de la tabla sessions en la BD
                $this->authService->logout($sessionId);
            }

            // Expirar la cookie en el browser (Max-Age=0)
            $response = ResponseFormatter::success(null, 'Logged out successfully', 200);
            $response = ResponseFormatter::clearSessionCookie($response);

            return $response;

        } catch (\Exception $e) {
            return ErrorHandler::handleException($e);
        }
    }

    // =========================================================================
    // GET /api/auth/me
    // =========================================================================

    /**
     * Retorna el perfil completo del usuario autenticado.
     *
     * El AuthMiddleware ya validó la sesión y adjuntó userId al request.
     * Hacemos una consulta adicional a la BD para obtener todos los campos,
     * incluyendo los de licencia de conducción (relevantes para mecánicos).
     *
     * Retorna también un campo 'driverLicense.status' calculado:
     *   'not_set'       — el usuario no ha cargado licencia
     *   'valid'         — vigente (vence en más de 30 días)
     *   'expiring_soon' — vence en 30 días o menos
     *   'expired'       — ya venció
     */
    public function me(Request $request): Response
    {
        try {
            $userId = (int)$request->getAttribute('userId');

            if ($userId === 0) {
                return ResponseFormatter::unauthorized('Authentication required');
            }

            // Consulta completa: campos básicos + licencia de conducción
            $user = Database::fetchOne(
                'SELECT id, email, first_name, last_name, phone,
                        account_status, last_login_at,
                        driver_license_number,
                        driver_license_expiration_date,
                        driver_license_document_url,
                        driver_license_uploaded_at
                 FROM users
                 WHERE id = ? AND deleted_at IS NULL',
                [$userId]
            );

            if ($user === null) {
                return ResponseFormatter::unauthorized('User not found');
            }

            $roles         = $this->roleValidator->getUserRoles($userId);
            $licenseStatus = $this->resolveLicenseStatus($user['driver_license_expiration_date'] ?? null);

            $responseData = [
                'id'            => (int)$user['id'],
                'email'         => $user['email'],
                'firstName'     => $user['first_name'],
                'lastName'      => $user['last_name'],
                'phone'         => $user['phone'],
                'accountStatus' => $user['account_status'],
                'lastLoginAt'   => $user['last_login_at'],
                'roles'         => $roles,
                // Bloque de licencia: siempre presente (campos null si no se cargó)
                'driverLicense' => [
                    'number'         => $user['driver_license_number'],
                    'expirationDate' => $user['driver_license_expiration_date'],
                    'documentUrl'    => $user['driver_license_document_url'],
                    'uploadedAt'     => $user['driver_license_uploaded_at'],
                    'status'         => $licenseStatus,
                ],
            ];

            return ResponseFormatter::success($responseData, 'User retrieved successfully', 200);

        } catch (\Exception $e) {
            return ErrorHandler::handleException($e);
        }
    }

    // =========================================================================
    // PUT /api/auth/profile
    // =========================================================================

    /**
     * Actualiza los campos del perfil del usuario autenticado.
     *
     * Campos actualizables:
     *   phone                          — todos los usuarios
     *   driver_license_number          — principalmente mecánicos
     *   driver_license_expiration_date — principalmente mecánicos (YYYY-MM-DD)
     *   driver_license_document_url    — URL del documento cargado
     *
     * No se permite cambiar el email (identificador único) ni la contraseña
     * por este endpoint. El email es inmutable; la contraseña tendrá su propio
     * endpoint en versiones futuras.
     */
    public function updateProfile(Request $request): Response
    {
        try {
            $ctValidation = RequestValidator::validateContentType($request, 'PUT');
            if (!$ctValidation['valid']) {
                return ResponseFormatter::error($ctValidation['error'], null, $ctValidation['statusCode']);
            }

            $jsonValidation = RequestValidator::parseJsonBody($request);
            if (!$jsonValidation['valid']) {
                return ResponseFormatter::error($jsonValidation['error'], null, $jsonValidation['statusCode']);
            }

            $userId     = (int)$request->getAttribute('userId');
            $updateData = ['updated_at' => date('Y-m-d H:i:s')];
            $errors     = [];

            // --- phone ---
            if ($request->input('phone') !== null) {
                $phone = RequestValidator::sanitizeString($request->input('phone'));
                if (strlen($phone) > 20) {
                    $errors['phone'] = 'Phone must not exceed 20 characters';
                } else {
                    $updateData['phone'] = $phone ?: null;
                }
            }

            // --- driver_license_number ---
            if ($request->input('driver_license_number') !== null) {
                $num = RequestValidator::sanitizeString($request->input('driver_license_number'));
                if (strlen($num) > 50) {
                    $errors['driver_license_number'] = 'License number must not exceed 50 characters';
                } else {
                    $updateData['driver_license_number'] = $num ?: null;
                }
            }

            // --- driver_license_expiration_date (YYYY-MM-DD) ---
            if ($request->input('driver_license_expiration_date') !== null) {
                $dateStr = $request->input('driver_license_expiration_date');
                $parsed  = \DateTime::createFromFormat('Y-m-d', $dateStr);
                if (!$parsed || $parsed->format('Y-m-d') !== $dateStr) {
                    $errors['driver_license_expiration_date'] = 'Date must be in YYYY-MM-DD format';
                } else {
                    $updateData['driver_license_expiration_date'] = $dateStr;
                }
            }

            // --- driver_license_document_url ---
            if ($request->input('driver_license_document_url') !== null) {
                $url = $request->input('driver_license_document_url');
                if (!empty($url) && (strlen($url) > 500 || !filter_var($url, FILTER_VALIDATE_URL))) {
                    $errors['driver_license_document_url'] = 'Must be a valid URL not exceeding 500 characters';
                } else {
                    $updateData['driver_license_document_url'] = $url ?: null;
                    // Registrar cuándo se subió el documento
                    if (!empty($url)) {
                        $updateData['driver_license_uploaded_at'] = date('Y-m-d H:i:s');
                    }
                }
            }

            if (!empty($errors)) {
                return ResponseFormatter::validationError($errors);
            }

            // Si solo tiene 'updated_at', no hay nada que actualizar
            if (count($updateData) === 1) {
                return ResponseFormatter::error('No fields provided to update', null, 400);
            }

            Database::update('users', $updateData, 'id = ?', [$userId]);

            // Retornar el perfil actualizado (reutiliza la lógica de me())
            return $this->me($request);

        } catch (\Exception $e) {
            return ErrorHandler::handleException($e);
        }
    }

    // =========================================================================
    // GET /api/auth/health
    // =========================================================================

    /**
     * Health-check del servicio. Verifica la conexión a la BD.
     * Útil para monitoreo y para el load balancer en producción.
     */
    public function health(Request $request): Response
    {
        $startTime = microtime(true);

        try {
            $result = Database::fetchOne('SELECT 1 as test');
            if ($result === null || (int)$result['test'] !== 1) {
                throw new \Exception('Database health check query returned unexpected result');
            }

            $responseTime = round((microtime(true) - $startTime) * 1000, 2);

            return ResponseFormatter::success([
                'status'       => 'healthy',
                'version'      => '1.0.0',
                'timestamp'    => date('Y-m-d H:i:s'),
                'responseTime' => $responseTime,
            ], 'Service is healthy', 200);

        } catch (\Exception $e) {
            $responseTime = round((microtime(true) - $startTime) * 1000, 2);
            ErrorHandler::logException($e);

            return ResponseFormatter::error('Service is unhealthy', [
                'status'       => 'unhealthy',
                'version'      => '1.0.0',
                'timestamp'    => date('Y-m-d H:i:s'),
                'responseTime' => $responseTime,
            ], 503);
        }
    }

    // =========================================================================
    // Helpers privados
    // =========================================================================

    /**
     * Calcula el estado de la licencia de conducción para mostrar en el frontend.
     *
     * @param string|null $expirationDate Fecha en formato Y-m-d o null
     * @return string 'not_set' | 'expired' | 'expiring_soon' | 'valid'
     */
    private function resolveLicenseStatus(?string $expirationDate): string
    {
        if (empty($expirationDate)) {
            return 'not_set';
        }

        $today     = new \DateTime('today');
        $expiry    = new \DateTime($expirationDate);
        // format('%r%a'): prefijo '-' si el resultado es negativo (fecha pasada)
        $daysToExp = (int)$today->diff($expiry)->format('%r%a');

        if ($daysToExp < 0) {
            return 'expired';
        }
        if ($daysToExp <= 30) {
            return 'expiring_soon';
        }
        return 'valid';
    }
}
