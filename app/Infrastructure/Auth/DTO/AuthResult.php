<?php

namespace App\Infrastructure\Auth\DTO;

use InvalidArgumentException;

/**
 * Authentication Result DTO
 * 
 * Immutable data transfer object representing the result of an authentication attempt.
 * Contains success status, user/session identifiers, and error information.
 * 
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 25.1
 */
readonly class AuthResult
{
    /**
     * Create a new authentication result
     * 
     * @param bool $success Whether authentication succeeded
     * @param int|null $userId User ID (required if success=true)
     * @param string|null $sessionId Session ID (required if success=true)
     * @param string|null $message Result message (required if success=false)
     * @param array|null $errors Optional validation errors
     * 
     * @throws InvalidArgumentException If validation fails
     */
    public function __construct(
        public bool $success,
        public ?int $userId,
        public ?string $sessionId,
        public ?string $message,
        public ?array $errors = null
    ) {
        // Requirement 10.3: If success is true, userId and sessionId must not be null
        if ($this->success && ($this->userId === null || $this->sessionId === null)) {
            throw new InvalidArgumentException(
                'userId and sessionId are required when success is true'
            );
        }
        
        // Requirement 10.4: If success is false, message must be provided
        if (!$this->success && empty($this->message)) {
            throw new InvalidArgumentException(
                'message is required when success is false'
            );
        }
    }
    
    /**
     * Create a successful authentication result
     * 
     * @param int $userId User ID
     * @param string $sessionId Session ID
     * @return self
     */
    public static function success(int $userId, string $sessionId): self
    {
        return new self(
            success: true,
            userId: $userId,
            sessionId: $sessionId,
            message: 'Authentication successful'
        );
    }
    
    /**
     * Create a failed authentication result
     * 
     * @param string $message Error message
     * @param array|null $errors Optional validation errors
     * @return self
     */
    public static function failure(string $message, ?array $errors = null): self
    {
        return new self(
            success: false,
            userId: null,
            sessionId: null,
            message: $message,
            errors: $errors
        );
    }
}
