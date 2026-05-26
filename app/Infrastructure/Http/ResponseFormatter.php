<?php

namespace App\Infrastructure\Http;

use App\Core\Response;

/**
 * Response Formatter
 * 
 * Standardizes API responses with consistent JSON format, secure cookie handling,
 * and proper HTTP status codes. Implements camelCase conversion and sparse JSON.
 * 
 * Requirements: 8.1-8.7, 11.1-11.7, 12.1-12.7
 */
class ResponseFormatter
{
    /**
     * Session cookie name
     */
    private const SESSION_COOKIE_NAME = 'parce_session';

    /**
     * Default cookie expiration (2 hours in seconds)
     */
    private const DEFAULT_COOKIE_EXPIRATION = 7200;

    /**
     * Remember me cookie expiration (30 days in seconds)
     */
    private const REMEMBER_COOKIE_EXPIRATION = 2592000;

    /**
     * Create standardized success response
     * 
     * Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7
     * 
     * @param mixed $data Response data (optional)
     * @param string $message Success message (optional)
     * @param int $statusCode HTTP status code (default: 200)
     * @return Response Response object
     */
    public static function success($data = null, string $message = null, int $statusCode = 200): Response
    {
        $response = new Response();
        
        // Build response array
        $responseData = ['success' => true];
        
        // Add data if provided
        if ($data !== null) {
            $responseData['data'] = self::convertToCamelCase($data);
        }
        
        // Add message if provided
        if ($message !== null) {
            $responseData['message'] = $message;
        }
        
        // Remove null fields (sparse JSON)
        $responseData = self::removeNullFields($responseData);
        
        // Set headers
        $response->setHeader('Content-Type', 'application/json; charset=utf-8');
        $response->setHeader('X-API-Version', '1.0.0');
        
        return $response->json($responseData, $statusCode);
    }

    /**
     * Create standardized error response
     * 
     * Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7
     * 
     * @param string $error Error message
     * @param array|null $fields Field-specific errors (optional)
     * @param int $statusCode HTTP status code (default: 400)
     * @return Response Response object
     */
    public static function error(string $error, ?array $fields = null, int $statusCode = 400): Response
    {
        $response = new Response();
        
        // Build response array
        $responseData = [
            'success' => false,
            'error' => $error
        ];
        
        // Add field-specific errors if provided
        if ($fields !== null && !empty($fields)) {
            $responseData['fields'] = self::convertToCamelCase($fields);
        }
        
        // Remove null fields (sparse JSON)
        $responseData = self::removeNullFields($responseData);
        
        // Set headers
        $response->setHeader('Content-Type', 'application/json; charset=utf-8');
        $response->setHeader('X-API-Version', '1.0.0');
        
        return $response->json($responseData, $statusCode);
    }

    /**
     * Set session cookie with security attributes
     * 
     * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.7
     * 
     * @param Response $response Response object
     * @param string $sessionId Session ID
     * @param bool $remember Enable remember me (30 days vs 2 hours)
     * @return Response Response object with cookie set
     */
    public static function setSessionCookie(Response $response, string $sessionId, bool $remember = false): Response
    {
        $expiration = $remember 
            ? time() + self::REMEMBER_COOKIE_EXPIRATION 
            : time() + self::DEFAULT_COOKIE_EXPIRATION;
        
        $response->setCookie(
            name: self::SESSION_COOKIE_NAME,
            value: $sessionId,
            expires: $expiration,
            path: '/',
            domain: '',
            secure: true,  // HTTPS only
            httpOnly: true // Prevent JavaScript access
        );
        
        // Note: SameSite=Strict is set via PHP ini or header
        // For PHP 7.3+, we can add it via options array
        // For now, we rely on server configuration
        
        return $response;
    }

    /**
     * Clear session cookie
     * 
     * Requirement 8.6: Set maxAge to 0 to clear cookie
     * 
     * @param Response $response Response object
     * @return Response Response object with cookie cleared
     */
    public static function clearSessionCookie(Response $response): Response
    {
        $response->setCookie(
            name: self::SESSION_COOKIE_NAME,
            value: '',
            expires: time() - 3600, // Expire in the past
            path: '/',
            domain: '',
            secure: true,
            httpOnly: true
        );
        
        return $response;
    }

