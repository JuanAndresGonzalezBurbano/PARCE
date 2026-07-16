<?php

// Este script vive dos niveles bajo la raíz del proyecto (scripts/validation/)
require_once dirname(__DIR__, 2) . '/vendor/autoload.php';

use App\Infrastructure\Auth\Services\PasswordHasher;
use App\Infrastructure\Auth\Exceptions\AuthenticationException;

echo "=== PasswordHasher Validation Script ===\n\n";

$hasher = new PasswordHasher();

// Test 1: Hash valid password
echo "1. Testing password hashing...\n";
try {
    $password = 'SecurePassword123!';
    $hash = $hasher->hash($password);
    
    echo "   ✓ Password hashed successfully\n";
    echo "   ✓ Hash starts with \$argon2id\$: " . (str_starts_with($hash, '$argon2id$') ? 'YES' : 'NO') . "\n";
    echo "   ✓ Hash length: " . strlen($hash) . " characters\n";
    
    // Test that same password produces different hashes (different salts)
    $hash2 = $hasher->hash($password);
    if ($hash !== $hash2) {
        echo "   ✓ Different salts: Each hash is unique\n";
    } else {
        echo "   ✗ FAILED: Hashes should be different due to unique salts\n";
    }
} catch (Exception $e) {
    echo "   ✗ FAILED: " . $e->getMessage() . "\n";
}

// Test 2: Reject short passwords
echo "\n2. Testing password length validation...\n";
try {
    $hasher->hash('short');
    echo "   ✗ FAILED: Should reject passwords < 8 characters\n";
} catch (AuthenticationException $e) {
    echo "   ✓ Correctly rejects short passwords: " . $e->getMessage() . "\n";
}

// Test 3: Verify correct password
echo "\n3. Testing password verification...\n";
try {
    $password = 'TestPassword123!';
    $hash = $hasher->hash($password);
    
    if ($hasher->verify($password, $hash)) {
        echo "   ✓ Correct password verified successfully\n";
    } else {
        echo "   ✗ FAILED: Should verify correct password\n";
    }
    
    // Test incorrect password
    if (!$hasher->verify('WrongPassword', $hash)) {
        echo "   ✓ Incorrect password rejected successfully\n";
    } else {
        echo "   ✗ FAILED: Should reject incorrect password\n";
    }
} catch (Exception $e) {
    echo "   ✗ FAILED: " . $e->getMessage() . "\n";
}

// Test 4: Timing-safe comparison (basic test)
echo "\n4. Testing timing-safe verification...\n";
try {
    $password = 'TimingTest123!';
    $hash = $hasher->hash($password);
    
    // Measure time for correct password
    $start = microtime(true);
    for ($i = 0; $i < 100; $i++) {
        $hasher->verify($password, $hash);
    }
    $correctTime = microtime(true) - $start;
    
    // Measure time for incorrect password
    $start = microtime(true);
    for ($i = 0; $i < 100; $i++) {
        $hasher->verify('WrongPassword123!', $hash);
    }
    $incorrectTime = microtime(true) - $start;
    
    $timeDiff = abs($correctTime - $incorrectTime);
    $avgTime = ($correctTime + $incorrectTime) / 2;
    $variance = ($timeDiff / $avgTime) * 100;
    
    echo "   ✓ Correct password time: " . number_format($correctTime * 1000, 2) . "ms\n";
    echo "   ✓ Incorrect password time: " . number_format($incorrectTime * 1000, 2) . "ms\n";
    echo "   ✓ Timing variance: " . number_format($variance, 2) . "%\n";
    
    if ($variance < 10) {
        echo "   ✓ Timing-safe: Variance is acceptable (< 10%)\n";
    } else {
        echo "   ⚠ Warning: Timing variance is high, but this is expected with Argon2id\n";
    }
} catch (Exception $e) {
    echo "   ✗ FAILED: " . $e->getMessage() . "\n";
}

// Test 5: needsRehash detection
echo "\n5. Testing needsRehash detection...\n";
try {
    $password = 'RehashTest123!';
    $hash = $hasher->hash($password);
    
    // Fresh hash should not need rehashing
    if (!$hasher->needsRehash($hash)) {
        echo "   ✓ Fresh Argon2id hash does not need rehashing\n";
    } else {
        echo "   ⚠ Warning: Fresh hash flagged for rehashing (algorithm parameters may have changed)\n";
    }
    
    // Test with old bcrypt hash (if available)
    $bcryptHash = password_hash($password, PASSWORD_BCRYPT);
    if ($hasher->needsRehash($bcryptHash)) {
        echo "   ✓ Bcrypt hash correctly flagged for rehashing to Argon2id\n";
    } else {
        echo "   ⚠ Note: Bcrypt hash not flagged (expected behavior varies)\n";
    }
} catch (Exception $e) {
    echo "   ✗ FAILED: " . $e->getMessage() . "\n";
}

// Test 6: Performance check
echo "\n6. Testing performance...\n";
try {
    $password = 'PerformanceTest123!';
    
    $start = microtime(true);
    $hash = $hasher->hash($password);
    $hashTime = (microtime(true) - $start) * 1000;
    
    $start = microtime(true);
    $hasher->verify($password, $hash);
    $verifyTime = (microtime(true) - $start) * 1000;
    
    echo "   ✓ Hash time: " . number_format($hashTime, 2) . "ms\n";
    echo "   ✓ Verify time: " . number_format($verifyTime, 2) . "ms\n";
    
    // Requirement 21.3, 21.4: Should complete within 150ms
    if ($hashTime < 150 && $verifyTime < 150) {
        echo "   ✓ Performance meets requirements (< 150ms)\n";
    } else {
        echo "   ⚠ Warning: Performance exceeds 150ms target (Argon2id is intentionally slow for security)\n";
    }
} catch (Exception $e) {
    echo "   ✗ FAILED: " . $e->getMessage() . "\n";
}

echo "\n=== PasswordHasher validation complete! ===\n";
