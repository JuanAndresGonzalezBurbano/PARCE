<?php

namespace App\Middleware;

use App\Core\Request;
use App\Core\Response;

/**
 * Request Logger Middleware
 * 
 * Logs all HTTP requests with structured JSON format including:
 * - Request metadata (timestamp, ID, method, path)
 * - Response metadata (status code, execution time)
 * - Client information (IP, user agent)
 * 
 * Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7
 */
class RequestLoggerMiddleware
{
    /**
     * Log file path
     */
    private const LOG_FILE = __DIR__ . '/../../storage/logs/requests.log';

    /**
     * Handle incoming request
     * 
     * Requirements: 13.1, 13.2, 13.3, 13.4, 13.5
     * 
     * @param Request $request HTTP request object
     * @param callable $next Next middleware/controller in chain
     * @return Response HTTP response
     */
    public function handle(Request $request, callable $next): Response
    {
        // Requirement 13.1: Generate unique request ID
        $requestId = $this->generateRequestId();
        
        // Requirement 13.2: Record start time for duration calculation
        $startTime = microtime(true);
        
        // Requirement 13.1: Capture request timestamp
        $timestamp = date('Y-m-d H:i:s');
        
        // Execute request through middleware chain
        $response = $next($request);
        
        // Requirement 13.2: Calculate execution time in milliseconds
        $durationMs = round((microtime(true) - $startTime) * 1000, 2);
        
        // Requirement 13.3, 13.4, 13.5: Build log entry
        $logEntry = [
            'timestamp' => $timestamp,
            'requestId' => $requestId,
            'method' => $request->method(),
            'path' => $request->uri(),
            'status' => $response->getStatusCode(),
            'durationMs' => $durationMs,
            'ip' => $this->getClientIp($request),
            'userAgent' => $request->userAgent()
        ];
        
        // Requirement 13.6: Filter sensitive data (passwords, tokens, session IDs)
        // Note: We don't log request body or headers to avoid logging sensitive data
        
        // Requirement 13.7: Write log entry
        $this->writeLog($logEntry);
        
        return $response;
    }

    /**
     * Generate unique request ID
     * 
     * Requirement 13.1
     * 
     * @return string Unique request identifier
     */
    private function generateRequestId(): string
    {
        return uniqid('req_', true);
    }

    /**
     * Get client IP address
     * 
     * Handles X-Forwarded-For header for proxied requests
     * 
     * Requirement 13.5
     * 
     * @param Request $request HTTP request
     * @return string Client IP address
     */
    private function getClientIp(Request $request): string
    {
        // Check X-Forwarded-For header (for proxied requests)
        $forwardedFor = $request->header('X-Forwarded-For');
        if ($forwardedFor !== null) {
            // Use first IP in the chain
            $ips = explode(',', $forwardedFor);
            return trim($ips[0]);
        }
        
        // Fallback to direct IP
        return $request->ip();
    }

    /**
     * Write log entry to file
     * 
     * Uses JSON Lines format (one JSON object per line)
     * 
     * Requirements: 13.7
     * 
     * @param array $logEntry Log entry data
     * @return void
     */
    private function writeLog(array $logEntry): void
    {
        try {
            // Ensure log directory exists
            $logDir = dirname(self::LOG_FILE);
            if (!is_dir($logDir)) {
                mkdir($logDir, 0755, true);
            }
            
            // Convert to JSON and append newline (JSON Lines format)
            $jsonLine = json_encode($logEntry, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . PHP_EOL;
            
            // Append to log file (low overhead, no locking for performance)
            file_put_contents(self::LOG_FILE, $jsonLine, FILE_APPEND);
            
        } catch (\Exception $e) {
            // Fail silently to avoid breaking request flow
            // Log to error_log as fallback
            error_log("RequestLogger error: " . $e->getMessage());
        }
    }

    /**
     * Get log file path (for testing)
     * 
     * @return string Log file path
     */
    public static function getLogFilePath(): string
    {
        return self::LOG_FILE;
    }
}
