<?php

namespace App\Infrastructure\Auth\Exceptions;

use Exception;

/**
 * Authentication Exception
 * 
 * Thrown when authentication operations fail due to invalid credentials,
 * validation errors, or security violations.
 */
class AuthenticationException extends Exception
{
    /**
     * Create a new authentication exception
     * 
     * @param string $message Error message
     * @param int $code Error code (default: 0)
     * @param Exception|null $previous Previous exception for chaining
     */
    public function __construct(
        string $message = "",
        int $code = 0,
        ?Exception $previous = null
    ) {
        parent::__construct($message, $code, $previous);
    }
}
