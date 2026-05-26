<?php

namespace App\Infrastructure\Auth\DTO;

use InvalidArgumentException;

/**
 * Cookie Configuration DTO
 * 
 * Immutable data transfer object defining secure cookie parameters for session management.
 * Enforces security best practices including HttpOnly, Secure, and SameSite flags.
 * 
 * Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 25.3
 */
readonly class CookieConfig
{
    /**
     * Create a new cookie configuration
     * 
     * @param string $name Cookie name
     * @param int $lifetime Cookie lifetime in seconds
     * @param string $path Cookie path
     * @param string $domain Cookie domain
     * @param bool $secure Secure flag (HTTPS only)
     * @param bool $httpOnly HttpOnly flag (prevents JavaScript access)
     * @param string $sameSite SameSite policy ('Strict', 'Lax', or 'None')
     * 
     * @throws InvalidArgumentException If validation fails
     */
    public function __construct(
        public string $name,
        public int $lifetime,
        public string $path,
        public string $domain,
        public bool $secure,
        public bool $httpOnly,
        public string $sameSite
    ) {
        // Requirement 12.5: Path must start with '/'
        if (!str_starts_with($this->path, '/')) {
            throw new InvalidArgumentException(
                "Cookie path must start with '/'"
            );
        }
        
        // Requirement 12.3: SameSite must be 'Strict', 'Lax', or 'None'
        if (!in_array($this->sameSite, ['Strict', 'Lax', 'None'], true)) {
            throw new InvalidArgumentException(
                "SameSite must be 'Strict', 'Lax', or 'None'"
            );
        }
        
        // Validate lifetime is positive
        if ($this->lifetime <= 0) {
            throw new InvalidArgumentException(
                'Cookie lifetime must be a positive integer'
            );
        }
        
        // Validate name is not empty
        if (empty($this->name)) {
            throw new InvalidArgumentException(
                'Cookie name cannot be empty'
            );
        }
    }
    
    /**
     * Create a secure cookie configuration with recommended defaults
     * 
     * Requirements: 12.1, 12.2, 12.3, 12.4, 12.6
     * 
     * @return self
     */
    public static function secure(): self
    {
        return new self(
            name: 'parce_session',
            lifetime: 7200, // 2 hours (Requirement 12.4)
            path: '/',
            domain: '',
            secure: true, // Requirement 12.2
            httpOnly: true, // Requirement 12.1
            sameSite: 'Lax' // Requirement 12.3
        );
    }
}
