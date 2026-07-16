<?php

/**
 * Database Structure Validation Script
 * 
 * Validates the complete database schema including:
 * - All tables
 * - Columns with types, nullability, defaults
 * - Foreign keys
 * - Indexes
 * - Unique constraints
 */

// Este script vive dos niveles bajo la raíz del proyecto (scripts/validation/)
define('BASE_PATH', dirname(__DIR__, 2));

require_once BASE_PATH . '/vendor/autoload.php';
require_once BASE_PATH . '/app/Core/Database.php';

use App\Core\Database;

// Load .env file
$env = [];
if (file_exists(BASE_PATH . '/.env')) {
    $lines = file(BASE_PATH . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        list($key, $value) = explode('=', $line, 2);
        $env[trim($key)] = trim($value);
        $_ENV[trim($key)] = trim($value);
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

// Initialize database connection by calling a query
try {
    Database::fetchOne("SELECT 1");
    echo "✓ Database connection established\n\n";
} catch (\Exception $e) {
    echo "✗ Database connection failed: " . $e->getMessage() . "\n";
    echo "\nPlease ensure:\n";
    echo "1. XAMPP MySQL service is running\n";
    echo "2. Database 'parce' exists\n";
    echo "3. Database credentials in .env are correct\n\n";
    exit(1);
}

echo "============================================================\n";
echo "DATABASE STRUCTURE VALIDATION\n";
echo "============================================================\n\n";

// Expected tables
$expectedTables = [
    'users',
    'roles',
    'user_roles',
    'sessions',
    'admin_access_requests',
    'vehicles',
    'service_requests',
    'migrations'
];

// Get all tables
$tables = Database::fetchAll("SHOW TABLES");
$tableNames = array_column($tables, 'Tables_in_' . $_ENV['DB_DATABASE']);

echo "TABLES FOUND (" . count($tableNames) . "):\n";
echo "----------------------------------------\n";

foreach ($expectedTables as $expectedTable) {
    if (in_array($expectedTable, $tableNames)) {
        echo "✓ {$expectedTable}\n";
    } else {
        echo "✗ {$expectedTable} (MISSING)\n";
    }
}

echo "\n";

// Detailed validation for each existing table
foreach ($tableNames as $tableName) {
    if ($tableName === 'migrations') {
        continue; // Skip migrations table
    }
    
    echo "\n============================================================\n";
    echo "TABLE: {$tableName}\n";
    echo "============================================================\n";
    
    // Get columns
    echo "\nCOLUMNS:\n";
    echo "--------\n";
    $columns = Database::fetchAll("DESCRIBE {$tableName}");
    
    printf("%-30s %-20s %-8s %-10s %-10s\n", 
        "Field", "Type", "Null", "Key", "Default");
    printf("%-30s %-20s %-8s %-10s %-10s\n", 
        str_repeat("-", 30), str_repeat("-", 20), str_repeat("-", 8), 
        str_repeat("-", 10), str_repeat("-", 10));
    
    foreach ($columns as $column) {
        printf("%-30s %-20s %-8s %-10s %-10s\n",
            $column['Field'],
            $column['Type'],
            $column['Null'],
            $column['Key'],
            $column['Default'] ?? 'NULL'
        );
    }
    
    // Get foreign keys
    echo "\nFOREIGN KEYS:\n";
    echo "-------------\n";
    $foreignKeys = Database::fetchAll("
        SELECT 
            CONSTRAINT_NAME,
            COLUMN_NAME,
            REFERENCED_TABLE_NAME,
            REFERENCED_COLUMN_NAME
        FROM information_schema.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
        AND REFERENCED_TABLE_NAME IS NOT NULL
    ", [$tableName]);
    
    if (empty($foreignKeys)) {
        echo "  (none)\n";
    } else {
        foreach ($foreignKeys as $fk) {
            echo "  {$fk['CONSTRAINT_NAME']}:\n";
            echo "    {$fk['COLUMN_NAME']} -> {$fk['REFERENCED_TABLE_NAME']}.{$fk['REFERENCED_COLUMN_NAME']}\n";
        }
    }
    
    // Get indexes
    echo "\nINDEXES:\n";
    echo "--------\n";
    $indexes = Database::fetchAll("SHOW INDEX FROM {$tableName}");
    
    $indexGroups = [];
    foreach ($indexes as $index) {
        $indexName = $index['Key_name'];
        if (!isset($indexGroups[$indexName])) {
            $indexGroups[$indexName] = [
                'unique' => $index['Non_unique'] == 0,
                'type' => $index['Index_type'],
                'columns' => []
            ];
        }
        $indexGroups[$indexName]['columns'][] = $index['Column_name'];
    }
    
    foreach ($indexGroups as $indexName => $indexInfo) {
        $uniqueTag = $indexInfo['unique'] ? '[UNIQUE]' : '';
        $columns = implode(', ', $indexInfo['columns']);
        echo "  {$indexName} {$uniqueTag}: ({$columns}) [{$indexInfo['type']}]\n";
    }
    
    // Get row count
    echo "\nSTATISTICS:\n";
    echo "-----------\n";
    $count = Database::fetchOne("SELECT COUNT(*) as count FROM {$tableName}");
    echo "  Rows: {$count['count']}\n";
    
    if (in_array('deleted_at', array_column($columns, 'Field'))) {
        $activeCount = Database::fetchOne("SELECT COUNT(*) as count FROM {$tableName} WHERE deleted_at IS NULL");
        $deletedCount = $count['count'] - $activeCount['count'];
        echo "  Active: {$activeCount['count']}\n";
        echo "  Soft-deleted: {$deletedCount}\n";
    }
}

echo "\n\n============================================================\n";
echo "VALIDATION COMPLETE\n";
echo "============================================================\n";
