<?php

namespace App\Shared\Http;

use App\Core\Response;
use App\Infrastructure\Auth\Exceptions\AuthenticationException;

/**
 * Error Handler
 * 
 * Handles exception to HTTP status code mapping, error logging, and
 * standardized error response generation. Prevents information disclosure
 * by returning generic error messages to clients while logging full details.
 * 
 * Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7
 */
class ErrorHandler
{
    /**
     * Handle exception and return standardized error response
     * 
     * Requirements: 11.1, 11.5, 11.6, 11.7
     * 
     * @param \Throwable $e Exception to handle
     * @return Response Standardized error response
     */
    public static function handleException(\Throwable $e): Response
    {
        // Log full exception details for debugging
        self::logException($e);

        // Map exception to HTTP status code
        $statusCode = self::mapExceptionToStatusCode($e);

        // Get generic error message (no stack traces)
        $message = self::getGenericErrorMessage($statusCode);

        // Return standardized error response
        return ResponseFormatter::error($message, null, $statusCode);
    }

    /**
     * Map exception to HTTP status code
     * 
     * Requirement 11.7: Map AuthenticationException to HTTP 401
     * 
     * @param \Throwable $e Exception
     * @return int HTTP status code
     */
    public static function mapExceptionToStatusCode(\Throwable $e): int
    {
        // AuthenticationException → 401
        if ($e instanceof AuthenticationException) {
            return 401;
        }

        // InvalidArgumentException → 400
        if ($e instanceof \InvalidArgumentException) {
            return 400;
        }

        // PDOException → 500
        if ($e instanceof \PDOException) {
            return 500;
        }

        // Default → 500
        return 500;
    }

    /**
     * Get generic error message for status code
     * 
     * Requirement 11.6: Return generic error message (no stack traces)
     * 
     * @param int $statusCode HTTP status code
     * @return string Generic error message
     */
    public static function getGenericErrorMessage(int $statusCode): string
    {
        return match ($statusCode) {
            400 => 'Bad request',
            401 => 'Unauthorized',
            403 => 'Forbidden',
            404 => 'Not found',
            409 => 'Conflict',
            429 => 'Too many requests',
            500 => 'Internal server error',
            503 => 'Service unavailable',
            default => 'An error occurred',
        };
    }

    /**
     * Log exception with full details
     * 
     * Requirement 11.5: Log full error details for debugging
     * 
     * @param \Throwable $e Exception to log
     * @return void
     */
    public static function logException(\Throwable $e): void
    {
        $logDir = __DIR__ . '/../../../storage/logs';
        
        if (!is_dir($logDir)) {
            @mkdir($logDir, 0755, true);
        }

        $logFile = $logDir . '/error-' . date('Y-m-d') . '.log';

        // Format exception details
        $message = sprintf(
            "[%s] %s: %s in %s:%d\nStack trace:\n%s\n\n",
            date('Y-m-d H:i:s'),
            get_class($e),
            $e->getMessage(),
            $e->getFile(),
            $e->getLine(),
            $e->getTraceAsString()
        );

        // Write to log file
        @file_put_contents($logFile, $message, FILE_APPEND);
    }

    /**
     * Format validation errors for response
     * 
     * Requirement 11.4: Include fields with field-specific error messages
     * 
     * @param array $errors Field-specific validation errors
     * @return Response Validation error response
     */
    public static function validationError(array $errors): Response
    {
        return ResponseFormatter::validationError($errors, 400);
    }
}
