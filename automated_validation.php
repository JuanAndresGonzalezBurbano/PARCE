<?php

/**
 * Automated Backend Validation
 * 
 * Quick validation of critical backend components
 */

require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/app/Core/Database.php';

use App\Core\Database;

// Load .env
$env = [];
if (file_exists(__DIR__ . '/.env')) {
    $lines = file(__DIR__ . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        list($key, $value) = explode('=', $line, 2);
        $env[trim($key)] = trim($value);
    }
}

Database::setConfig([
    'driver' => 'mysql',
    'host' => $env['DB_HOST'] ?? '127.0.0.1',
    'port' => (int)($env['DB_PORT'] ?? 3306),
    'database' => $env['DB_DATABASE'] ?? '',
    'username' => $env['DB_USERNAME'] ?? 'root',
    'password' => $env['DB_PASSWORD'] ?? '',
    'charset' => 'utf8mb4'
]);

echo "=== AUTOMATED BACKEND VALIDATION ===\n\n";

$passed = 0;
$failed = 0;
$warnings = 0;

// Test 1: Database Connection
echo "[TEST 1] Database Connection\n";
try {
    $result = Database::fetchOne('SELECT 1 as test');
    if ($result['test'] === 1) {
        echo "  ✓ PASSED: Database connected\n\n";
        $passed++;
    }
} catch (\Exception $e) {
    echo "  ✗ FAILED: " . $e->getMessage() . "\n\n";
    $failed++;
}

// Test 2: Migrations Executed
echo "[TEST 2] Migrations Status\n";
try {
    $migrations = Database::fetchAll('SELECT migration, batch FROM migrations ORDER BY batch');
    $expectedMigrations = [
        '2024_01_01_000001_create_users_and_roles_tables',
        '2024_01_01_000002_create_sessions_table',
        '2024_01_01_000003_create_vehicles_table',
        '2024_01_01_000004_create_service_requests_table'
    ];
    
    $executedMigrations = array_column($migrations, 'migration');
    $missing = array_diff($expectedMigrations, $executedMigrations);
    
    if (empty($missing)) {
        echo "  ✓ PASSED: All 4 migrations executed\n\n";
        $passed++;
    } else {
        echo "  ✗ FAILED: Missing migrations: " . implode(', ', $missing) . "\n\n";
        $failed++;
    }
} catch (\Exception $e) {
    echo "  ✗ FAILED: " . $e->getMessage() . "\n\n";
    $failed++;
}

// Test 3: Tables Exist
echo "[TEST 3] Database Tables\n";
try {
    $tables = ['users', 'roles', 'user_roles', 'sessions', 'vehicles', 'service_requests'];
    $missingTables = [];
    
    foreach ($tables as $table) {
        $result = Database::fetchOne("SHOW TABLES LIKE '{$table}'");
        if (!$result) {
            $missingTables[] = $table;
        }
    }
    
    if (empty($missingTables)) {
        echo "  ✓ PASSED: All 6 core tables exist\n\n";
        $passed++;
    } else {
        echo "  ✗ FAILED: Missing tables: " . implode(', ', $missingTables) . "\n\n";
        $failed++;
    }
} catch (\Exception $e) {
    echo "  ✗ FAILED: " . $e->getMessage() . "\n\n";
    $failed++;
}

// Test 4: Users Seeded
echo "[TEST 4] Users Seeded\n";
try {
    $userCount = Database::fetchOne('SELECT COUNT(*) as c FROM users WHERE deleted_at IS NULL')['c'];
    
    if ($userCount > 0) {
        echo "  ✓ PASSED: {$userCount} users in database\n\n";
        $passed++;
    } else {
        echo "  ⚠ WARNING: No users found (seeders not run)\n\n";
        $warnings++;
    }
} catch (\Exception $e) {
    echo "  ✗ FAILED: " . $e->getMessage() . "\n\n";
    $failed++;
}

// Test 5: Roles Seeded
echo "[TEST 5] Roles Configured\n";
try {
    $roles = Database::fetchAll('SELECT slug FROM roles ORDER BY id');
    $roleSlugs = array_column($roles, 'slug');
    $expectedRoles = ['customer', 'mechanic', 'administrator', 'super_admin', 'support'];
    
    $missing = array_diff($expectedRoles, $roleSlugs);
    
    if (empty($missing)) {
        echo "  ✓ PASSED: All 5 roles configured\n\n";
        $passed++;
    } else {
        echo "  ⚠ WARNING: Missing roles: " . implode(', ', $missing) . "\n\n";
        $warnings++;
    }
} catch (\Exception $e) {
    echo "  ✗ FAILED: " . $e->getMessage() . "\n\n";
    $failed++;
}