    /**
     * Convert array keys to camelCase
     * 
     * Requirement 12.6: Use camelCase for all JSON field names
     * 
     * @param mixed $data Data to convert
     * @return mixed Converted data
     */
    private static function convertToCamelCase($data)
    {
        if (!is_array($data)) {
            return $data;
        }
        
        $result = [];
        
        foreach ($data as $key => $value) {
            // Convert snake_case to camelCase
            $camelKey = lcfirst(str_replace('_', '', ucwords($key, '_')));
            
            // Recursively convert nested arrays
            if (is_array($value)) {
                $result[$camelKey] = self::convertToCamelCase($value);
            } else {
                $result[$camelKey] = $value;
            }
        }
        
        return $result;
    }

    /**
     * Remove null fields from array (sparse JSON)
     * 
     * Requirement 12.7: Omit null fields from response
     * 
     * @param array $data Data array
     * @return array Array with null fields removed
     */
    private static function removeNullFields(array $data): array
    {
        return array_filter($data, function ($value) {
            // Keep false and 0, but remove null
            return $value !== null;
        });
    }

    /**
     * Create validation error response
     * 
     * Requirement 11.4: Include fields with field-specific error messages
     * 
     * @param array $errors Field-specific errors
     * @param int $statusCode HTTP status code (default: 400)
     * @return Response Response object
     */
    public static function validationError(array $errors, int $statusCode = 400): Response
    {
        return self::error(
            'Validation failed',
            $errors,
            $statusCode
        );
    }

    /**
     * Create unauthorized response
     * 
     * Requirement 11.7: Map AuthenticationException to HTTP 401
     * 
     * @param string $message Error message (default: 'Unauthorized')
     * @return Response Response object
     */
    public static function unauthorized(string $message = 'Unauthorized'): Response
    {
        return self::error($message, null, 401);
    }

    /**
     * Create forbidden response
     * 
     * @param string $message Error message (default: 'Forbidden')
     * @return Response Response object
     */
    public static function forbidden(string $message = 'Forbidden'): Response
    {
        return self::error($message, null, 403);
    }

    /**
     * Create not found response
     * 
     * @param string $message Error message (default: 'Not found')
     * @return Response Response object
     */
    public static function notFound(string $message = 'Not found'): Response
    {
        return self::error($message, null, 404);
    }

    /**
     * Create conflict response
     * 
     * @param string $message Error message
     * @return Response Response object
     */
    public static function conflict(string $message): Response
    {
        return self::error($message, null, 409);
    }

    /**
     * Create rate limit exceeded response
     * 
     * Requirement 6.3, 6.4: Return HTTP 429 with Retry-After header
     * 
     * @param int $retryAfter Seconds until rate limit resets
     * @return Response Response object
     */
    public static function rateLimitExceeded(int $retryAfter): Response
    {
        $response = self::error(
            'Too many requests',
            ['retryAfter' => $retryAfter],
            429
        );
        
        $response->setHeader('Retry-After', (string)$retryAfter);
        
        return $response;
    }

    /**
     * Create internal server error response
     * 
     * Requirement 11.6: Return generic error message (no stack traces)
     * 
     * @param string $message Error message (default: 'Internal server error')
     * @return Response Response object
     */
    public static function serverError(string $message = 'Internal server error'): Response
    {
        return self::error($message, null, 500);
    }

    /**
     * Create service unavailable response
     * 
     * @param string $message Error message (default: 'Service unavailable')
     * @return Response Response object
     */
    public static function serviceUnavailable(string $message = 'Service unavailable'): Response
    {
        return self::error($message, null, 503);
    }

    /**
     * Get session cookie name
     * 
     * @return string Cookie name
     */
    public static function getSessionCookieName(): string
    {
        return self::SESSION_COOKIE_NAME;
    }
}
