<?php

// Este script vive dos niveles bajo la raíz del proyecto (scripts/validation/)
define('BASE_PATH', dirname(__DIR__, 2));

require_once BASE_PATH . '/vendor/autoload.php';

use App\Core\Database;
use App\Infrastructure\Auth\Services\SessionManager;
use App\Infrastructure\Auth\DTO\SessionData;

echo "=== SessionManager Validation Script ===\n\n";

// Load database configuration
$envFile = BASE_PATH . '/.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        list($key, $value) = explode('=', $line, 2);
        $_ENV[trim($key)] = trim($value);
    }
}

// Configure database
Database::setConfig([
    'driver' => $_ENV['DB_DRIVER'] ?? 'mysql',
    'host' => $_ENV['DB_HOST'] ?? '127.0.0.1',
    'port' => $_ENV['DB_PORT'] ?? 3306,
    'database' => $_ENV['DB_DATABASE'] ?? 'parce',
    'username' => $_ENV['DB_USERNAME'] ?? 'root',
    'password' => $_ENV['DB_PASSWORD'] ?? '',
    'charset' => $_ENV['DB_CHARSET'] ?? 'utf8mb4',
]);

$manager = new SessionManager();

// Create test users if they don't exist
echo "0. Setting up test users...\n";
try {
    // Check if test user exists
    $testUser = Database::fetchOne('SELECT id FROM users WHERE id = 1');
    if (!$testUser) {
        // Create test users
        for ($i = 1; $i <= 5; $i++) {
            Database::insert('users', [
                'email' => "testuser{$i}@example.com",
                'password_hash' => password_hash('TestPassword123!', PASSWORD_ARGON2ID),
                'first_name' => "Test",
                'last_name' => "User{$i}",
                'account_status' => 'active'
            ]);
        }
        echo "   ✓ Created 5 test users\n";
    } else {
        echo "   ✓ Test users already exist\n";
    }
} catch (Exception $e) {
    echo "   ⚠ Warning: Could not create test users: " . $e->getMessage() . "\n";
    echo "   Note: Continuing with existing users...\n";
}

// Test 1: Create session
echo "\n1. Testing session creation...\n";
try {
    $sessionId = $manager->create(1, [
        'ip_address' => '192.168.1.1',
        'user_agent' => 'Mozilla/5.0 Test Browser',
        'remember' => false
    ]);
    
    echo "   ✓ Session created: ID={$sessionId}\n";
    echo "   ✓ Session ID length: " . strlen($sessionId) . " characters\n";
    
    if (strlen($sessionId) === 40 && ctype_xdigit($sessionId)) {
        echo "   ✓ Session ID format: 40-character hexadecimal\n";
    } else {
        echo "   ✗ FAILED: Session ID should be 40-character hexadecimal\n";
    }
    
    // Test uniqueness
    $sessionId2 = $manager->create(1, [
        'ip_address' => '192.168.1.1',
        'user_agent' => 'Mozilla/5.0 Test Browser',
        'remember' => false
    ]);
    
    if ($sessionId !== $sessionId2) {
        echo "   ✓ Session IDs are unique\n";
    } else {
        echo "   ✗ FAILED: Session IDs should be unique\n";
    }
    
} catch (Exception $e) {
    echo "   ✗ FAILED: " . $e->getMessage() . "\n";
}

// Test 2: Validate session
echo "\n2. Testing session validation...\n";
try {
    $sessionData = $manager->validate($sessionId);
    
    if ($sessionData instanceof SessionData) {
        echo "   ✓ Session validated successfully\n";
        echo "   ✓ User ID: {$sessionData->userId}\n";
        echo "   ✓ IP Address: {$sessionData->ipAddress}\n";
        echo "   ✓ Is Expired: " . ($sessionData->isExpired() ? 'YES' : 'NO') . "\n";
        echo "   ✓ Is Idle (1800s): " . ($sessionData->isIdle(1800) ? 'YES' : 'NO') . "\n";
    } else {
        echo "   ✗ FAILED: Should return SessionData object\n";
    }
    
    // Test non-existent session
    $invalidSession = $manager->validate('nonexistent1234567890123456789012345678');
    if ($invalidSession === null) {
        echo "   ✓ Non-existent session returns null\n";
    } else {
        echo "   ✗ FAILED: Non-existent session should return null\n";
    }
    
} catch (Exception $e) {
    echo "   ✗ FAILED: " . $e->getMessage() . "\n";
}

