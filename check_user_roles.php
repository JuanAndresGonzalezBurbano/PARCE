<?php

/**
 * Check User Roles
 * 
 * Shows roles for users 1-4 (vehicle owners)
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

echo "=== VEHICLE OWNERS AND THEIR ROLES ===\n\n";

$vehicleOwners = Database::fetchAll(
    'SELECT DISTINCT v.user_id, u.email, u.first_name, u.last_name
     FROM vehicles v
     INNER JOIN users u ON v.user_id = u.id
     WHERE v.deleted_at IS NULL AND u.deleted_at IS NULL
     ORDER BY v.user_id'
);

foreach ($vehicleOwners as $owner) {
    echo "User ID {$owner['user_id']}: {$owner['email']} ({$owner['first_name']} {$owner['last_name']})\n";
    
    $roles = Database::fetchAll(
        'SELECT r.id, r.name, r.slug, ur.is_active
         FROM user_roles ur
         INNER JOIN roles r ON ur.role_id = r.id
         WHERE ur.user_id = ?',
        [$owner['user_id']]
    );
    
    if (empty($roles)) {
        echo "  ✗ NO ROLES ASSIGNED\n";
    } else {
        foreach ($roles as $role) {
            $active = $role['is_active'] ? '✓' : '✗';
            echo "  {$active} Role: {$role['name']} (slug: {$role['slug']}, active: {$role['is_active']})\n";
        }
    }
    
    echo "\n";
}

echo "=== AVAILABLE ROLES ===\n";
$allRoles = Database::fetchAll('SELECT id, name, slug FROM roles ORDER BY id');
foreach ($allRoles as $role) {
    echo "  Role ID {$role['id']}: {$role['name']} (slug: {$role['slug']})\n";
}
