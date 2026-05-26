<?php

namespace App\Infrastructure\Auth\DTO;

use InvalidArgumentException;

/**
 * Session Data DTO
 * 
 * Immutable data transfer object representing validated session information.
 * Includes user ID, timestamps, metadata, and validation methods for expiration and idle timeout.
 * 
 * Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 25.2
 */
readonly class SessionData
{
    /**
     * Create a new session data object
     * 
     * @param string $id Session ID
     * @param int $userId User ID
     * @param string $ipAddress Client IP address
     * @param string $userAgent Client user agent
     * @param int $lastActivity Last activity timestamp (Unix timestamp)
     * @param int $createdAt Creation timestamp (Unix timestamp)
     * @param int|null $expiresAt Expiration timestamp (Unix timestamp, null for no expiration)
     * 
     * @throws InvalidArgumentException If validation fails
     */
    public function __construct(
        public string $id,
        public int $userId,
        public string $ipAddress,
        public string $userAgent,
        public int $lastActivity,
        public int $createdAt,
        public ?int $expiresAt = null
    ) {
        // Requirement 11.3: userId must be positive integer
        if ($this->userId <= 0) {
            throw new InvalidArgumentException(
                'userId must be a positive integer'
            );
        }
        
        // Requirement 11.4: ipAddress must be valid IPv4 or IPv6 format
        if (!filter_var($this->ipAddress, FILTER_VALIDATE_IP)) {
            throw new InvalidArgumentException(
                'ipAddress must be a valid IPv4 or IPv6 address'
            );
        }
        
        // Requirement 11.5: lastActivity must be valid Unix timestamp
        if ($this->lastActivity <= 0) {
            throw new InvalidArgumentException(
                'lastActivity must be a valid Unix timestamp'
            );
        }
        
        // Requirement 11.5: createdAt must be valid Unix timestamp
        if ($this->createdAt <= 0) {
            throw new InvalidArgumentException(
                'createdAt must be a valid Unix timestamp'
            );
        }
        
        // Validate session ID is not empty
        if (empty($this->id)) {
            throw new InvalidArgumentException(
                'Session ID cannot be empty'
            );
        }
    }
    
    /**
     * Check if session is expired
     * 
     * Requirement 11.1: Returns true if current time exceeds expiresAt
     * 
     * @return bool
     */
    public function isExpired(): bool
    {
        return $this->expiresAt !== null && time() > $this->expiresAt;
    }
    
    /**
     * Check if session is idle
     * 
     * Requirement 11.2: Returns true if time since lastActivity exceeds threshold
     * 
     * @param int $maxIdleSeconds Maximum idle time in seconds
     * @return bool
     */
    public function isIdle(int $maxIdleSeconds): bool
    {
        return (time() - $this->lastActivity) > $maxIdleSeconds;
    }
}
