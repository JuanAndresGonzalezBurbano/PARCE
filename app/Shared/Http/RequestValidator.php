<?php

namespace App\Shared\Http;

use App\Core\Request;

/**
 * Request Validator
 * 
 * Validates HTTP requests for API endpoints including email format,
 * password strength, field presence, Content-Type, JSON parsing, and body size limits.
 * 
 * Requirements: 7.1-7.7, 15.1-15.7, 16.1-16.7
 */
class RequestValidator
{
    /**
     * Maximum request body size in bytes (1 MB)
     */
    private const MAX_BODY_SIZE = 1048576; // 1 MB

    /**
     * Minimum password length
     */
    private const MIN_PASSWORD_LENGTH = 8;

    /**
     * Maximum password length
     */
    private const MAX_PASSWORD_LENGTH = 128;

    /**
     * Maximum email length
     */
    private const MAX_EMAIL_LENGTH = 255;

    /**
     * Validate email format
     * 
     * Requirement 7.1: Verify email is valid format
     * 
     * @param string $email Email address to validate
     * @return bool True if valid, false otherwise
     */
    public static function isValidEmail(string $email): bool
    {
        // Check length
        if (strlen($email) > self::MAX_EMAIL_LENGTH) {
            return false;
        }

        // Validate format using filter_var
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return false;
        }

