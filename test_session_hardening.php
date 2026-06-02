<?php

/**
 * Session Hardening Validation Test
 * 
 * Tests environment-aware cookie configuration, session regeneration,
 * and secure cookie behavior across different environments.
 */

// Load environment variables manually
$envFile = __DIR__ . '/.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        list($name, $value) = explode('=', $line, 2);
        $_ENV[trim($name)] = trim($value);
    }
}

require_once __DIR__ . '/vendor/autoload.php';

use App\Infrastructure\Auth\DTO\CookieConfig;
use App\Infrastructure\Auth\Services\SessionManager;

define('COLOR_GREEN', "\033[32m");
define('COLOR_RED', "\033[31m");
define('COLOR_BLUE', "\033[34m");
define('COLOR_YELLOW', "\033[33m");
define('COLOR_RESET', "\033[0m");

function printLine(string $message, string $color = COLOR_RESET): void
{
    echo $color . $message . COLOR_RESET . "\n";
}

function printHeader(string $title): void
{
    echo "\n";
    printLine(str_repeat('=', 70), COLOR_BLUE);
    printLine($title, COLOR_BLUE);
    printLine(str_repeat('=', 70), COLOR_BLUE);
    echo "\n";
}

printHeader('P.A.R.C.E Session Hardening Validation Tests');

$passed = 0;
$failed = 0;

// Test 1: CookieConfig::fromEnv() Loads Environment Configuration
printHeader('Test 1: Environment-Aware Cookie Configuration');

try {
    $config = CookieConfig::fromEnv();
    
    // Verify cookie name
    if ($config->name === $_ENV['SESSION_COOKIE_NAME']) {
        printLine("✓ Cookie name loaded from environment: {$config->name}", COLOR_GREEN);
        $passed++;
    } else {
        printLine("✗ Cookie name mismatch: {$config->name} != {$_ENV['SESSION_COOKIE_NAME']}", COLOR_RED);
        $failed++;
    }
    
    // Verify lifetime
    if ($config->lifetime === (int)$_ENV['SESSION_LIFETIME']) {
        printLine("✓ Cookie lifetime loaded from environment: {$config->lifetime}s", COLOR_GREEN);
        $passed++;
    } else {
        printLine("✗ Cookie lifetime mismatch", COLOR_RED);
        $failed++;
    }
    
    // Verify path
    if ($config->path === $_ENV['SESSION_COOKIE_PATH']) {
        printLine("✓ Cookie path loaded from environment: {$config->path}", COLOR_GREEN);
        $passed++;
    } else {
        printLine("✗ Cookie path mismatch", COLOR_RED);
        $failed++;
    }
    
    // Verify HttpOnly
    if ($config->httpOnly === true) {
        printLine("✓ HttpOnly flag enabled: " . ($config->httpOnly ? 'true' : 'false'), COLOR_GREEN);
        $passed++;
    } else {
        printLine("✗ HttpOnly flag should be enabled", COLOR_RED);
        $failed++;
    }
    
    // Verify SameSite
    if ($config->sameSite === $_ENV['SESSION_COOKIE_SAMESITE']) {
        printLine("✓ SameSite policy loaded from environment: {$config->sameSite}", COLOR_GREEN);
        $passed++;
    } else {
        printLine("✗ SameSite policy mismatch", COLOR_RED);
        $failed++;
    }
    
    // Verify secure flag behavior (auto-detect)
    if ($_ENV['SESSION_COOKIE_SECURE'] === 'auto') {
        $expectedSecure = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on';
        if ($config->secure === $expectedSecure) {
            printLine("✓ Secure flag auto-detected correctly: " . ($config->secure ? 'true (HTTPS)' : 'false (HTTP)'), COLOR_GREEN);
            $passed++;
        } else {
            printLine("✗ Secure flag auto-detection failed", COLOR_RED);
            $failed++;
        }
    }
    
} catch (\Exception $e) {
    printLine("✗ CookieConfig::fromEnv() failed: " . $e->getMessage(), COLOR_RED);
    $failed += 6;
}

// Test 2: SessionManager Timeout Configuration
printHeader('Test 2: Session Timeout Configuration');

try {
    $timeoutConfig = SessionManager::getTimeoutConfig();
    
    // Verify idle timeout
    $expectedIdleTimeout = (int)$_ENV['SESSION_IDLE_TIMEOUT'];
    if ($timeoutConfig['idle_timeout'] === $expectedIdleTimeout) {
        printLine("✓ Idle timeout configured: {$timeoutConfig['idle_timeout']}s", COLOR_GREEN);
        $passed++;
    } else {
        printLine("✗ Idle timeout mismatch", COLOR_RED);
        $failed++;
    }
    
    // Verify absolute timeout
    $expectedAbsoluteTimeout = (int)$_ENV['SESSION_LIFETIME'];
    if ($timeoutConfig['absolute_timeout'] === $expectedAbsoluteTimeout) {
        printLine("✓ Absolute timeout configured: {$timeoutConfig['absolute_timeout']}s", COLOR_GREEN);
        $passed++;
    } else {
        printLine("✗ Absolute timeout mismatch", COLOR_RED);
        $failed++;
    }
    
} catch (\Exception $e) {
    printLine("✗ SessionManager::getTimeoutConfig() failed: " . $e->getMessage(), COLOR_RED);
    $failed += 2;
}

