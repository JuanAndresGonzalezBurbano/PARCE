<?php

namespace App\Infrastructure\Http;

use App\Core\Request;

/**
 * IP Validator
 * 
 * Provides IP address extraction and validation utilities for HTTP requests:
 * - Extract IP from X-Forwarded-For header (for proxied requests)
 * - Extract IP from REMOTE_ADDR (direct connections)
 * - Handle multiple IPs in X-Forwarded-For (use first IP)
 * - Provide fallback for invalid IPs (0.0.0.0)
 * - Validate IP address format
 * 
 * Requirements: 20.1, 20.2, 20.3, 20.4, 20.5, 20.6, 20.7
 */
class IPValidator
{
    /**
     * Fallback IP address for invalid cases
     */
    private const FALLBACK_IP = '0.0.0.0';

    /**
     * Get client IP address from request
     * 
     * Checks X-Forwarded-For header first (for proxied requests),
     * then falls back to REMOTE_ADDR (direct connections).
     * 
     * Requirements: 20.1, 20.2, 20.3
     * 
     * @param Request $request HTTP request object
     * @return string Client IP address
     */
    public static function getClientIP(Request $request): string
    {
        // Requirement 20.1: Check X-Forwarded-For header first
        $forwardedFor = $request->header('X-Forwarded-For');
        
        if ($forwardedFor !== null && $forwardedFor !== '') {
            // Requirement 20.3: Handle multiple IPs (use first IP in chain)
            $ips = explode(',', $forwardedFor);
            $ip = trim($ips[0]);
            
            // Validate the extracted IP
            if (self::isValidIP($ip)) {
                return $ip;
            }
        }
        
        // Requirement 20.2: Fallback to REMOTE_ADDR
        $remoteAddr = $request->ip();
        
        // Validate REMOTE_ADDR
        if (self::isValidIP($remoteAddr)) {
            return $remoteAddr;
        }
        
        // Requirement 20.4: Return fallback for invalid IP
        return self::FALLBACK_IP;
    }

    /**
     * Validate IP address format
     * 
     * Supports both IPv4 and IPv6 addresses.
     * 
     * Requirement 20.5
     * 
     * @param string $ip IP address to validate
     * @return bool True if valid IP format, false otherwise
     */
    public static function isValidIP(string $ip): bool
    {
        // Check for empty or whitespace-only strings
        if (empty(trim($ip))) {
            return false;
        }
        
        // Validate IPv4 or IPv6 format
        return filter_var($ip, FILTER_VALIDATE_IP) !== false;
    }

    /**
     * Extract IP from X-Forwarded-For header
     * 
     * Returns the first IP in the X-Forwarded-For chain,
     * or null if header is not present.
     * 
     * Requirement 20.1
     * 
     * @param Request $request HTTP request object
     * @return string|null First IP from X-Forwarded-For or null
     */
    public static function getForwardedIP(Request $request): ?string
    {
        $forwardedFor = $request->header('X-Forwarded-For');
        
        if ($forwardedFor === null || $forwardedFor === '') {
            return null;
        }
        
        // Handle multiple IPs (use first IP)
        $ips = explode(',', $forwardedFor);
        $ip = trim($ips[0]);
        
        return self::isValidIP($ip) ? $ip : null;
    }

    /**
     * Extract IP from REMOTE_ADDR
     * 
     * Returns the direct connection IP address.
     * 
     * Requirement 20.2
     * 
     * @param Request $request HTTP request object
     * @return string|null IP from REMOTE_ADDR or null if invalid
     */
    public static function getRemoteIP(Request $request): ?string
    {
        $remoteAddr = $request->ip();
        
        return self::isValidIP($remoteAddr) ? $remoteAddr : null;
    }

    /**
     * Get all IPs from X-Forwarded-For header
     * 
     * Returns array of all IPs in the forwarding chain.
     * Useful for logging and security analysis.
     * 
     * Requirement 20.3
     * 
     * @param Request $request HTTP request object
     * @return array Array of IP addresses from X-Forwarded-For
     */
    public static function getAllForwardedIPs(Request $request): array
    {
        $forwardedFor = $request->header('X-Forwarded-For');
        
        if ($forwardedFor === null || $forwardedFor === '') {
            return [];
        }
        
        // Split by comma and trim whitespace
        $ips = array_map('trim', explode(',', $forwardedFor));
        
        // Filter out invalid IPs
        return array_filter($ips, [self::class, 'isValidIP']);
    }

    /**
     * Get IP address with metadata
     * 
     * Returns detailed information about the client IP including:
     * - ip: The client IP address
     * - source: Where the IP came from ('x-forwarded-for', 'remote-addr', or 'fallback')
     * - forwarded_chain: Array of all IPs in X-Forwarded-For (if present)
     * 
     * Requirements: 20.1, 20.2, 20.3, 20.4, 20.6, 20.7
     * 
     * @param Request $request HTTP request object
     * @return array IP metadata
     */
    public static function getIPMetadata(Request $request): array
    {
        $forwardedIP = self::getForwardedIP($request);
        $remoteIP = self::getRemoteIP($request);
        $forwardedChain = self::getAllForwardedIPs($request);
        
        // Determine source and IP
        if ($forwardedIP !== null) {
            return [
                'ip' => $forwardedIP,
                'source' => 'x-forwarded-for',
                'forwarded_chain' => $forwardedChain,
                'remote_addr' => $remoteIP
            ];
        }
        
        if ($remoteIP !== null) {
            return [
                'ip' => $remoteIP,
                'source' => 'remote-addr',
                'forwarded_chain' => [],
                'remote_addr' => $remoteIP
            ];
        }
        
        // Fallback case
        return [
            'ip' => self::FALLBACK_IP,
            'source' => 'fallback',
            'forwarded_chain' => [],
            'remote_addr' => $request->ip()
        ];
    }

    /**
     * Check if IP address has changed between requests
     * 
     * Useful for detecting session hijacking attempts.
     * 
     * Requirement 20.7
     * 
     * @param string $previousIP Previous IP address
     * @param string $currentIP Current IP address
     * @return bool True if IP has changed, false otherwise
     */
    public static function hasIPChanged(string $previousIP, string $currentIP): bool
    {
        // Normalize IPs (trim whitespace)
        $previousIP = trim($previousIP);
        $currentIP = trim($currentIP);
        
        // Compare IPs
        return $previousIP !== $currentIP;
    }
}
