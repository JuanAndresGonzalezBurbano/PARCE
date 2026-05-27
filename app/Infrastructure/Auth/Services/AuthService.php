<?php

namespace App\Infrastructure\Auth\Services;

use App\Core\Database;
use App\Infrastructure\Auth\DTO\AuthResult;
use App\Infrastructure\Auth\DTO\SessionData;
use App\Infrastructure\Auth\Exceptions\AuthenticationException;

/**
 * Authentication Service
 * 
 * Core authentication service handling login, logout, session validation,
 * and credential verification with timing-attack protection.
 * 
 * Requirements: 3.1-3.7, 14.1-14.4, 15.1-15.4, 16.1-16.4, 18.1-18.5, 20.1-20.4, 24.1-24.4
 */
class AuthService
{
    private PasswordHasher $passwordHasher;
    private SessionManager $sessionManager;
    private ?SessionData $currentSession = null;
    private ?array $currentUser = null;
    
    /**
     * Create a new AuthService instance
     * 
     * @param PasswordHasher $passwordHasher Password hashing service
     * @param SessionManager $sessionManager Session management service
     */
    public function __construct(
        PasswordHasher $passwordHasher,
        SessionManager $sessionManager
    ) {
        $this->passwordHasher = $passwordHasher;
        $this->sessionManager = $sessionManager;
    }
    
    /**
     * Authenticate user with email and password
     * 
     * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 16.1, 16.2, 16.3, 16.4,
     *               18.1, 18.2, 18.3, 18.4, 20.1, 20.2, 24.1, 24.2, 24.3, 24.4
     * 
     * @param string $email User email address
     * @param string $password Plain text password
     * @param bool $remember Enable "remember me" functionality
     * @param string $ipAddress Client IP address for logging and session tracking
     * @param string $userAgent Client user agent for session tracking
     * @return AuthResult Authentication result with session data
     */
    public function authenticate(
        string $email, 
        string $password, 
        bool $remember = false,
        string $ipAddress = '0.0.0.0',
        string $userAgent = ''
    ): AuthResult {
        // Requirement 18.2: Validate email format
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return AuthResult::failure('Invalid credentials');
        }
        
        // Requirement 18.3: Validate password is not empty
        if (empty($password) || strlen($password) < 8) {
            return AuthResult::failure('Invalid credentials');
        }
        
