<?php

/**
 * Check Role Assignments for Users 1-4
 */

// Este script vive dos niveles bajo la raíz del proyecto (scripts/debugging/)
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

echo "=== USER_ROLES FOR USERS 1-4 ===\n\n";

for ($userId = 1; $userId <= 4; $userId++) {
    echo "User ID {$userId}:\n";
    
    $roles = Database::fetchAll(
        'SELECT ur.id, ur.user_id, ur.role_id, r.name, r.slug, ur.is_active, ur.assigned_at
         FROM user_roles ur
         INNER JOIN roles r ON ur.role_id = r.id
         WHERE ur.user_id = ?',
        [$userId]
    );
    
    if (empty($roles)) {
        echo "  NO ROLES\n";
    } else {
        foreach ($roles as $role) {
            echo "  - Role: {$role['name']} (slug: {$role['slug']}), Active: {$role['is_active']}, Assigned: {$role['assigned_at']}\n";
        }
    }
    echo "\n";
}
