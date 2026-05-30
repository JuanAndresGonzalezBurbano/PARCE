<?php

namespace App\Middleware;

use App\Core\Request;
use App\Core\Response;

/**
 * CORS Middleware
 * 
 * Handles Cross-Origin Resource Sharing (CORS) for session-based authentication.
 * Supports credential-based requests, configurable origins, and preflight handling.
 * 
 * Configuration via .env:
 * - CORS_ALLOWED_ORIGINS: Comma-separated list of allowed origins
 * - CORS_ALLOW_CREDENTIALS: Enable credential support (default: true)
 * - CORS_MAX_AGE: Preflight cache duration in seconds (default: 86400)
 */
class CORSMiddleware
{
    /**
     * Default allowed origins (development)
     */
    private const DEFAULT_ORIGINS = 'http://localhost:3000,http://localhost:5173,http://localhost:8080';

    /**
     * Allowed HTTP methods
     */
    private const ALLOWED_METHODS = 'GET, POST, PUT, DELETE, OPTIONS, PATCH';

    /**
     * Allowed headers
     */
    private const ALLOWED_HEADERS = 'Content-Type, Accept, Authorization, X-Requested-With, X-Request-ID';

    /**
     * Exposed headers (visible to frontend)
     */
    private const EXPOSED_HEADERS = 'X-Request-ID, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset';

    /**
     * Handle CORS for incoming request
     * 
     * @param Request $request HTTP request
     * @param callable $next Next middleware
     * @return Response HTTP response
     */
    public function handle(Request $request, callable $next): Response
    {
        $origin = $request->header('Origin');

        // If no Origin header, pass through (same-origin request)
        if ($origin === null) {
            return $next($request);
        }

        // Check if origin is allowed
        if (!$this->isOriginAllowed($origin)) {
            // For security, we still process the request but don't set CORS headers
            // This prevents CORS errors for legitimate same-origin requests
            return $next($request);
        }

        // Handle preflight (OPTIONS) request
        if ($request->method() === 'OPTIONS') {
            return $this->handlePreflight($origin);
        }

        // Process actual request and add CORS headers to response
        $response = $next($request);
        return $this->addCORSHeaders($response, $origin);
    }

    /**
     * Handle preflight OPTIONS request
     * 
     * @param string $origin Request origin
     * @return Response Preflight response
     */
    private function handlePreflight(string $origin): Response
    {
        $response = new Response('', 204); // No Content

        // Add CORS headers
        $response->header('Access-Control-Allow-Origin', $origin);
        $response->header('Access-Control-Allow-Methods', self::ALLOWED_METHODS);
        $response->header('Access-Control-Allow-Headers', self::ALLOWED_HEADERS);
        $response->header('Access-Control-Max-Age', $this->getMaxAge());

        // Enable credentials if configured
        if ($this->allowCredentials()) {
            $response->header('Access-Control-Allow-Credentials', 'true');
        }

        return $response;
    }

    /**
     * Add CORS headers to response
     * 
     * @param Response $response HTTP response
     * @param string $origin Request origin
     * @return Response Response with CORS headers
     */
    private function addCORSHeaders(Response $response, string $origin): Response
    {
        // Set allowed origin (must be specific when using credentials)
        $response->header('Access-Control-Allow-Origin', $origin);

        // Enable credentials (required for session cookies)
        if ($this->allowCredentials()) {
            $response->header('Access-Control-Allow-Credentials', 'true');
        }

        // Expose headers to frontend
        $response->header('Access-Control-Expose-Headers', self::EXPOSED_HEADERS);

        // Add Vary header for proper caching
        $response->header('Vary', 'Origin');

        return $response;
    }

    /**
     * Check if origin is allowed
     * 
     * @param string $origin Request origin
     * @return bool True if allowed, false otherwise
     */
    private function isOriginAllowed(string $origin): bool
    {
        $allowedOrigins = $this->getAllowedOrigins();

        // Check for wildcard (not recommended with credentials)
        if (in_array('*', $allowedOrigins, true)) {
            return true;
        }

        // Check if origin is in allowed list
        return in_array($origin, $allowedOrigins, true);
    }

    /**
     * Get allowed origins from configuration
     * 
     * @return array Array of allowed origins
     */
    private function getAllowedOrigins(): array
    {
        $origins = $_ENV['CORS_ALLOWED_ORIGINS'] ?? self::DEFAULT_ORIGINS;

        // Split by comma and trim whitespace
        $originList = array_map('trim', explode(',', $origins));

        // Filter empty values
        return array_filter($originList, fn($origin) => !empty($origin));
    }

    /**
     * Check if credentials are allowed
     * 
     * @return bool True if credentials allowed
     */
    private function allowCredentials(): bool
    {
        $allow = $_ENV['CORS_ALLOW_CREDENTIALS'] ?? 'true';
        return strtolower($allow) === 'true';
    }

    /**
     * Get preflight cache max age
     * 
     * @return string Max age in seconds
     */
    private function getMaxAge(): string
    {
        return $_ENV['CORS_MAX_AGE'] ?? '86400'; // 24 hours default
    }

    /**
     * Log CORS request for debugging
     * 
     * @param string $origin Request origin
     * @param bool $allowed Whether origin was allowed
     * @return void
     */
    private function logCORSRequest(string $origin, bool $allowed): void
    {
        if (($_ENV['APP_DEBUG'] ?? 'false') === 'true') {
            $status = $allowed ? 'ALLOWED' : 'BLOCKED';
            error_log("[CORS] {$status}: {$origin}");
        }
    }
}
