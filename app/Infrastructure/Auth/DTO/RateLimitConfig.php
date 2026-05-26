<?php

namespace App\Infrastructure\Auth\DTO;

use InvalidArgumentException;

/**
 * Rate Limit Configuration DTO
 * 
 * Immutable data transfer object defining rate limiting parameters for authentication attempts.
 * Enforces bounds on attempts, decay period, and lockout duration.
 * 
 * Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 25.4
 */
readonly class RateLimitConfig
{
    /**
     * Create a new rate limit configuration
     * 
     * @param int $maxAttempts Maximum allowed attempts (1-100)
     * @param int $decayMinutes Time window in minutes (1-1440)
     * @param int $lockoutMinutes Account lockout duration in minutes (1-1440)
     * 
     * @throws InvalidArgumentException If validation fails
     */
    public function __construct(
        public int $maxAttempts,
        public int $decayMinutes,
        public int $lockoutMinutes
    ) {
        // Requirement 13.1: maxAttempts must be between 1 and 100
        if ($this->maxAttempts < 1 || $this->maxAttempts > 100) {
            throw new InvalidArgumentException(
                'maxAttempts must be between 1 and 100'
            );
        }
        
        // Requirement 13.2: decayMinutes must be between 1 and 1440
        if ($this->decayMinutes < 1 || $this->decayMinutes > 1440) {
            throw new InvalidArgumentException(
                'decayMinutes must be between 1 and 1440'
            );
        }
        
        // Requirement 13.3: lockoutMinutes must be between 1 and 1440
        if ($this->lockoutMinutes < 1 || $this->lockoutMinutes > 1440) {
            throw new InvalidArgumentException(
                'lockoutMinutes must be between 1 and 1440'
            );
        }
    }
    
    /**
     * Create a default rate limit configuration
     * 
     * Requirement 13.4: maxAttempts=5, decayMinutes=15, lockoutMinutes=30
     * 
     * @return self
     */
    public static function default(): self
    {
        return new self(
            maxAttempts: 5,
            decayMinutes: 15,
            lockoutMinutes: 30
        );
    }
    
    /**
     * Create a strict rate limit configuration
     * 
     * Requirement 13.5: maxAttempts=3, decayMinutes=10, lockoutMinutes=60
     * 
     * @return self
     */
    public static function strict(): self
    {
        return new self(
            maxAttempts: 3,
            decayMinutes: 10,
            lockoutMinutes: 60
        );
    }
}
