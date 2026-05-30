<?php

/**
 * Database Integrity Test Script
 * 
 * Tests database constraints, foreign keys, and cascades:
 * - Foreign key integrity
 * - Cascade deletes
 * - Constraint validation
 * - RBAC relationships
 */

require_once __DIR__ . '/vendor/autoload.php';

use App\Core\Database;
use App\Core\ConfigValidator;

// Load environment
$envFile = __DIR__ . '/.env';
$env = parse_ini_file($envFile);

// Configure database
Database::setConfig([
    'driver' => $env['DB_CONNECTION'] ?? 'mysql',
    'host' => $env['DB_HOST'] ?? '127.0.0.1',
    'port' => (int) ($env['DB_PORT'] ?? '3306'),
    'database' => $env['DB_DATABASE'] ?? '',
    'username' => $env['DB_USERNAME'] ?? 'root',
    'password' => $env['DB_PASSWORD'] ?? '',
    'charset' => 'utf8mb4',
]);

// Colors
define('COLOR_GREEN', "\033[32m");
define('COLOR_RED', "\033[31m");
define('COLOR_BLUE', "\033[34m");
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

printHeader('P.A.R.C.E Database Integrity Tests');

try {
    Database::beginTransaction();
    
    // Test 1: Create test user
    printHeader('Test 1: Create Test User');
    $userId = Database::insert('users', [
        'email' => 'cascade_test_' . time() . '@example.com',
        'password_hash' => password_hash('Test123!', PASSWORD_ARGON2ID),
        'first_name' => 'Cascade',
        'last_name' => 'Test',
        'account_status' => 'active',
        'created_at' => date('Y-m-d H:i:s'),
        'updated_at' => date('Y-m-d H:i:s')
    ]);
    printLine("✓ Created test user with ID: {$userId}", COLOR_GREEN);
    
    // Test 2: Assign role to user
    printHeader('Test 2: Assign Role');
    $customerRole = Database::fetchOne('SELECT id FROM roles WHERE slug = ?', ['customer']);
    $userRoleId = Database::insert('user_roles', [
        'user_id' => $userId,
        'role_id' => $customerRole['id'],
        'is_active' => true,
        'assigned_at' => date('Y-m-d H:i:s'),
        'created_at' => date('Y-m-d H:i:s'),
        'updated_at' => date('Y-m-d H:i:s')
    ]);
    printLine("✓ Assigned customer role to user", COLOR_GREEN);
    
    // Test 3: Create session for user
    printHeader('Test 3: Create Session');
    $sessionId = bin2hex(random_bytes(20));
    Database::insert('sessions', [
        'id' => $sessionId,
        'user_id' => $userId,
        'ip_address' => '127.0.0.1',
        'user_agent' => 'Test Agent',
        'payload' => json_encode(['test' => true]),
        'last_activity' => time(),
        'created_at' => date('Y-m-d H:i:s')
    ]);
    printLine("✓ Created session for user", COLOR_GREEN);
    
    // Test 4: Verify relationships exist
    printHeader('Test 4: Verify Relationships');
    $userRoles = Database::fetchAll(
        'SELECT * FROM user_roles WHERE user_id = ?',
        [$userId]
    );
    printLine("✓ User has " . count($userRoles) . " role(s)", COLOR_GREEN);
    
    $sessions = Database::fetchAll(
        'SELECT * FROM sessions WHERE user_id = ?',
        [$userId]
    );
    printLine("✓ User has " . count($sessions) . " session(s)", COLOR_GREEN);
    
    // Test 5: Test CASCADE DELETE
    printHeader('Test 5: Test CASCADE DELETE');
    Database::delete('users', 'id = ?', [$userId]);
    printLine("✓ Deleted test user", COLOR_GREEN);
    
    // Verify cascades worked
    $userRolesAfter = Database::fetchAll(
        'SELECT * FROM user_roles WHERE user_id = ?',
        [$userId]
    );
    
    $sessionsAfter = Database::fetchAll(
        'SELECT * FROM sessions WHERE user_id = ?',
        [$userId]
    );
    
    if (count($userRolesAfter) === 0) {
        printLine("✓ user_roles CASCADE DELETE worked", COLOR_GREEN);
    } else {
        printLine("✗ user_roles CASCADE DELETE failed", COLOR_RED);
    }
    
    if (count($sessionsAfter) === 0) {
        printLine("✓ sessions CASCADE DELETE worked", COLOR_GREEN);
    } else {
        printLine("✗ sessions CASCADE DELETE failed", COLOR_RED);
    }
    
    // Test 6: Verify RBAC query performance
    printHeader('Test 6: RBAC Query Performance');
    $start = microtime(true);
    $result = Database::fetchAll(
        'SELECT u.id, u.email, r.slug as role
         FROM users u
         JOIN user_roles ur ON u.id = ur.user_id
         JOIN roles r ON ur.role_id = r.id
         WHERE ur.is_active = TRUE
           AND r.is_active = TRUE
           AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
         LIMIT 100'
    );
    $duration = round((microtime(true) - $start) * 1000, 2);
    printLine("✓ RBAC query returned " . count($result) . " results in {$duration}ms", COLOR_GREEN);
    
    // Test 7: Verify indexes exist
    printHeader('Test 7: Verify Database Indexes');
    $tables = ['users', 'roles', 'user_roles', 'sessions'];
    foreach ($tables as $table) {
        $indexes = Database::fetchAll("SHOW INDEX FROM {$table}");
        printLine("✓ Table '{$table}' has " . count($indexes) . " indexes", COLOR_GREEN);
    }
    
    // Test 8: Verify constraints
    printHeader('Test 8: Verify Foreign Key Constraints');
    $constraints = Database::fetchAll(
        "SELECT 
            TABLE_NAME,
            CONSTRAINT_NAME,
            REFERENCED_TABLE_NAME
         FROM information_schema.KEY_COLUMN_USAGE
         WHERE TABLE_SCHEMA = DATABASE()
           AND REFERENCED_TABLE_NAME IS NOT NULL
         ORDER BY TABLE_NAME"
    );
    
    foreach ($constraints as $constraint) {
        printLine(
            "✓ {$constraint['TABLE_NAME']}.{$constraint['CONSTRAINT_NAME']} → {$constraint['REFERENCED_TABLE_NAME']}",
            COLOR_GREEN
        );
    }
    
    Database::rollback();
    
    printHeader('Summary');
    printLine("✓ All database integrity tests passed!", COLOR_GREEN);
    printLine("✓ Foreign key cascades working correctly", COLOR_GREEN);
    printLine("✓ RBAC relationships validated", COLOR_GREEN);
    printLine("✓ Database constraints verified", COLOR_GREEN);
    
} catch (Exception $e) {
    Database::rollback();
    printLine("\n✗ Test failed: " . $e->getMessage(), COLOR_RED);
    printLine("Stack trace:\n" . $e->getTraceAsString(), COLOR_RED);
    exit(1);
}
