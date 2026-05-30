<?php

/**
 * Database Seeder CLI Entry Point
 * 
 * Usage:
 *   php database/seed.php
 * 
 * This script runs all database seeders to populate the database
 * with initial data for development and testing.
 */

require_once __DIR__ . '/../vendor/autoload.php';

use App\Core\Database;
use App\Core\ConfigValidator;

// Load environment configuration
$envFile = __DIR__ . '/../.env';
if (!file_exists($envFile)) {
    echo "Error: .env file not found. Copy .env.example to .env and configure it.\n";
    exit(1);
}

$env = parse_ini_file($envFile);
if ($env === false) {
    echo "Error: Failed to parse .env file.\n";
    exit(1);
}

// Validate configuration
$validator = new ConfigValidator();
$config = [
    'app' => [
        'name' => $env['APP_NAME'] ?? 'P.A.R.C.E',
        'env' => $env['APP_ENV'] ?? 'local',
        'debug' => ($env['APP_DEBUG'] ?? 'true') === 'true',
        'url' => $env['APP_URL'] ?? 'http://localhost',
    ],
    'database' => [
        'driver' => $env['DB_CONNECTION'] ?? 'mysql',
        'host' => $env['DB_HOST'] ?? '127.0.0.1',
        'port' => (int) ($env['DB_PORT'] ?? '3306'),
        'database' => $env['DB_DATABASE'] ?? 'parce',
        'username' => $env['DB_USERNAME'] ?? 'root',
        'password' => $env['DB_PASSWORD'] ?? '',
        'charset' => 'utf8mb4',
    ],
    'session' => [
        'lifetime' => (int) ($env['SESSION_LIFETIME'] ?? '120'),
        'driver' => $env['SESSION_DRIVER'] ?? 'file',
    ],
];

if (!$validator->validate($config)) {
    echo "Configuration validation failed:\n";
    foreach ($validator->getErrors() as $error) {
        echo "  - {$error}\n";
    }
    exit(1);
}

// Configure database
Database::setConfig([
    'driver' => $env['DB_CONNECTION'] ?? 'mysql',
    'host' => $env['DB_HOST'] ?? '127.0.0.1',
    'port' => (int) ($env['DB_PORT'] ?? '3306'),
    'database' => $env['DB_DATABASE'] ?? '',
    'username' => $env['DB_USERNAME'] ?? 'root',
    'password' => $env['DB_PASSWORD'] ?? '',
    'charset' => $env['DB_CHARSET'] ?? 'utf8mb4',
]);

// Test database connection
try {
    $connection = Database::getConnection();
    echo "✓ Database connection established\n\n";
} catch (Exception $e) {
    echo "✗ Database connection failed: " . $e->getMessage() . "\n";
    exit(1);
}

// Load seeder classes
$seederFiles = glob(__DIR__ . '/seeders/*.php');
foreach ($seederFiles as $file) {
    require_once $file;
}

// Run seeders
try {
    $seeder = new DatabaseSeeder();
    $seeder->run();
    
    echo "\n✓ All seeders completed successfully\n";
    exit(0);
    
} catch (Exception $e) {
    echo "\n✗ Seeding failed: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
    exit(1);
}
