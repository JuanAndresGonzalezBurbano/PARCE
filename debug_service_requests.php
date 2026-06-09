<?php

/**
 * Debug Service Requests Seeder
 * 
 * Diagnostic script to identify why ServiceRequestsSeeder inserts 0 records
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

// Configure database
Database::setConfig([
    'driver' => $env['DB_CONNECTION'] ?? 'mysql',
    'host' => $env['DB_HOST'] ?? '127.0.0.1',
    'port' => (int)($env['DB_PORT'] ?? 3306),
    'database' => $env['DB_DATABASE'] ?? '',
    'username' => $env['DB_USERNAME'] ?? 'root',
    'password' => $env['DB_PASSWORD'] ?? '',
    'charset' => 'utf8mb4'
]);

echo "DEBUG SERVICE REQUESTS\n";
echo "============================================================\n\n";

// === CUSTOMERS ===
echo "=== CUSTOMERS ===\n";
$customers = Database::fetchAll(
    'SELECT u.id, u.email 
     FROM users u
     INNER JOIN user_roles ur ON u.id = ur.user_id
     INNER JOIN roles r ON ur.role_id = r.id
     WHERE r.slug = ? AND u.deleted_at IS NULL
     LIMIT 2',
    ['customer']
);

echo "Total customers found: " . count($customers) . "\n";
foreach ($customers as $customer) {
    echo "  - ID: {$customer['id']}, Email: {$customer['email']}\n";
}
echo "\n";

// === MECHANICS ===
echo "=== MECHANICS ===\n";
$mechanics = Database::fetchAll(
    'SELECT u.id, u.email 
     FROM users u
     INNER JOIN user_roles ur ON u.id = ur.user_id
     INNER JOIN roles r ON ur.role_id = r.id
     WHERE r.slug = ? AND u.deleted_at IS NULL
     LIMIT 2',
    ['mechanic']
);

echo "Total mechanics found: " . count($mechanics) . "\n";
foreach ($mechanics as $mechanic) {
    echo "  - ID: {$mechanic['id']}, Email: {$mechanic['email']}\n";
}
echo "\n";

// === VEHICLES ===
echo "=== VEHICLES ===\n";
$vehicles = Database::fetchAll(
    'SELECT id, user_id, make, model FROM vehicles WHERE deleted_at IS NULL'
);

echo "Total vehicles found: " . count($vehicles) . "\n";
foreach ($vehicles as $vehicle) {
    echo "  - Vehicle ID: {$vehicle['id']}, Owner ID: {$vehicle['user_id']}, {$vehicle['make']} {$vehicle['model']}\n";
}
echo "\n";

// === RELATION VALIDATION ===
echo "=== RELATION VALIDATION ===\n";

// Check customers with vehicles
echo "Customers with vehicles:\n";
if (!empty($customers)) {
    foreach ($customers as $customer) {
        $customerId = (int)$customer['id'];
        $hasVehicle = false;
        
        foreach ($vehicles as $vehicle) {
            if ((int)$vehicle['user_id'] === $customerId) {
                echo "  ✓ Customer ID {$customerId} ({$customer['email']}) owns Vehicle ID {$vehicle['id']}\n";
                $hasVehicle = true;
            }
        }
        
        if (!$hasVehicle) {
            echo "  ✗ Customer ID {$customerId} ({$customer['email']}) has NO vehicles\n";
        }
    }
} else {
    echo "  ✗ No customers found\n";
}
echo "\n";

// Check vehicle owners with customer role
echo "Vehicle owners with customer role:\n";
$vehicleOwnerIds = array_unique(array_column($vehicles, 'user_id'));
foreach ($vehicleOwnerIds as $ownerId) {
    $isCustomer = false;
    foreach ($customers as $customer) {
        if ((int)$customer['id'] === (int)$ownerId) {
            $isCustomer = true;
            echo "  ✓ Owner ID {$ownerId} is a customer\n";
            break;
        }
    }
    
    if (!$isCustomer) {
        echo "  ✗ Owner ID {$ownerId} is NOT a customer (vehicles exist but owner lacks customer role)\n";
    }
}
echo "\n";

// === DIAGNOSIS ===
echo "=== DIAGNOSIS ===\n";
if (empty($customers)) {
    echo "❌ CRITICAL: No customers found. ServiceRequestsSeeder will return early.\n";
} elseif (empty($vehicles)) {
    echo "❌ CRITICAL: No vehicles found. ServiceRequestsSeeder will return early.\n";
} else {
    $customersWithVehicles = 0;
    foreach ($customers as $customer) {
        $customerId = (int)$customer['id'];
        foreach ($vehicles as $vehicle) {
            if ((int)$vehicle['user_id'] === $customerId) {
                $customersWithVehicles++;
                break;
            }
        }
    }
    
    if ($customersWithVehicles === 0) {
        echo "❌ CRITICAL: No customers own vehicles. getVehicleForCustomer() will return null for all requests.\n";
        echo "   This explains why 0 service requests are inserted.\n";
    } else {
        echo "✓ Found {$customersWithVehicles} customers with vehicles. Should be able to create requests.\n";
    }
}

echo "\n============================================================\n";
echo "DEBUG COMPLETE\n";