        // Additional pattern check for stricter validation
        $pattern = '/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/';
        return preg_match($pattern, $email) === 1;
    }

    /**
     * Validate password strength
     * 
     * Requirement 7.2: Verify password is non-empty string with at least 8 characters
     * 
     * @param string $password Password to validate
     * @return bool True if valid, false otherwise
     */
    public static function isValidPassword(string $password): bool
    {
        $length = strlen($password);
        
        // Check minimum length
        if ($length < self::MIN_PASSWORD_LENGTH) {
            return false;
        }

        // Check maximum length
        if ($length > self::MAX_PASSWORD_LENGTH) {
            return false;
        }

        // Check for null bytes (security)
        if (str_contains($password, "\0")) {
            return false;
        }

        return true;
    }

    /**
     * Validate required fields are present
     * 
     * Requirement 7.5: Verify required fields are present
     * 
     * @param Request $request HTTP request object
     * @param array $requiredFields Array of required field names
     * @return array Array of missing field names (empty if all present)
     */
    public static function validateRequiredFields(Request $request, array $requiredFields): array
    {
        $missing = [];
        
        foreach ($requiredFields as $field) {
            if (!$request->has($field) || $request->input($field) === '' || $request->input($field) === null) {
                $missing[] = $field;
            }
        }
        
        return $missing;
    }

    /**
     * Validate Content-Type header
     * 
     * Requirements: 15.1, 15.2, 15.3, 15.4, 15.5
     * 
     * @param Request $request HTTP request object
     * @param string $method HTTP method (GET, POST, etc.)
     * @return array Error array with 'valid' boolean and optional 'error' message
     */
    public static function validateContentType(Request $request, string $method): array
    {
        // GET and OPTIONS requests don't require Content-Type validation
        if (in_array(strtoupper($method), ['GET', 'OPTIONS'])) {
            return ['valid' => true];
        }

        $contentType = $request->header('Content-Type', '');
        
        // Missing Content-Type
        if (empty($contentType)) {
            return [
                'valid' => false,
                'error' => 'Content-Type header is required',
                'statusCode' => 415
            ];
        }

        // Normalize content type (remove charset and whitespace)
        $baseType = strtolower(trim(explode(';', $contentType)[0]));

        // Check if base type is application/json
        if ($baseType !== 'application/json') {
            return [
                'valid' => false,
                'error' => 'Content-Type must be application/json',
                'statusCode' => 415
            ];
        }

        return ['valid' => true];
    }

    /**
     * Parse and validate JSON request body
     * 
     * Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 16.7
     * 
     * @param Request $request HTTP request object
     * @return array Result array with 'valid' boolean, optional 'data' or 'error'
     */
    public static function parseJsonBody(Request $request): array
    {
        // Check request body size
        $bodySize = (int)$request->header('Content-Length', 0);
        if ($bodySize > self::MAX_BODY_SIZE) {
            return [
                'valid' => false,
                'error' => 'Request body too large (max 1 MB)',
                'statusCode' => 413
            ];
        }

        // Get raw body
        $rawBody = file_get_contents('php://input');

        // Check if body is empty for POST requests
        if (empty($rawBody) && $request->method() === 'POST') {
            return [
                'valid' => false,
                'error' => 'Request body cannot be empty',
                'statusCode' => 400
            ];
        }

        // Parse JSON
        $data = json_decode($rawBody, true);

        // Check for JSON parsing errors
        if (json_last_error() !== JSON_ERROR_NONE) {
            return [
                'valid' => false,
                'error' => 'Invalid JSON format',
                'statusCode' => 400
            ];
        }

        // Verify result is a JSON object (not array or primitive)
        if (!is_array($data) || array_keys($data) === range(0, count($data) - 1)) {
            return [
                'valid' => false,
                'error' => 'Request body must be a JSON object',
                'statusCode' => 400
            ];
        }

        return [
            'valid' => true,
            'data' => $data
        ];
    }

    /**
     * Sanitize string input to prevent injection attacks
     * 
     * Requirement 7.6: Sanitize all string inputs
     * 
     * @param string $input Input string to sanitize
     * @return string Sanitized string
     */
    public static function sanitizeString(string $input): string
    {
        // Remove null bytes
        $input = str_replace("\0", '', $input);
        
        // Trim whitespace
        $input = trim($input);
        
        return $input;
    }

    /**
     * Validate all login request fields
     * 
     * Requirements: 7.1, 7.2, 7.3, 7.5
     * 
     * @param Request $request HTTP request object
     * @return array Validation result with 'valid' boolean and optional 'errors' array
     */
    public static function validateLoginRequest(Request $request): array
    {
        $errors = [];

        // Check required fields
        $missing = self::validateRequiredFields($request, ['email', 'password']);
        if (!empty($missing)) {
            return [
                'valid' => false,
                'errors' => [
                    'error' => 'Missing required fields',
                    'fields' => $missing
                ]
            ];
        }

        // Validate email
        $email = $request->input('email');
        if (!self::isValidEmail($email)) {
            $errors['email'] = ['Invalid email format'];
        }

        // Validate password
        $password = $request->input('password');
        if (!self::isValidPassword($password)) {
            $errors['password'] = ['Password must be between 8 and 128 characters'];
        }

        if (!empty($errors)) {
            return [
                'valid' => false,
                'errors' => $errors
            ];
        }

        return ['valid' => true];
    }

    /**
     * Validate registration request fields
     * 
     * @param Request $request HTTP request object
     * @return array Validation result with 'valid' boolean and optional 'errors' array
     */
    public static function validateRegistrationRequest(Request $request): array
    {
        $errors = [];

        // Check required fields
        $missing = self::validateRequiredFields($request, [
            'email',
            'password',
            'password_confirmation',
            'first_name',
            'last_name'
        ]);
        
        if (!empty($missing)) {
            return [
                'valid' => false,
                'errors' => [
                    'error' => 'Missing required fields',
                    'fields' => $missing
                ]
            ];
        }

        // Validate email
        $email = $request->input('email');
        if (!self::isValidEmail($email)) {
            $errors['email'] = ['Invalid email format'];
        }

        // Validate password
        $password = $request->input('password');
        if (!self::isValidPassword($password)) {
            $errors['password'] = ['Password must be between 8 and 128 characters'];
        }

        // Validate password confirmation
        $passwordConfirmation = $request->input('password_confirmation');
        if ($password !== $passwordConfirmation) {
            $errors['password_confirmation'] = ['Password confirmation does not match'];
        }

        if (!empty($errors)) {
            return [
                'valid' => false,
                'errors' => $errors
            ];
        }

        return ['valid' => true];
    }
}