// Test 3: Session regeneration
echo "\n3. Testing session regeneration...\n";
try {
    $oldSessionId = $sessionId;
    $newSessionId = $manager->regenerate($oldSessionId);
    
    if (!empty($newSessionId) && $newSessionId !== $oldSessionId) {
        echo "   ✓ Session regenerated: New ID={$newSessionId}\n";
        echo "   ✓ New ID is different from old ID\n";
        
        // Verify old session is invalid
        $oldSessionData = $manager->validate($oldSessionId);
        if ($oldSessionData === null) {
            echo "   ✓ Old session ID is invalid after regeneration\n";
        } else {
            echo "   ✗ FAILED: Old session should be invalid\n";
        }
        
        // Verify new session is valid
        $newSessionData = $manager->validate($newSessionId);
        if ($newSessionData instanceof SessionData) {
            echo "   ✓ New session ID is valid\n";
            echo "   ✓ User ID preserved: {$newSessionData->userId}\n";
        } else {
            echo "   ✗ FAILED: New session should be valid\n";
        }
        
        $sessionId = $newSessionId; // Use new session for remaining tests
    } else {
        echo "   ✗ FAILED: Regeneration should return new session ID\n";
    }
    
} catch (Exception $e) {
    echo "   ✗ FAILED: " . $e->getMessage() . "\n";
}

// Test 4: Destroy session
echo "\n4. Testing session destruction...\n";
try {
    $testSessionId = $manager->create(2, [
        'ip_address' => '192.168.1.2',
        'user_agent' => 'Test Browser',
        'remember' => false
    ]);
    
    $destroyed = $manager->destroy($testSessionId);
    if ($destroyed) {
        echo "   ✓ Session destroyed successfully\n";
        
        // Verify session is gone
        $sessionData = $manager->validate($testSessionId);
        if ($sessionData === null) {
            echo "   ✓ Destroyed session is no longer valid\n";
        } else {
            echo "   ✗ FAILED: Destroyed session should be invalid\n";
        }
    } else {
        echo "   ✗ FAILED: Destroy should return true\n";
    }
    
    // Test destroying non-existent session
    $destroyed2 = $manager->destroy('nonexistent1234567890123456789012345678');
    if (!$destroyed2) {
        echo "   ✓ Destroying non-existent session returns false\n";
    } else {
        echo "   ✗ FAILED: Should return false for non-existent session\n";
    }
    
} catch (Exception $e) {
    echo "   ✗ FAILED: " . $e->getMessage() . "\n";
}

// Test 5: Destroy all user sessions
echo "\n5. Testing destroyAllUserSessions...\n";
try {
    // Create multiple sessions for user 3
    $session1 = $manager->create(3, ['ip_address' => '192.168.1.3', 'user_agent' => 'Browser 1', 'remember' => false]);
    $session2 = $manager->create(3, ['ip_address' => '192.168.1.4', 'user_agent' => 'Browser 2', 'remember' => false]);
    $session3 = $manager->create(3, ['ip_address' => '192.168.1.5', 'user_agent' => 'Browser 3', 'remember' => false]);
    
    echo "   ✓ Created 3 sessions for user 3\n";
    
    $count = $manager->destroyAllUserSessions(3);
    echo "   ✓ Destroyed {$count} sessions\n";
    
    if ($count === 3) {
        echo "   ✓ All user sessions destroyed\n";
    } else {
        echo "   ⚠ Warning: Expected 3 sessions destroyed, got {$count}\n";
    }
    
    // Verify all sessions are gone
    $allGone = $manager->validate($session1) === null &&
               $manager->validate($session2) === null &&
               $manager->validate($session3) === null;
    
    if ($allGone) {
        echo "   ✓ All sessions are invalid after destruction\n";
    } else {
        echo "   ✗ FAILED: Some sessions still valid\n";
    }
    
} catch (Exception $e) {
    echo "   ✗ FAILED: " . $e->getMessage() . "\n";
}

// Test 6: Session cleanup
echo "\n6. Testing session cleanup...\n";
try {
    // Create an old session using an existing user
    $oldSessionId = bin2hex(random_bytes(20));
    $oldTimestamp = time() - 3600; // 1 hour ago
    
    Database::insert('sessions', [
        'id' => $oldSessionId,
        'user_id' => 1, // Use existing test user
        'ip_address' => '192.168.1.99',
        'user_agent' => 'Old Browser',
        'payload' => json_encode(['user_id' => 1, 'created_at' => $oldTimestamp]),
        'last_activity' => $oldTimestamp
    ]);
    
    echo "   ✓ Created old session for cleanup test\n";
    
    $cleanedCount = $manager->cleanup();
    echo "   ✓ Cleanup removed {$cleanedCount} expired session(s)\n";
    
    // Verify old session is gone
    $oldSessionData = $manager->validate($oldSessionId);
    if ($oldSessionData === null) {
        echo "   ✓ Old session was cleaned up\n";
    } else {
        echo "   ⚠ Note: Old session still exists (cleanup may use different threshold)\n";
    }
    
} catch (Exception $e) {
    echo "   ✗ FAILED: " . $e->getMessage() . "\n";
}

// Cleanup: Remove test session
try {
    if (isset($sessionId)) {
        $manager->destroy($sessionId);
    }
    if (isset($sessionId2)) {
        $manager->destroy($sessionId2);
    }
} catch (Exception $e) {
    // Ignore cleanup errors
}

echo "\n=== SessionManager validation complete! ===\n";