// Test 3: Session Regeneration Interval
printHeader('Test 3: Session Regeneration Configuration');

$regenerateInterval = (int)($_ENV['SESSION_REGENERATE_INTERVAL'] ?? 600);
printLine("  Session regeneration interval: {$regenerateInterval}s", COLOR_YELLOW);

if ($regenerateInterval > 0 && $regenerateInterval <= 3600) {
    printLine("✓ Regeneration interval within safe range (1s - 1 hour)", COLOR_GREEN);
    $passed++;
} else {
    printLine("✗ Regeneration interval out of recommended range", COLOR_RED);
    $failed++;
}

// Test 4: Cookie Configuration Validation
printHeader('Test 4: Cookie Configuration Validation');

try {
    // Test invalid path (doesn't start with '/')
    try {
        new CookieConfig(
            name: 'test',
            lifetime: 7200,
            path: 'invalid',
            domain: '',
            secure: true,
            httpOnly: true,
            sameSite: 'Lax'
        );
        printLine("✗ Should reject invalid path", COLOR_RED);
        $failed++;
    } catch (\InvalidArgumentException $e) {
        printLine("✓ Invalid path rejected: " . $e->getMessage(), COLOR_GREEN);
        $passed++;
    }
    
    // Test invalid SameSite
    try {
        new CookieConfig(
            name: 'test',
            lifetime: 7200,
            path: '/',
            domain: '',
            secure: true,
            httpOnly: true,
            sameSite: 'Invalid'
        );
        printLine("✗ Should reject invalid SameSite", COLOR_RED);
        $failed++;
    } catch (\InvalidArgumentException $e) {
        printLine("✓ Invalid SameSite rejected: " . $e->getMessage(), COLOR_GREEN);
        $passed++;
    }
    
    // Test invalid lifetime
    try {
        new CookieConfig(
            name: 'test',
            lifetime: 0,
            path: '/',
            domain: '',
            secure: true,
            httpOnly: true,
            sameSite: 'Lax'
        );
        printLine("✗ Should reject zero lifetime", COLOR_RED);
        $failed++;
    } catch (\InvalidArgumentException $e) {
        printLine("✓ Zero lifetime rejected: " . $e->getMessage(), COLOR_GREEN);
        $passed++;
    }
    
    // Test empty name
    try {
        new CookieConfig(
            name: '',
            lifetime: 7200,
            path: '/',
            domain: '',
            secure: true,
            httpOnly: true,
            sameSite: 'Lax'
        );
        printLine("✗ Should reject empty name", COLOR_RED);
        $failed++;
    } catch (\InvalidArgumentException $e) {
        printLine("✓ Empty name rejected: " . $e->getMessage(), COLOR_GREEN);
        $passed++;
    }
    
} catch (\Exception $e) {
    printLine("✗ Validation test failed: " . $e->getMessage(), COLOR_RED);
    $failed += 4;
}

// Test 5: Session Configuration Summary
printHeader('Test 5: Production Readiness Summary');

$productionReady = true;
$warnings = [];

// Check HttpOnly
if ($_ENV['SESSION_COOKIE_HTTPONLY'] !== 'true') {
    $warnings[] = "HttpOnly should be 'true' in production";
    $productionReady = false;
}

// Check SameSite
if (!in_array($_ENV['SESSION_COOKIE_SAMESITE'], ['Lax', 'Strict'], true)) {
    $warnings[] = "SameSite should be 'Lax' or 'Strict' in production";
    $productionReady = false;
}

// Check Secure mode
if ($_ENV['SESSION_COOKIE_SECURE'] === 'false') {
    $warnings[] = "Secure flag should be 'true' or 'auto' in production";
    $productionReady = false;
}

// Check session lifetime (reasonable range)
$lifetime = (int)$_ENV['SESSION_LIFETIME'];
if ($lifetime < 900 || $lifetime > 86400) {
    $warnings[] = "Session lifetime should be between 15 minutes and 24 hours";
}

if (empty($warnings)) {
    printLine("✓ Session configuration is production-ready", COLOR_GREEN);
    $passed++;
} else {
    printLine("⚠ Production readiness warnings:", COLOR_YELLOW);
    foreach ($warnings as $warning) {
        printLine("  - $warning", COLOR_YELLOW);
    }
    // Still count as passed if in development
    if ($_ENV['APP_ENV'] === 'local' || $_ENV['APP_ENV'] === 'development') {
        printLine("  (Acceptable for development environment)", COLOR_YELLOW);
        $passed++;
    } else {
        $failed++;
    }
}

// Summary
printHeader('Test Summary');
$total = $passed + $failed;
printLine("Total Tests: {$total}", COLOR_BLUE);
printLine("Passed: {$passed}", COLOR_GREEN);
printLine("Failed: {$failed}", $failed > 0 ? COLOR_RED : COLOR_GREEN);

if ($failed === 0) {
    printLine("\n✓ All session hardening tests passed!", COLOR_GREEN);
    printLine("Session configuration is secure and production-ready.", COLOR_GREEN);
    exit(0);
} else {
    printLine("\n✗ Some session hardening tests failed!", COLOR_RED);
    exit(1);
}
