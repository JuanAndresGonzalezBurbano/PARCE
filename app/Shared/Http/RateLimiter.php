<?php

namespace App\Shared\Http;

/**
 * Rate Limiter Utility
 * 
 * Implements IP-based rate limiting using sliding window algorithm.
 * Tracks login attempts per IP address with automatic expiration.
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 17.1, 17.2, 17.3, 17.4, 17.5, 17.6, 17.7
 */
class RateLimiter
{
    /**
     * In-memory storage for attempt tracking
     * 
     * Structure: [
     *   'endpoint:ip' => [
     *     'attempts' => int,
     *     'window_start' => int (timestamp),
     *     'locked_until' => int|null (timestamp)
     *   ]
     * ]
     * 
     * @var array
     */
    private static array $storage = [];

    /**
     * Storage file path for persistence
     */
    private const STORAGE_FILE = __DIR__ . '/../../../storage/rate_limit.json';

    /**
     * Load storage from file
     * 
     * @return void
     */
    private static function loadStorage(): void
    {
        if (empty(self::$storage) && file_exists(self::STORAGE_FILE)) {
            $data = file_get_contents(self::STORAGE_FILE);
            if ($data !== false) {
                self::$storage = json_decode($data, true) ?: [];
            }
        }
    }

    /**
     * Save storage to file
     * 
     * @return void
     */
    private static function saveStorage(): void
    {
        $dir = dirname(self::STORAGE_FILE);
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
        file_put_contents(self::STORAGE_FILE, json_encode(self::$storage));
    }

    /**
     * Sliding window duration in seconds (15 minutes)
     * 
     * Requirement 6.2, 17.2
     */
    private const WINDOW_DURATION = 900; // 15 minutes

    /**
     * Maximum attempts allowed per window
     * 
     * Requirement 6.3, 17.3
     */
    private const MAX_ATTEMPTS = 5;

    /**
     * Check if request is rate limited
     * 
     * Requirements: 6.1, 6.2, 6.3, 6.4, 17.1, 17.2, 17.3, 17.4
     * 
     * @param string $endpoint Endpoint identifier (e.g., 'login')
     * @param string $ipAddress Client IP address
     * @return array ['allowed' => bool, 'remaining' => int, 'reset_at' => int|null]
     */
    public static function check(string $endpoint, string $ipAddress): array
    {
        self::loadStorage();
        
        $key = self::getKey($endpoint, $ipAddress);
        $now = time();

        // Requirement 6.4, 17.4: Clean up expired entries
        self::cleanupExpired();

        // Get or initialize tracking data
        if (!isset(self::$storage[$key])) {
            self::$storage[$key] = [
                'attempts' => 0,
                'window_start' => $now,
                'locked_until' => null
            ];
        }

        $data = &self::$storage[$key];

        // Check if currently locked
        if ($data['locked_until'] !== null && $now < $data['locked_until']) {
            return [
                'allowed' => false,
                'remaining' => 0,
                'reset_at' => $data['locked_until']
            ];
        }

        // Requirement 6.2, 17.2: Check if window has expired (sliding window)
        if ($now - $data['window_start'] >= self::WINDOW_DURATION) {
            // Reset window
            $data['attempts'] = 0;
            $data['window_start'] = $now;
            $data['locked_until'] = null;
        }

        // Requirement 6.3, 17.3: Check if max attempts reached
        if ($data['attempts'] >= self::MAX_ATTEMPTS) {
            // Lock until window expires
            $data['locked_until'] = $data['window_start'] + self::WINDOW_DURATION;
            
            self::saveStorage();
            
            return [
                'allowed' => false,
                'remaining' => 0,
                'reset_at' => $data['locked_until']
            ];
        }

        // Requirement 6.1, 17.1: Allow request
        return [
            'allowed' => true,
            'remaining' => self::MAX_ATTEMPTS - $data['attempts'],
            'reset_at' => $data['window_start'] + self::WINDOW_DURATION
        ];
    }

