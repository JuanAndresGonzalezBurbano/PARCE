<?php

/**
 * Validate Seeded Vehicles
 * 
 * Validates that vehicles were seeded correctly with proper foreign keys
 */

// Este script vive dos niveles bajo la raíz del proyecto (scripts/validation/)
define('BASE_PATH', dirname(__DIR__, 2));

require_once BASE_PATH . '/vendor/autoload.php';

// Load environment variables manually
$envFile = BASE_PATH . '/.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        if (strpos($line, '=') === false) continue;
        list($name, $value) = explode('=', $line, 2);
        $_ENV[trim($name)] = trim($value);
    }
}

use App\Core\Database;

echo "\n";
echo "======================================================\n";
echo "Vehicle Seeding Validation\n";
echo "======================================================\n\n";

// Query vehicles with user information
$vehicles = Database::fetchAll('
    SELECT 
        v.id, 
        v.user_id, 
        u.email, 
        v.license_plate, 
        v.make, 
        v.model, 
        v.year, 
        v.color,
        v.vin,
        v.vehicle_type,
        v.fuel_type,
        v.nickname,
        v.is_primary, 
        v.status,
        v.deleted_at
    FROM vehicles v 
    JOIN users u ON v.user_id = u.id 
    ORDER BY v.user_id, v.is_primary DESC, v.created_at ASC
');

if (empty($vehicles)) {
    echo "✗ No vehicles found in database\n";
    exit(1);
}

echo "Found " . count($vehicles) . " vehicles:\n\n";

$userVehicleCounts = [];
$primaryCounts = [];

foreach ($vehicles as $vehicle) {
    $userId = $vehicle['user_id'];
    $email = $vehicle['email'];
    
    // Track counts
    if (!isset($userVehicleCounts[$userId])) {
        $userVehicleCounts[$userId] = 0;
        $primaryCounts[$userId] = 0;
    }
    $userVehicleCounts[$userId]++;
    
    if ($vehicle['is_primary']) {
        $primaryCounts[$userId]++;
    }
    
    // Display vehicle
    $primaryFlag = $vehicle['is_primary'] ? '★ PRIMARY' : '  ';
    $deletedFlag = $vehicle['deleted_at'] ? ' [DELETED]' : '';
    
    echo sprintf(
        "%s ID: %-3d | User: %-30s | %s %s %s (%s) | Plate: %-10s | Status: %s%s\n",
        $primaryFlag,
        $vehicle['id'],
        $email,
        $vehicle['make'],
        $vehicle['model'],
        $vehicle['year'],
        $vehicle['vehicle_type'],
        $vehicle['license_plate'],
        $vehicle['status'],
        $deletedFlag
    );
}

echo "\n";
echo "======================================================\n";
echo "Validation Results\n";
echo "======================================================\n\n";

$passed = 0;
$failed = 0;

// Validate: All vehicles have valid foreign keys
$invalidForeignKeys = Database::fetchOne('
    SELECT COUNT(*) as count 
    FROM vehicles v 
    LEFT JOIN users u ON v.user_id = u.id 
    WHERE u.id IS NULL
');

if ($invalidForeignKeys['count'] == 0) {
    echo "✓ All vehicles have valid user_id foreign keys\n";
    $passed++;
} else {
    echo "✗ Found {$invalidForeignKeys['count']} vehicles with invalid user_id\n";
    $failed++;
}

// Validate: All license plates are unique
$duplicatePlates = Database::fetchOne('
    SELECT COUNT(*) as count 
    FROM (
        SELECT license_plate, COUNT(*) as cnt 
        FROM vehicles 
        GROUP BY license_plate 
        HAVING cnt > 1
    ) as dupes
');

if ($duplicatePlates['count'] == 0) {
    echo "✓ All license plates are unique\n";
    $passed++;
} else {
    echo "✗ Found {$duplicatePlates['count']} duplicate license plates\n";
    $failed++;
}

// Validate: All VINs are unique (or NULL)
$duplicateVins = Database::fetchOne('
    SELECT COUNT(*) as count 
    FROM (
        SELECT vin, COUNT(*) as cnt 
        FROM vehicles 
        WHERE vin IS NOT NULL
        GROUP BY vin 
        HAVING cnt > 1
    ) as dupes
');

if ($duplicateVins['count'] == 0) {
    echo "✓ All VINs are unique\n";
    $passed++;
} else {
    echo "✗ Found {$duplicateVins['count']} duplicate VINs\n";
    $failed++;
}

// Validate: Each user has at most one primary vehicle
$multiplePrimary = false;
foreach ($primaryCounts as $userId => $count) {
    if ($count > 1) {
        echo "✗ User ID {$userId} has {$count} primary vehicles (should be 0 or 1)\n";
        $failed++;
        $multiplePrimary = true;
    }
}
if (!$multiplePrimary) {
    echo "✓ No user has multiple primary vehicles\n";
    $passed++;
}

// Validate: All vehicles have required fields
$missingFields = Database::fetchOne('
    SELECT COUNT(*) as count 
    FROM vehicles 
    WHERE license_plate IS NULL 
       OR make IS NULL 
       OR model IS NULL 
       OR year IS NULL 
       OR vehicle_type IS NULL 
       OR fuel_type IS NULL
');

if ($missingFields['count'] == 0) {
    echo "✓ All vehicles have required fields\n";
    $passed++;
} else {
    echo "✗ Found {$missingFields['count']} vehicles with missing required fields\n";
    $failed++;
}

// Validate: All license plates are normalized (uppercase)
$unnormalizedPlates = Database::fetchOne('
    SELECT COUNT(*) as count 
    FROM vehicles 
    WHERE license_plate != UPPER(license_plate)
');

if ($unnormalizedPlates['count'] == 0) {
    echo "✓ All license plates are normalized (uppercase)\n";
    $passed++;
} else {
    echo "✗ Found {$unnormalizedPlates['count']} unnormalized license plates\n";
    $failed++;
}

// Validate: All VINs are normalized (uppercase, 17 chars)
$invalidVins = Database::fetchOne('
    SELECT COUNT(*) as count 
    FROM vehicles 
    WHERE vin IS NOT NULL 
      AND (LENGTH(vin) != 17 OR vin != UPPER(vin))
');

if ($invalidVins['count'] == 0) {
    echo "✓ All VINs are valid (17 characters, uppercase)\n";
    $passed++;
} else {
    echo "✗ Found {$invalidVins['count']} invalid VINs\n";
    $failed++;
}

// Summary
echo "\n";
echo "======================================================\n";
echo "Summary\n";
echo "======================================================\n";
echo "Total Vehicles: " . count($vehicles) . "\n";
echo "Validation Tests: " . ($passed + $failed) . "\n";
echo "Passed: {$passed}\n";
echo "Failed: {$failed}\n";
echo "\n";

if ($failed === 0) {
    echo "✓ All validation tests passed!\n\n";
    exit(0);
} else {
    echo "✗ Some validation tests failed!\n\n";
    exit(1);
}
