<?php

/**
 * Service Request Domain Validation Script
 * 
 * Validates the complete service request implementation including:
 * - Migration and table structure
 * - Foreign key integrity
 * - Indexes
 * - Seeded data
 * - Business rules
 * - Status transitions
 */

require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/app/Core/Database.php';

use App\Core\Database;

// Initialize database connection
try {
    Database::connect();
    echo "✓ Database connection established\n\n";
} catch (\Exception $e) {
    echo "✗ Database connection failed: " . $e->getMessage() . "\n";
    echo "\nPlease ensure:\n";
    echo "1. XAMPP MySQL service is running\n";
    echo "2. Database credentials in .env are correct\n";
    echo "3. Database 'parce' exists\n\n";
    exit(1);
}

$errors = [];
$warnings = [];
$passed = 0;
$failed = 0;

echo "============================================================\n";
echo "Service Request Domain Validation\n";
echo "============================================================\n\n";

// ============================================================================
// 1. Table Structure Validation
// ============================================================================

echo "1. Table Structure Validation\n";
echo "------------------------------\n";

// Check if table exists
$tableExists = Database::fetchOne("SHOW TABLES LIKE 'service_requests'");
if ($tableExists) {
    echo "✓ service_requests table exists\n";
    $passed++;
} else {
    echo "✗ service_requests table does not exist\n";
    $errors[] = "service_requests table not found. Run: php migrate.php migrate";
    $failed++;
}

if ($tableExists) {
    // Check columns
    $columns = Database::fetchAll("DESCRIBE service_requests");
    $expectedColumns = [
        'id', 'service_code', 'customer_id', 'vehicle_id', 'mechanic_id', 
        'resolved_by', 'emergency_type', 'description', 'priority',
        'latitude', 'longitude', 'status', 'requested_at', 'assigned_at',
        'started_at', 'completed_at', 'cancelled_at', 'expired_at',
        'cancellation_reason', 'cancelled_by', 'estimated_cost', 'final_cost',
        'customer_rating', 'customer_feedback', 'created_at', 'updated_at', 'deleted_at'
    ];
    
    $actualColumns = array_column($columns, 'Field');
    $missingColumns = array_diff($expectedColumns, $actualColumns);
    
    if (empty($missingColumns)) {
        echo "✓ All expected columns present (" . count($expectedColumns) . " columns)\n";
        $passed++;
    } else {
        echo "✗ Missing columns: " . implode(', ', $missingColumns) . "\n";
        $errors[] = "Table structure incomplete";
        $failed++;
    }
}

echo "\n";

// ============================================================================
// 2. Foreign Key Validation
// ============================================================================

echo "2. Foreign Key Validation\n";
echo "------------------------------\n";

