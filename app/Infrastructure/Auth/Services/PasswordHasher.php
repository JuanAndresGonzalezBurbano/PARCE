<?php

namespace App\Infrastructure\Auth\Services;

use App\Infrastructure\Auth\Exceptions\AuthenticationException;

/**
 * Password Hasher Service
 * 
 * Provides secure password hashing and verification using Argon2id algorithm.
 * Implements timing-attack protection and automatic hash upgrades.
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 16.1
 */
class PasswordHasher
{
    /**
     * Minimum password length
     */
    private const MIN_PASSWORD_LENGTH = 8;
    
    /**
     * Hash a password using Argon2id algorithm
     * 
     * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5
     * 
     * @param string $password Plain text password
     * @return string Argon2id hash
     * @throws AuthenticationException If password is invalid
     */
    public function hash(string $password): string
    {
        // Requirement 1.4: Reject passwords shorter than 8 characters
        if (strlen($password) < self::MIN_PASSWORD_LENGTH) {
            throw new AuthenticationException(
                'Password must be at least ' . self::MIN_PASSWORD_LENGTH . ' characters long'
            );
        }
        
        // Requirement 1.1: Produce an Argon2id hash
        $hash = password_hash($password, PASSWORD_ARGON2ID);
        
        if ($hash === false) {
            throw new AuthenticationException(
                'Failed to hash password'
            );
        }
        
        // Requirement 1.2: Ensure hash starts with "$argon2id$" prefix
        if (!str_starts_with($hash, '$argon2id$')) {
            throw new AuthenticationException(
                'Hash algorithm verification failed'
            );
        }
        
        // Requirement 1.3: Each hash is different due to unique salt
        // Requirement 1.5: Original password cannot be recovered
        
        return $hash;
    }
    
    /**
     * Verify a password against a hash using timing-safe comparison
     * 
     * Requirements: 2.1, 2.2, 2.3, 2.4
     * 
     * @param string $password Plain text password to verify
     * @param string $hash Password hash to verify against
     * @return bool True if password matches, false otherwise
     */
    public function verify(string $password, string $hash): bool
    {
        // Requirement 2.1, 2.4: Use timing-safe comparison via password_verify()
        // password_verify() uses constant-time comparison internally
        $result = password_verify($password, $hash);
        
        // Requirement 2.2: Return true for correct password
        // Requirement 2.3: Return false for incorrect password
        return $result;
    }
    
    /**
     * Check if a hash needs rehashing with current algorithm parameters
     * 
     * Requirements: 2.5, 16.1
     * 
     * @param string $hash Password hash to check
     * @return bool True if hash needs rehashing, false otherwise
     */
    public function needsRehash(string $hash): bool
    {
        // Requirement 2.5: Detect if hash uses outdated algorithm
        return password_needs_rehash($hash, PASSWORD_ARGON2ID);
    }
}