    /**
     * Record a failed attempt
     * 
     * Requirements: 6.1, 6.3, 17.1, 17.3
     * 
     * @param string $endpoint Endpoint identifier
     * @param string $ipAddress Client IP address
     * @return void
     */
    public static function recordAttempt(string $endpoint, string $ipAddress): void
    {
        self::loadStorage();
        
        $key = self::getKey($endpoint, $ipAddress);
        $now = time();

        // Initialize if not exists
        if (!isset(self::$storage[$key])) {
            self::$storage[$key] = [
                'attempts' => 0,
                'window_start' => $now,
                'locked_until' => null
            ];
        }

        // Requirement 6.1, 17.1: Increment attempt counter
        self::$storage[$key]['attempts']++;
        
        self::saveStorage();
    }

    /**
     * Reset attempts for successful login
     * 
     * Requirements: 6.5, 17.5
     * 
     * @param string $endpoint Endpoint identifier
     * @param string $ipAddress Client IP address
     * @return void
     */
    public static function reset(string $endpoint, string $ipAddress): void
    {
        self::loadStorage();
        
        $key = self::getKey($endpoint, $ipAddress);
        
        // Requirement 6.5, 17.5: Clear tracking data on success
        unset(self::$storage[$key]);
        
        self::saveStorage();
    }

    /**
     * Get remaining attempts for an IP
     * 
     * @param string $endpoint Endpoint identifier
     * @param string $ipAddress Client IP address
     * @return int Remaining attempts
     */
    public static function getRemaining(string $endpoint, string $ipAddress): int
    {
        $key = self::getKey($endpoint, $ipAddress);
        
        if (!isset(self::$storage[$key])) {
            return self::MAX_ATTEMPTS;
        }

        $attempts = self::$storage[$key]['attempts'];
        return max(0, self::MAX_ATTEMPTS - $attempts);
    }

    /**
     * Get time until rate limit resets
     * 
     * @param string $endpoint Endpoint identifier
     * @param string $ipAddress Client IP address
     * @return int|null Timestamp when limit resets, or null if not limited
     */
    public static function getResetTime(string $endpoint, string $ipAddress): ?int
    {
        $key = self::getKey($endpoint, $ipAddress);
        
        if (!isset(self::$storage[$key])) {
            return null;
        }

        $data = self::$storage[$key];
        
        if ($data['locked_until'] !== null) {
            return $data['locked_until'];
        }

        return $data['window_start'] + self::WINDOW_DURATION;
    }

    /**
     * Clean up expired tracking entries
     * 
     * Requirements: 6.4, 17.4
     * 
     * @return void
     */
    private static function cleanupExpired(): void
    {
        $now = time();
        
        foreach (self::$storage as $key => $data) {
            // Remove if window has expired and not locked
            if ($data['locked_until'] === null && 
                $now - $data['window_start'] >= self::WINDOW_DURATION) {
                unset(self::$storage[$key]);
            }
            
            // Remove if lock has expired
            if ($data['locked_until'] !== null && $now >= $data['locked_until']) {
                unset(self::$storage[$key]);
            }
        }
        
        self::saveStorage();
    }

    /**
     * Generate storage key for endpoint and IP
     * 
     * Requirements: 6.7, 17.7
     * 
     * @param string $endpoint Endpoint identifier
     * @param string $ipAddress Client IP address
     * @return string Storage key
     */
    private static function getKey(string $endpoint, string $ipAddress): string
    {
        // Requirement 6.7, 17.7: Per-endpoint tracking
        return $endpoint . ':' . $ipAddress;
    }

    /**
     * Clear all rate limit data (for testing)
     * 
     * @return void
     */
    public static function clearAll(): void
    {
        self::$storage = [];
    }

    /**
     * Get current attempt count (for testing/debugging)
     * 
     * @param string $endpoint Endpoint identifier
     * @param string $ipAddress Client IP address
     * @return int Current attempt count
     */
    public static function getAttempts(string $endpoint, string $ipAddress): int
    {
        $key = self::getKey($endpoint, $ipAddress);
        
        if (!isset(self::$storage[$key])) {
            return 0;
        }

        return self::$storage[$key]['attempts'];
    }
}