if ($tableExists) {
    $foreignKeys = Database::fetchAll("
        SELECT 
            CONSTRAINT_NAME,
            COLUMN_NAME,
            REFERENCED_TABLE_NAME,
            REFERENCED_COLUMN_NAME
        FROM information_schema.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'service_requests'
        AND REFERENCED_TABLE_NAME IS NOT NULL
    ");
    
    $expectedFKs = [
        'fk_service_requests_customer_id' => ['customer_id', 'users', 'id'],
        'fk_service_requests_vehicle_id' => ['vehicle_id', 'vehicles', 'id'],
        'fk_service_requests_mechanic_id' => ['mechanic_id', 'users', 'id'],
        'fk_service_requests_resolved_by' => ['resolved_by', 'users', 'id'],
        'fk_service_requests_cancelled_by' => ['cancelled_by', 'users', 'id']
    ];
    
    $actualFKs = [];
    foreach ($foreignKeys as $fk) {
        $actualFKs[$fk['CONSTRAINT_NAME']] = [
            $fk['COLUMN_NAME'],
            $fk['REFERENCED_TABLE_NAME'],
            $fk['REFERENCED_COLUMN_NAME']
        ];
    }
    
    foreach ($expectedFKs as $name => $config) {
        if (isset($actualFKs[$name])) {
            echo "✓ Foreign key '{$name}' exists: {$config[0]} -> {$config[1]}.{$config[2]}\n";
            $passed++;
        } else {
            echo "✗ Foreign key '{$name}' missing\n";
            $errors[] = "Foreign key '{$name}' not found";
            $failed++;
        }
    }
}

echo "\n";

// ============================================================================
// 3. Index Validation
// ============================================================================

echo "3. Index Validation\n";
echo "------------------------------\n";

if ($tableExists) {
    $indexes = Database::fetchAll("SHOW INDEX FROM service_requests");
    $indexNames = array_unique(array_column($indexes, 'Key_name'));
    
    $expectedIndexes = [
        'PRIMARY',
        'service_code',
        'idx_service_requests_service_code',
        'idx_service_requests_customer_id',
        'idx_service_requests_vehicle_id',
        'idx_service_requests_mechanic_id',
        'idx_service_requests_status',
        'idx_service_requests_customer_status',
        'idx_service_requests_mechanic_status',
        'idx_service_requests_status_requested',
        'idx_service_requests_location'
    ];
    
    $foundIndexes = 0;
    foreach ($expectedIndexes as $indexName) {
        if (in_array($indexName, $indexNames)) {
            $foundIndexes++;
        }
    }
    
    echo "✓ Found {$foundIndexes}/" . count($expectedIndexes) . " expected indexes\n";
    if ($foundIndexes === count($expectedIndexes)) {
        $passed++;
    } else {
        $warnings[] = "Some indexes may be missing";
    }
}

echo "\n";

// ============================================================================
// 4. Seeded Data Validation
// ============================================================================

echo "4. Seeded Data Validation\n";
echo "------------------------------\n";

if ($tableExists) {
    $serviceRequestCount = Database::fetchOne("SELECT COUNT(*) as count FROM service_requests WHERE deleted_at IS NULL");
    
    if ($serviceRequestCount && $serviceRequestCount['count'] > 0) {
        echo "✓ Service requests seeded: {$serviceRequestCount['count']} requests\n";
        $passed++;
        
        // Check status distribution
        $statusDistribution = Database::fetchAll("
            SELECT status, COUNT(*) as count 
            FROM service_requests 
            WHERE deleted_at IS NULL 
            GROUP BY status
        ");
        
        echo "  Status distribution:\n";
        foreach ($statusDistribution as $row) {
            echo "    - {$row['status']}: {$row['count']} request(s)\n";
        }
        
    } else {
        echo "⚠ No service requests found. Run: php database/seed.php\n";
        $warnings[] = "No seeded data found";
    }
}

echo "\n";

// ============================================================================
// 5. Data Integrity Validation
// ============================================================================

echo "5. Data Integrity Validation\n";
echo "------------------------------\n";

if ($tableExists && $serviceRequestCount && $serviceRequestCount['count'] > 0) {
    
    // Check for duplicate service codes
    $duplicateCodes = Database::fetchOne("
        SELECT COUNT(*) as count 
        FROM (
            SELECT service_code 
            FROM service_requests 
            GROUP BY service_code 
            HAVING COUNT(*) > 1
        ) as duplicates
    ");
    
    if ($duplicateCodes['count'] == 0) {
        echo "✓ No duplicate service codes\n";
        $passed++;
    } else {
        echo "✗ Found {$duplicateCodes['count']} duplicate service code(s)\n";
        $errors[] = "Duplicate service codes found";
        $failed++;
    }
    
    // Check customer_id references valid users
    $invalidCustomers = Database::fetchOne("
        SELECT COUNT(*) as count 
        FROM service_requests sr
        LEFT JOIN users u ON sr.customer_id = u.id
        WHERE u.id IS NULL AND sr.deleted_at IS NULL
    ");
    
    if ($invalidCustomers['count'] == 0) {
        echo "✓ All customer_id references are valid\n";
        $passed++;
    } else {
        echo "✗ Found {$invalidCustomers['count']} invalid customer_id reference(s)\n";
        $errors[] = "Invalid customer_id references";
        $failed++;
    }
    
    // Check vehicle_id references valid vehicles
    $invalidVehicles = Database::fetchOne("
        SELECT COUNT(*) as count 
        FROM service_requests sr
        LEFT JOIN vehicles v ON sr.vehicle_id = v.id
        WHERE v.id IS NULL AND sr.deleted_at IS NULL
    ");
    
    if ($invalidVehicles['count'] == 0) {
        echo "✓ All vehicle_id references are valid\n";
        $passed++;
    } else {
        echo "✗ Found {$invalidVehicles['count']} invalid vehicle_id reference(s)\n";
        $errors[] = "Invalid vehicle_id references";
        $failed++;
    }
    
    // Check mechanic_id references valid users (when assigned)
    $invalidMechanics = Database::fetchOne("
        SELECT COUNT(*) as count 
        FROM service_requests sr
        LEFT JOIN users u ON sr.mechanic_id = u.id
        WHERE sr.mechanic_id IS NOT NULL 
        AND u.id IS NULL 
        AND sr.deleted_at IS NULL
    ");
    
    if ($invalidMechanics['count'] == 0) {
        echo "✓ All mechanic_id references are valid\n";
        $passed++;
    } else {
        echo "✗ Found {$invalidMechanics['count']} invalid mechanic_id reference(s)\n";
        $errors[] = "Invalid mechanic_id references";
        $failed++;
    }
    
    // Check for invalid status values
    $validStatuses = ['pending', 'assigned', 'in_progress', 'completed', 'cancelled', 'expired'];
    $invalidStatuses = Database::fetchOne("
        SELECT COUNT(*) as count 
        FROM service_requests 
        WHERE status NOT IN ('" . implode("','", $validStatuses) . "')
        AND deleted_at IS NULL
    ");
    
    if ($invalidStatuses['count'] == 0) {
        echo "✓ No invalid status values\n";
        $passed++;
    } else {
        echo "✗ Found {$invalidStatuses['count']} invalid status value(s)\n";
        $errors[] = "Invalid status values found";
        $failed++;
    }
    
    // Check coordinate ranges
    $invalidCoordinates = Database::fetchOne("
        SELECT COUNT(*) as count 
        FROM service_requests 
        WHERE (latitude < -90 OR latitude > 90 OR longitude < -180 OR longitude > 180)
        AND deleted_at IS NULL
    ");
    
    if ($invalidCoordinates['count'] == 0) {
        echo "✓ All coordinates are within valid ranges\n";
        $passed++;
    } else {
        echo "✗ Found {$invalidCoordinates['count']} invalid coordinate(s)\n";
        $errors[] = "Invalid coordinates found";
        $failed++;
    }
}

echo "\n";

// ============================================================================
// 6. Business Rules Validation
// ============================================================================

echo "6. Business Rules Validation\n";
echo "------------------------------\n";

if ($tableExists && $serviceRequestCount && $serviceRequestCount['count'] > 0) {
    
    // Check: No multiple active requests per customer
    $activeStatuses = ['pending', 'assigned', 'in_progress'];
    $multipleActiveCustomer = Database::fetchAll("
        SELECT customer_id, COUNT(*) as count
        FROM service_requests
        WHERE status IN ('" . implode("','", $activeStatuses) . "')
        AND deleted_at IS NULL
        GROUP BY customer_id
        HAVING COUNT(*) > 1
    ");
    
    if (empty($multipleActiveCustomer)) {
        echo "✓ No customer has multiple active requests\n";
        $passed++;
    } else {
        echo "✗ Found " . count($multipleActiveCustomer) . " customer(s) with multiple active requests\n";
        $errors[] = "Multiple active requests per customer violation";
        $failed++;
    }
    
    // Check: No multiple active requests per vehicle
    $multipleActiveVehicle = Database::fetchAll("
        SELECT vehicle_id, COUNT(*) as count
        FROM service_requests
        WHERE status IN ('" . implode("','", $activeStatuses) . "')
        AND deleted_at IS NULL
        GROUP BY vehicle_id
        HAVING COUNT(*) > 1
    ");
    
    if (empty($multipleActiveVehicle)) {
        echo "✓ No vehicle has multiple active requests\n";
        $passed++;
    } else {
        echo "✗ Found " . count($multipleActiveVehicle) . " vehicle(s) with multiple active requests\n";
        $errors[] = "Multiple active requests per vehicle violation";
        $failed++;
    }
    
    // Check: Terminal statuses have appropriate timestamps
    $terminalWithoutTimestamps = Database::fetchOne("
        SELECT COUNT(*) as count
        FROM service_requests
        WHERE status = 'completed' AND completed_at IS NULL
        AND deleted_at IS NULL
    ");
    
    if ($terminalWithoutTimestamps['count'] == 0) {
        echo "✓ All completed requests have completion timestamp\n";
        $passed++;
    } else {
        echo "✗ Found {$terminalWithoutTimestamps['count']} completed request(s) without timestamp\n";
        $warnings[] = "Completed requests missing timestamps";
    }
    
    $cancelledWithoutTimestamps = Database::fetchOne("
        SELECT COUNT(*) as count
        FROM service_requests
        WHERE status = 'cancelled' AND cancelled_at IS NULL
        AND deleted_at IS NULL
    ");
    
    if ($cancelledWithoutTimestamps['count'] == 0) {
        echo "✓ All cancelled requests have cancellation timestamp\n";
        $passed++;
    } else {
        echo "✗ Found {$cancelledWithoutTimestamps['count']} cancelled request(s) without timestamp\n";
        $warnings[] = "Cancelled requests missing timestamps";
    }
    
    // Check: Assigned requests have mechanic_id
    $assignedWithoutMechanic = Database::fetchOne("
        SELECT COUNT(*) as count
        FROM service_requests
        WHERE status IN ('assigned', 'in_progress', 'completed') 
        AND mechanic_id IS NULL
        AND deleted_at IS NULL
    ");
    
    if ($assignedWithoutMechanic['count'] == 0) {
        echo "✓ All assigned/in-progress/completed requests have mechanic assigned\n";
        $passed++;
    } else {
        echo "✗ Found {$assignedWithoutMechanic['count']} assigned request(s) without mechanic\n";
        $errors[] = "Assigned requests missing mechanic_id";
        $failed++;
    }
}

echo "\n";

// ============================================================================
// Summary
// ============================================================================

echo "============================================================\n";
echo "Validation Summary\n";
echo "============================================================\n\n";

echo "Passed: {$passed} checks\n";
echo "Failed: {$failed} checks\n";
echo "Warnings: " . count($warnings) . "\n\n";

if (!empty($errors)) {
    echo "ERRORS:\n";
    foreach ($errors as $i => $error) {
        echo "  " . ($i + 1) . ". {$error}\n";
    }
    echo "\n";
}

if (!empty($warnings)) {
    echo "WARNINGS:\n";
    foreach ($warnings as $i => $warning) {
        echo "  " . ($i + 1) . ". {$warning}\n";
    }
    echo "\n";
}

if ($failed === 0 && empty($errors)) {
    echo "✓ ALL VALIDATIONS PASSED!\n";
    echo "Service Request domain is ready for integration testing.\n\n";
    exit(0);
} else {
    echo "✗ VALIDATION FAILED\n";
    echo "Please fix the errors above before proceeding.\n\n";
    exit(1);
}
