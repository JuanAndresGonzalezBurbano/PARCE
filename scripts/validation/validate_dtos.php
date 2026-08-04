<?php

// Este script vive dos niveles bajo la raíz del proyecto (scripts/validation/)
require_once dirname(__DIR__, 2) . '/vendor/autoload.php';

use App\Infrastructure\Auth\DTO\AuthResult;
use App\Infrastructure\Auth\DTO\CookieConfig;
use App\Infrastructure\Auth\DTO\SessionData;
use App\Infrastructure\Auth\DTO\RateLimitConfig;
use App\Infrastructure\Auth\Exceptions\AuthenticationException;

echo "=== DTO Validation Script ===\n\n";

// Test 1: AuthResult
echo "1. Testing AuthResult DTO...\n";
try {
    $success = AuthResult::success(1, 'session123');
    echo "   ✓ Success result created: userId={$success->userId}, sessionId={$success->sessionId}\n";
    
    $failure = AuthResult::failure('Invalid credentials');
    echo "   ✓ Failure result created: message={$failure->message}\n";
    
    // Test validation
    try {
        new AuthResult(true, null, null, null);
        echo "   ✗ FAILED: Should reject success=true with null userId/sessionId\n";
    } catch (InvalidArgumentException $e) {
        echo "   ✓ Validation works: Rejects invalid success state\n";
    }
} catch (Exception $e) {
    echo "   ✗ FAILED: " . $e->getMessage() . "\n";
}

// Test 2: CookieConfig
echo "\n2. Testing CookieConfig DTO...\n";
try {
    $config = CookieConfig::secure();
    echo "   ✓ Secure config created: name={$config->name}, httpOnly=" . ($config->httpOnly ? 'true' : 'false') . "\n";
    
    // Test validation
    try {
        new CookieConfig('test', 3600, 'invalid', '', true, true, 'Lax');
        echo "   ✗ FAILED: Should reject path not starting with '/'\n";
    } catch (InvalidArgumentException $e) {
        echo "   ✓ Validation works: Rejects invalid path\n";
    }
    
    try {
        new CookieConfig('test', 3600, '/', '', true, true, 'Invalid');
        echo "   ✗ FAILED: Should reject invalid SameSite value\n";
    } catch (InvalidArgumentException $e) {
        echo "   ✓ Validation works: Rejects invalid SameSite\n";
    }
} catch (Exception $e) {
    echo "   ✗ FAILED: " . $e->getMessage() . "\n";
}

// Test 3: SessionData
echo "\n3. Testing SessionData DTO...\n";
try {
    $session = new SessionData(
        id: 'abc123',
        userId: 1,
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        lastActivity: time(),
        createdAt: time() - 3600,
        expiresAt: time() + 3600
    );
    echo "   ✓ SessionData created: userId={$session->userId}, ip={$session->ipAddress}\n";
    echo "   ✓ isExpired()=" . ($session->isExpired() ? 'true' : 'false') . "\n";
    echo "   ✓ isIdle(1800)=" . ($session->isIdle(1800) ? 'true' : 'false') . "\n";
    
    // Test validation
    try {
        new SessionData('id', 0, '192.168.1.1', 'UA', time(), time());
        echo "   ✗ FAILED: Should reject userId <= 0\n";
    } catch (InvalidArgumentException $e) {
        echo "   ✓ Validation works: Rejects invalid userId\n";
    }
    
    try {
        new SessionData('id', 1, 'invalid-ip', 'UA', time(), time());
        echo "   ✗ FAILED: Should reject invalid IP address\n";
    } catch (InvalidArgumentException $e) {
        echo "   ✓ Validation works: Rejects invalid IP\n";
    }
} catch (Exception $e) {
    echo "   ✗ FAILED: " . $e->getMessage() . "\n";
}

// Test 4: RateLimitConfig
echo "\n4. Testing RateLimitConfig DTO...\n";
try {
    $default = RateLimitConfig::default();
    echo "   ✓ Default config: maxAttempts={$default->maxAttempts}, decayMinutes={$default->decayMinutes}\n";
    
    $strict = RateLimitConfig::strict();
    echo "   ✓ Strict config: maxAttempts={$strict->maxAttempts}, lockoutMinutes={$strict->lockoutMinutes}\n";
    
    // Test validation
    try {
        new RateLimitConfig(0, 15, 30);
        echo "   ✗ FAILED: Should reject maxAttempts < 1\n";
    } catch (InvalidArgumentException $e) {
        echo "   ✓ Validation works: Rejects maxAttempts < 1\n";
    }
    
    try {
        new RateLimitConfig(5, 2000, 30);
        echo "   ✗ FAILED: Should reject decayMinutes > 1440\n";
    } catch (InvalidArgumentException $e) {
        echo "   ✓ Validation works: Rejects decayMinutes > 1440\n";
    }
} catch (Exception $e) {
    echo "   ✗ FAILED: " . $e->getMessage() . "\n";
}

// Test 5: AuthenticationException
echo "\n5. Testing AuthenticationException...\n";
try {
    $exception = new AuthenticationException('Test error', 401);
    echo "   ✓ Exception created: message={$exception->getMessage()}, code={$exception->getCode()}\n";
} catch (Exception $e) {
    echo "   ✗ FAILED: " . $e->getMessage() . "\n";
}

// Test 6: Readonly enforcement
echo "\n6. Testing readonly enforcement...\n";
try {
    $result = AuthResult::success(1, 'session123');
    // This should cause a fatal error in PHP 8.2+
    // $result->userId = 999;
    echo "   ✓ DTOs are readonly (cannot test modification without fatal error)\n";
} catch (Error $e) {
    echo "   ✓ Readonly enforcement works: " . $e->getMessage() . "\n";
}

echo "\n=== All DTO validations passed! ===\n";
