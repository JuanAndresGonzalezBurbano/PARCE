<?php

/**
 * Fix: Assign Customer Roles to Vehicle Owners
 * 
 * Assigns customer role to users 1-4 who own vehicles
 */

// Este script vive dos niveles bajo la raíz del proyecto (scripts/maintenance/)
define('BASE_PATH', dirname(__DIR__, 2));

require_once BASE_PATH . '/vendor/autoload.php';
require_once BASE_PATH . '/app/Core/Database.php';

use App\Core\Database;

// Load .env
$env = [];
if (file_exists(BASE_PATH . '/.env')) {
    $lines = file(BASE_PATH . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
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

echo "FIX: ASSIGN CUSTOMER ROLE TO VEHICLE OWNERS\n";
echo "============================================================\n\n";

// Get customer role ID
$customerRole = Database::fetchOne('SELECT id FROM roles WHERE slug = ?', ['customer']);

if (!$customerRole) {
    echo "✗ Customer role not found!\n";
    exit(1);
}

$customerRoleId = $customerRole['id'];
echo "Customer role ID: {$customerRoleId}\n\n";

// Get vehicle owners without customer role
$vehicleOwners = Database::fetchAll(
    'SELECT DISTINCT v.user_id, u.email
     FROM vehicles v
     INNER JOIN users u ON v.user_id = u.id
     WHERE v.deleted_at IS NULL AND u.deleted_at IS NULL
     AND v.user_id NOT IN (
         SELECT ur.user_id 
         FROM user_roles ur 
         WHERE ur.role_id = ? AND ur.is_active = 1
     )
     ORDER BY v.user_id',
    [$customerRoleId]
);

if (empty($vehicleOwners)) {
    echo "✓ All vehicle owners already have customer role\n";
    exit(0);
}

echo "Assigning customer role to " . count($vehicleOwners) . " vehicle owners:\n\n";

foreach ($vehicleOwners as $owner) {
    $userId = (int)$owner['user_id'];
    $email = $owner['email'];
    
    // Check if user_role already exists (inactive)
    $existingRole = Database::fetchOne(
        'SELECT id, is_active FROM user_roles WHERE user_id = ? AND role_id = ?',
        [$userId, $customerRoleId]
    );
    
    if ($existingRole) {
        if ($existingRole['is_active'] == 0) {
            // Activate existing role
            Database::update('user_roles', ['is_active' => 1], ['id' => $existingRole['id']]);
            echo "  ✓ Activated customer role for User {$userId} ({$email})\n";
        } else {
            echo "  → User {$userId} ({$email}) already has active customer role\n";
        }
    } else {
        // Insert new role
        Database::insert('user_roles', [
            'user_id' => $userId,
            'role_id' => $customerRoleId,
            'is_active' => 1,
            'assigned_at' => date('Y-m-d H:i:s')
        ]);
        echo "  ✓ Assigned customer role to User {$userId} ({$email})\n";
    }
}

echo "\n============================================================\n";
echo "✓ FIX COMPLETE\n\n";

// Verify
echo "Verification:\n";
$customersWithVehicles = Database::fetchAll(
    'SELECT u.id, u.email, COUNT(v.id) as vehicle_count
     FROM users u
     INNER JOIN user_roles ur ON u.id = ur.user_id
     INNER JOIN roles r ON ur.role_id = r.id
     INNER JOIN vehicles v ON u.id = v.user_id
     WHERE r.slug = ? AND ur.is_active = 1 AND u.deleted_at IS NULL AND v.deleted_at IS NULL
     GROUP BY u.id, u.email',
    ['customer']
);

echo "Customers with vehicles: " . count($customersWithVehicles) . "\n";
foreach ($customersWithVehicles as $customer) {
    echo "  - User {$customer['id']} ({$customer['email']}): {$customer['vehicle_count']} vehicles\n";
}
