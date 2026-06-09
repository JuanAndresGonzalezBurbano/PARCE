<?php

/**
 * Service Requests Seeder Only
 * 
 * Seeds ONLY service requests (assumes users and vehicles already exist)
 */

require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/app/Core/Database.php';
require_once __DIR__ . '/app/Core/Seeder.php';
require_once __DIR__ . '/database/seeders/ServiceRequestsSeeder.php';

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

echo "✓ Database connection established\n\n";
echo "Seeding Service Requests...\n";
echo "============================================================\n\n";

try {
    $seeder = new ServiceRequestsSeeder();
    $seeder->run();
    
    echo "\n✓ Service Requests seeded successfully!\n\n";
    
    // Show counts
    $count = Database::fetchOne('SELECT COUNT(*) as c FROM service_requests')['c'];
    echo "Total service requests: {$count}\n";
    
    // Show by status
    $statuses = Database::fetchAll('SELECT status, COUNT(*) as c FROM service_requests GROUP BY status');
    echo "\nBy status:\n";
    foreach ($statuses as $status) {
        echo "  - {$status['status']}: {$status['c']}\n";
    }
    
    exit(0);
    
} catch (\Exception $e) {
    echo "\n✗ Seeding failed: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
    exit(1);
}
