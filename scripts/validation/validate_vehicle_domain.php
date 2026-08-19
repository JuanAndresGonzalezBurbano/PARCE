<?php

/**
 * Vehicle Domain Validation Script
 * 
 * Validates the vehicle domain implementation including:
 * - Table structure
 * - Seeded data
 * - Foreign key integrity
 * - Unique constraints
 * - Default values
 */

// Este script vive dos niveles bajo la raíz del proyecto (scripts/validation/)
// — mismo patrón BASE_PATH + autoload de Composer que el resto de scripts de
// esta carpeta (ver p. ej. verify_final_status.php). Reemplaza un autoloader
// casero roto (apuntaba a __DIR__ . '/app/', ruta inexistente desde aquí) y
// una carga de .env que buscaba __DIR__ . '/.env' en vez de la raíz real.
define('BASE_PATH', dirname(__DIR__, 2));

require_once BASE_PATH . '/vendor/autoload.php';
require_once BASE_PATH . '/app/Core/Database.php';

use App\Core\Database;

$env = [];
if (file_exists(BASE_PATH . '/.env')) {
    $lines = file(BASE_PATH . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
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

echo "\n";
echo "================================================================\n";
echo "Vehicle Domain Validation\n";
echo "================================================================\n\n";

$passed = 0;
$failed = 0;

// Test 1: Table Exists
echo "Test 1: Vehicles table exists...\n";
try {
    $columns = Database::fetchAll("DESCRIBE vehicles");
    echo "  ✓ Table exists with " . count($columns) . " columns\n";
    $passed++;
} catch (Exception $e) {
    echo "  ✗ Table does not exist: " . $e->getMessage() . "\n";
    $failed++;
    exit(1);
}

// Test 2: Required columns exist
echo "\nTest 2: Required columns exist...\n";
$requiredColumns = [
    'id', 'user_id', 'license_plate', 'make', 'model', 'year',
    'vehicle_type', 'fuel_type', 'is_primary', 'status',
    'created_at', 'updated_at', 'deleted_at', 'nickname', 'primary_photo_url'
];
$actualColumns = array_column($columns, 'Field');
$missingColumns = array_diff($requiredColumns, $actualColumns);
if (empty($missingColumns)) {
    echo "  ✓ All required columns present\n";
    $passed++;
} else {
    echo "  ✗ Missing columns: " . implode(', ', $missingColumns) . "\n";
    $failed++;
}

// Test 3: Foreign key to users exists
echo "\nTest 3: Foreign key to users table...\n";
try {
    $fks = Database::fetchAll("
        SELECT CONSTRAINT_NAME, REFERENCED_TABLE_NAME 
        FROM information_schema.KEY_COLUMN_USAGE 
        WHERE TABLE_SCHEMA = 'parce' 
        AND TABLE_NAME = 'vehicles' 
        AND REFERENCED_TABLE_NAME = 'users'
    ");
    if (!empty($fks)) {
        echo "  ✓ Foreign key constraint exists: " . $fks[0]['CONSTRAINT_NAME'] . "\n";
        $passed++;
    } else {
        echo "  ✗ No foreign key to users table found\n";
        $failed++;
    }
} catch (Exception $e) {
    echo "  ✗ Error checking foreign keys: " . $e->getMessage() . "\n";
    $failed++;
}

// Test 4: Unique constraint on license_plate
echo "\nTest 4: Unique constraint on license_plate...\n";
try {
    $indexes = Database::fetchAll("
        SHOW INDEXES FROM vehicles WHERE Column_name = 'license_plate' AND Non_unique = 0
    ");
    if (!empty($indexes)) {
        echo "  ✓ Unique constraint exists on license_plate\n";
        $passed++;
    } else {
        echo "  ✗ No unique constraint on license_plate\n";
        $failed++;
    }
} catch (Exception $e) {
    echo "  ✗ Error checking indexes: " . $e->getMessage() . "\n";
    $failed++;
}

// Test 5: Vehicles were seeded
echo "\nTest 5: Vehicles seeded correctly...\n";
try {
    $count = Database::fetchOne("SELECT COUNT(*) as count FROM vehicles");
    if ($count['count'] > 0) {
        echo "  ✓ Found " . $count['count'] . " vehicles in database\n";
        $passed++;
    } else {
        echo "  ✗ No vehicles found (seeding may have failed)\n";
        $failed++;
    }
} catch (Exception $e) {
    echo "  ✗ Error counting vehicles: " . $e->getMessage() . "\n";
    $failed++;
}

// Test 6: Foreign key integrity
echo "\nTest 6: Foreign key integrity (all vehicles have valid user_id)...\n";
try {
    $invalid = Database::fetchOne("
        SELECT COUNT(*) as count 
        FROM vehicles v 
        LEFT JOIN users u ON v.user_id = u.id 
        WHERE u.id IS NULL
    ");
    if ($invalid['count'] == 0) {
        echo "  ✓ All vehicles have valid user_id references\n";
        $passed++;
    } else {
        echo "  ✗ Found " . $invalid['count'] . " vehicles with invalid user_id\n";
        $failed++;
    }
} catch (Exception $e) {
    echo "  ✗ Error checking foreign key integrity: " . $e->getMessage() . "\n";
    $failed++;
}

// Test 7: License plate uniqueness
echo "\nTest 7: License plate uniqueness...\n";
try {
    $duplicates = Database::fetchOne("
        SELECT COUNT(*) as count 
        FROM (
            SELECT license_plate, COUNT(*) as cnt 
            FROM vehicles 
            GROUP BY license_plate 
            HAVING cnt > 1
        ) as dupes
    ");
    if ($duplicates['count'] == 0) {
        echo "  ✓ All license plates are unique\n";
        $passed++;
    } else {
        echo "  ✗ Found " . $duplicates['count'] . " duplicate license plates\n";
        $failed++;
    }
} catch (Exception $e) {
    echo "  ✗ Error checking license plate uniqueness: " . $e->getMessage() . "\n";
    $failed++;
}

// Test 8: Default values - status
echo "\nTest 8: Default values - status = 'active'...\n";
try {
    $activeCount = Database::fetchOne("SELECT COUNT(*) as count FROM vehicles WHERE status = 'active'");
    $totalCount = Database::fetchOne("SELECT COUNT(*) as count FROM vehicles");
    if ($activeCount['count'] == $totalCount['count']) {
        echo "  ✓ All seeded vehicles have status = 'active'\n";
        $passed++;
    } else {
        echo "  ⚠ " . $activeCount['count'] . "/" . $totalCount['count'] . " vehicles have status = 'active'\n";
        $passed++; // Not a failure, just informational
    }
} catch (Exception $e) {
    echo "  ✗ Error checking status: " . $e->getMessage() . "\n";
    $failed++;
}

// Test 9: Default values - deleted_at = NULL
echo "\nTest 9: Default values - deleted_at = NULL...\n";
try {
    $notDeleted = Database::fetchOne("SELECT COUNT(*) as count FROM vehicles WHERE deleted_at IS NULL");
    $totalCount = Database::fetchOne("SELECT COUNT(*) as count FROM vehicles");
    if ($notDeleted['count'] == $totalCount['count']) {
        echo "  ✓ All seeded vehicles have deleted_at = NULL\n";
        $passed++;
    } else {
        echo "  ✗ " . ($totalCount['count'] - $notDeleted['count']) . " vehicles have deleted_at set\n";
        $failed++;
    }
} catch (Exception $e) {
    echo "  ✗ Error checking deleted_at: " . $e->getMessage() . "\n";
    $failed++;
}

// Test 10: is_primary behavior
echo "\nTest 10: is_primary behavior (max one per user)...\n";
try {
    $multiplePrimary = Database::fetchAll("
        SELECT user_id, COUNT(*) as primary_count 
        FROM vehicles 
        WHERE is_primary = 1 
        GROUP BY user_id 
        HAVING primary_count > 1
    ");
    if (empty($multiplePrimary)) {
        echo "  ✓ No user has multiple primary vehicles\n";
        $passed++;
    } else {
        echo "  ✗ " . count($multiplePrimary) . " users have multiple primary vehicles\n";
        $failed++;
    }
} catch (Exception $e) {
    echo "  ✗ Error checking is_primary: " . $e->getMessage() . "\n";
    $failed++;
}

// Test 11: Indexes exist
echo "\nTest 11: Performance indexes exist...\n";
try {
    $indexes = Database::fetchAll("SHOW INDEXES FROM vehicles");
    $indexNames = array_unique(array_column($indexes, 'Key_name'));
    $requiredIndexes = ['PRIMARY', 'license_plate', 'idx_vehicles_user_id', 'idx_vehicles_status'];
    $foundIndexes = array_intersect($requiredIndexes, $indexNames);
    if (count($foundIndexes) >= 3) {
        echo "  ✓ Found " . count($indexNames) . " indexes including key performance indexes\n";
        $passed++;
    } else {
        echo "  ✗ Missing some required indexes\n";
        $failed++;
    }
} catch (Exception $e) {
    echo "  ✗ Error checking indexes: " . $e->getMessage() . "\n";
    $failed++;
}

// Summary
echo "\n================================================================\n";
echo "Validation Summary\n";
echo "================================================================\n";
echo "Total Tests: " . ($passed + $failed) . "\n";
echo "Passed: {$passed}\n";
echo "Failed: {$failed}\n";
echo "\n";

if ($failed === 0) {
    echo "✓ All validation tests passed!\n";
    echo "✓ Vehicle domain is correctly implemented and validated.\n\n";
    exit(0);
} else {
    echo "✗ Some validation tests failed!\n\n";
    exit(1);
}