// Test 6: Customers with Vehicles
echo "[TEST 6] Customer-Vehicle Relations\n";
try {
    $customersWithVehicles = Database::fetchAll('
        SELECT COUNT(DISTINCT v.user_id) as count
        FROM vehicles v
        INNER JOIN user_roles ur ON v.user_id = ur.user_id
        INNER JOIN roles r ON ur.role_id = r.id
        WHERE r.slug = "customer" 
        AND ur.is_active = 1
        AND v.deleted_at IS NULL
    ');
    
    $count = $customersWithVehicles[0]['count'];
    
    if ($count > 0) {
        echo "  ✓ PASSED: {$count} customers have vehicles\n\n";
        $passed++;
    } else {
        echo "  ⚠ WARNING: No customers with vehicles\n\n";
        $warnings++;
    }
} catch (\Exception $e) {
    echo "  ✗ FAILED: " . $e->getMessage() . "\n\n";
    $failed++;
}

// Test 7: Service Requests Seeded
echo "[TEST 7] Service Requests\n";
try {
    $requestCount = Database::fetchOne('SELECT COUNT(*) as c FROM service_requests')['c'];
    
    if ($requestCount > 0) {
        $statuses = Database::fetchAll('SELECT status, COUNT(*) as c FROM service_requests GROUP BY status');
        echo "  ✓ PASSED: {$requestCount} service requests\n";
        foreach ($statuses as $status) {
            echo "    - {$status['status']}: {$status['c']}\n";
        }
        echo "\n";
        $passed++;
    } else {
        echo "  ⚠ WARNING: No service requests (seeder not run)\n\n";
        $warnings++;
    }
} catch (\Exception $e) {
    echo "  ✗ FAILED: " . $e->getMessage() . "\n\n";
    $failed++;
}

// Test 8: Foreign Keys
echo "[TEST 8] Foreign Key Constraints\n";
try {
    $fkCount = Database::fetchAll("
        SELECT COUNT(*) as c 
        FROM information_schema.KEY_COLUMN_USAGE 
        WHERE TABLE_SCHEMA = ? 
        AND REFERENCED_TABLE_NAME IS NOT NULL
    ", [$env['DB_DATABASE'] ?? 'parce']);
    
    $count = $fkCount[0]['c'];
    
    if ($count >= 10) {
        echo "  ✓ PASSED: {$count} foreign key constraints configured\n\n";
        $passed++;
    } else {
        echo "  ⚠ WARNING: Only {$count} foreign keys (expected >= 10)\n\n";
        $warnings++;
    }
} catch (\Exception $e) {
    echo "  ⚠ WARNING: Cannot validate foreign keys\n\n";
    $warnings++;
}

// Test 9: Syntax Validation
echo "[TEST 9] PHP Syntax Validation\n";
$filesToCheck = [
    'app/Middleware/AuthMiddleware.php',
    'app/Middleware/RBACMiddleware.php',
    'app/Controllers/Auth/AuthController.php',
    'app/Controllers/VehicleController.php',
    'app/Controllers/ServiceRequestController.php',
    'config/routes.php'
];

$syntaxErrors = [];
foreach ($filesToCheck as $file) {
    $output = [];
    $returnCode = 0;
    exec("php -l {$file} 2>&1", $output, $returnCode);
    if ($returnCode !== 0) {
        $syntaxErrors[] = $file;
    }
}

if (empty($syntaxErrors)) {
    echo "  ✓ PASSED: All " . count($filesToCheck) . " files have valid syntax\n\n";
    $passed++;
} else {
    echo "  ✗ FAILED: Syntax errors in: " . implode(', ', $syntaxErrors) . "\n\n";
    $failed++;
}

// Test 10: Required Classes Exist
echo "[TEST 10] Core Classes\n";
$classesToCheck = [
    'App\\Middleware\\AuthMiddleware',
    'App\\Middleware\\RBACMiddleware',
    'App\\Infrastructure\\Http\\ResponseFormatter',
    'App\\Infrastructure\\Auth\\Services\\SessionManager',
    'App\\Infrastructure\\Auth\\Services\\RoleValidator'
];

$missingClasses = [];
foreach ($classesToCheck as $class) {
    if (!class_exists($class)) {
        $missingClasses[] = $class;
    }
}

if (empty($missingClasses)) {
    echo "  ✓ PASSED: All " . count($classesToCheck) . " core classes exist\n\n";
    $passed++;
} else {
    echo "  ✗ FAILED: Missing classes: " . implode(', ', $missingClasses) . "\n\n";
    $failed++;
}

// Summary
echo "=== VALIDATION SUMMARY ===\n\n";
echo "Total Tests: " . ($passed + $failed + $warnings) . "\n";
echo "✓ Passed: {$passed}\n";
echo "✗ Failed: {$failed}\n";
echo "⚠ Warnings: {$warnings}\n\n";

if ($failed === 0) {
    if ($warnings === 0) {
        echo "🎉 ALL TESTS PASSED - Backend is stable and ready!\n\n";
        exit(0);
    } else {
        echo "✅ TESTS PASSED with warnings - Backend is functional but check warnings\n\n";
        exit(0);
    }
} else {
    echo "❌ VALIDATION FAILED - Fix errors before continuing\n\n";
    exit(1);
}