        try {
            // Requirement 3.1: Fetch user from database by email
            $user = Database::fetchOne(
                'SELECT id, email, password_hash, account_status 
                 FROM users 
                 WHERE email = ? AND deleted_at IS NULL',
                [$email]
            );
            
            // Requirement 3.3, 24.1, 24.3: Handle user not found (timing-safe)
            if ($user === null) {
                // Requirement 24.1: Perform dummy hash to prevent timing attacks
                $this->passwordHasher->hash('dummy_password_for_timing_safety_' . bin2hex(random_bytes(8)));
                // Requirement 18.4, 20.2: Generic error message (no user enumeration) + log IP
                error_log("Authentication failed: User not found for email {$email} from IP {$ipAddress}");
                return AuthResult::failure('Invalid credentials');
            }
            
            // Requirement 3.4: Check account status
            if ($user['account_status'] !== 'active') {
                error_log("Authentication failed: Inactive account for email {$email} from IP {$ipAddress}");
                return AuthResult::failure('Account is not active');
            }
            
            // Requirement 3.5: Verify password using PasswordHasher
            $isValid = $this->passwordHasher->verify($password, $user['password_hash']);
            
            // Requirement 3.7: If password invalid, return failure
            if (!$isValid) {
                error_log("Authentication failed: Invalid password for email {$email} from IP {$ipAddress}");
                return AuthResult::failure('Invalid credentials');
            }
            
            // Requirement 16.1, 16.2: Check if password needs rehashing
            if ($this->passwordHasher->needsRehash($user['password_hash'])) {
                // Requirement 16.3, 16.4: Rehash password transparently
                $newHash = $this->passwordHasher->hash($password);
                Database::update('users', [
                    'password_hash' => $newHash
                ], 'id = ?', [$user['id']]);
            }
            
            // Requirement 3.5: Create session using SessionManager
            $sessionId = $this->sessionManager->create((int)$user['id'], [
                'ip_address' => $ipAddress,
                'user_agent' => $userAgent,
                'remember' => $remember
            ]);
            
            // Requirement 3.6, 20.2: Update user's last login timestamp and IP address
            Database::update('users', [
                'last_login_at' => date('Y-m-d H:i:s'),
                'last_login_ip' => $ipAddress
            ], 'id = ?', [$user['id']]);
            
            // Log successful authentication with IP
            error_log("Authentication successful: User {$user['id']} ({$email}) logged in from IP {$ipAddress}");
            
            // Requirement 3.1: Return success with userId and sessionId
            return AuthResult::success((int)$user['id'], $sessionId);
            
        } catch (AuthenticationException $e) {
            // Requirement 18.5: Log authentication failures
            error_log("Authentication failed for email {$email}: " . $e->getMessage());
            return AuthResult::failure('Authentication error occurred');
        } catch (\Exception $e) {
            // Requirement 18.1: Handle database connection failures gracefully
            error_log("Authentication error for email {$email}: " . $e->getMessage());
            return AuthResult::failure('Authentication service unavailable');
        }
    }
    
    /**
     * Log out user by destroying session
     * 
     * Requirements: 15.1, 15.2, 15.3, 15.4
     * 
     * @param string $sessionId Session ID to destroy
     * @return bool True if session was destroyed, false otherwise
     */
    public function logout(string $sessionId): bool
    {
        // Requirement 15.1, 15.4: Destroy session via SessionManager
        $destroyed = $this->sessionManager->destroy($sessionId);
        
        // Clear cached session data
        $this->currentSession = null;
        $this->currentUser = null;
        
        // Requirement 15.2, 15.3: Return true if destroyed, false if invalid
        return $destroyed;
    }
    
    /**
     * Validate session and return session data
     * 
     * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6
     * 
     * @param string $sessionId Session ID to validate
     * @return SessionData|null Session data if valid, null otherwise
     */
    public function validateSession(string $sessionId): ?SessionData
    {
        // Delegate to SessionManager
        return $this->sessionManager->validate($sessionId);
    }
    
    /**
     * Check if user is currently authenticated
     * 
     * Requirements: 14.1, 14.2
     * 
     * @return bool True if authenticated, false otherwise
     */
    public function isAuthenticated(): bool
    {
        // Check if we have a cached session
        if ($this->currentSession !== null) {
            return true;
        }
        
        // Try to get session from cookie
        $sessionId = $_COOKIE['parce_session'] ?? null;
        if ($sessionId === null) {
            return false;
        }
        
        // Validate session
        $this->currentSession = $this->sessionManager->validate($sessionId);
        
        // Requirement 14.1: Return true if valid session exists
        // Requirement 14.2: Return false if no session exists
        return $this->currentSession !== null;
    }
    
    /**
     * Get current authenticated user data
     * 
     * Requirements: 14.3, 14.4
     * 
     * @return array|null User data if authenticated, null otherwise
     */
    public function getCurrentUser(): ?array
    {
        // Return cached user if available
        if ($this->currentUser !== null) {
            return $this->currentUser;
        }
        
        // Check if authenticated
        if (!$this->isAuthenticated()) {
            // Requirement 14.4: Return null if no session exists
            return null;
        }
        
        // Requirement 14.3: Fetch user data from database
        $this->currentUser = Database::fetchOne(
            'SELECT id, email, first_name, last_name, account_status, last_login_at
             FROM users
             WHERE id = ? AND deleted_at IS NULL',
            [$this->currentSession->userId]
        );
        
        return $this->currentUser;
    }
    
    /**
     * Refresh session activity timestamp
     * 
     * Requirements: 20.1, 20.2, 20.3, 20.4
     * 
     * @param string $sessionId Session ID to refresh
     * @return bool True if refreshed, false if session doesn't exist
     */
    public function refreshSession(string $sessionId): bool
    {
        // Requirement 20.1, 20.4: Update last_activity via validate()
        $sessionData = $this->sessionManager->validate($sessionId);
        
        // Requirement 20.2: Return false if session doesn't exist
        // Requirement 20.3: Return true if session was refreshed
        return $sessionData !== null;
    }
}
