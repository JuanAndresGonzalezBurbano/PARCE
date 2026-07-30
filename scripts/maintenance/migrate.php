<?php

/**
 * P.A.R.C.E Migration CLI
 * 
 * Command-line interface for database migrations.
 * 
 * Usage:
 *   php migrate.php migrate          - Run all pending migrations
 *   php migrate.php rollback [steps]  - Rollback last migration(s)
 *   php migrate.php status            - Show migration status
 *   php migrate.php reset             - Rollback all and re-run
 */

// Define base path (this script lives two levels below the project root, in
// scripts/maintenance/)
define('BASE_PATH', dirname(__DIR__, 2));

// Load Composer autoloader
require_once BASE_PATH . '/vendor/autoload.php';

use App\Core\Database;
use App\Core\EnvLoader;
use App\Core\MigrationRunner;
use App\Core\ConfigValidator;

// ANSI color codes for terminal output
define('COLOR_GREEN', "\033[32m");
define('COLOR_RED', "\033[31m");
define('COLOR_YELLOW', "\033[33m");
define('COLOR_BLUE', "\033[34m");
define('COLOR_RESET', "\033[0m");

/**
 * Load environment configuration
 */
function loadEnvironment(): void
{
    $envFile = BASE_PATH . '/.env';

    if (!EnvLoader::load($envFile)) {
        echo COLOR_RED . "ERROR: .env file not found.\n" . COLOR_RESET;
        echo "Please copy .env.example to .env and configure your database settings.\n";
        exit(1);
    }
}

/**
 * Get environment variable
 */
function env(string $key, mixed $default = null): mixed
{
    return $_ENV[$key] ?? getenv($key) ?: $default;
}

/**
 * Load full application configuration
 */
function loadConfiguration(): array
{
    return [
        'app' => [
            'name' => env('APP_NAME', 'P.A.R.C.E'),
            'env' => env('APP_ENV', 'local'),
            'debug' => env('APP_DEBUG', 'true') === 'true',
            'url' => env('APP_URL', 'http://localhost'),
        ],
        'database' => [
            'driver' => env('DB_CONNECTION', 'mysql'),
            'host' => env('DB_HOST', '127.0.0.1'),
            'port' => (int) env('DB_PORT', '3306'),
            'database' => env('DB_DATABASE', 'parce'),
            'username' => env('DB_USERNAME', 'root'),
            'password' => env('DB_PASSWORD', ''),
            'charset' => 'utf8mb4',
        ],
        'session' => [
            'lifetime' => (int) env('SESSION_LIFETIME', '120'),
            'driver' => env('SESSION_DRIVER', 'file'),
        ],
    ];
}

/**
 * Configure database connection
 */
function configureDatabase(): void
{
    // Load full configuration
    $config = loadConfiguration();

    // Validate configuration
    $validator = new ConfigValidator();
    
    if (!$validator->validate($config)) {
        echo COLOR_RED . "Configuration validation failed:\n" . COLOR_RESET;
        foreach ($validator->getErrors() as $error) {
            echo COLOR_RED . "  - {$error}\n" . COLOR_RESET;
        }
        exit(1);
    }

    // Log warnings if any
    $warnings = $validator->getWarnings();
    if (!empty($warnings)) {
        foreach ($warnings as $warning) {
            printLine("WARNING: {$warning}", COLOR_YELLOW);
        }
        echo "\n";
    }

    // Set database configuration
    Database::setConfig($config['database']);
}

/**
 * Print colored output
 */
function printLine(string $message, string $color = COLOR_RESET): void
{
    echo $color . $message . COLOR_RESET . "\n";
}

/**
 * Print header
 */
function printHeader(string $title): void
{
    echo "\n";
    printLine(str_repeat('=', 60), COLOR_BLUE);
    printLine($title, COLOR_BLUE);
    printLine(str_repeat('=', 60), COLOR_BLUE);
    echo "\n";
}

/**
 * Run migrate command
 */
function runMigrate(): void
{
    printHeader('Running Migrations');
    
    try {
        $runner = new MigrationRunner();
        $output = $runner->migrate();
        
        foreach ($output as $line) {
            if (str_contains($line, 'Migrated:')) {
                printLine($line, COLOR_GREEN);
            } elseif (str_contains($line, 'Failed:')) {
                printLine($line, COLOR_RED);
            } else {
                printLine($line);
            }
        }
        
        printLine("\n✓ Migration completed successfully!", COLOR_GREEN);
        
    } catch (\Exception $e) {
        printLine("\n✗ Migration failed!", COLOR_RED);
        printLine("Error: " . $e->getMessage(), COLOR_RED);
        exit(1);
    }
}

/**
 * Run rollback command
 */
function runRollback(int $steps = 1): void
{
    printHeader("Rolling Back Migrations (Steps: {$steps})");
    
    try {
        $runner = new MigrationRunner();
        $output = $runner->rollback($steps);
        
        foreach ($output as $line) {
            if (str_contains($line, 'Rolled back:')) {
                printLine($line, COLOR_GREEN);
            } elseif (str_contains($line, 'failed:')) {
                printLine($line, COLOR_RED);
            } else {
                printLine($line);
            }
        }
        
        printLine("\n✓ Rollback completed successfully!", COLOR_GREEN);
        
    } catch (\Exception $e) {
        printLine("\n✗ Rollback failed!", COLOR_RED);
        printLine("Error: " . $e->getMessage(), COLOR_RED);
        exit(1);
    }
}

/**
 * Run status command
 */
function runStatus(): void
{
    printHeader('Migration Status');
    
    try {
        $runner = new MigrationRunner();
        $status = $runner->status();
        
        if (empty($status)) {
            printLine("No migrations found.", COLOR_YELLOW);
            return;
        }
        
        $maxLength = max(array_map(fn($s) => strlen($s['migration']), $status));
        
        printLine(sprintf("%-{$maxLength}s  %-10s  %s", "Migration", "Status", "Batch"), COLOR_BLUE);
        printLine(str_repeat('-', $maxLength + 25), COLOR_BLUE);
        
        foreach ($status as $item) {
            $statusText = $item['ran'] ? 'Ran' : 'Pending';
            $color = $item['ran'] ? COLOR_GREEN : COLOR_YELLOW;
            $batch = $item['batch'] ?? '-';
            
            printf("%-{$maxLength}s  ", $item['migration']);
            printLine(sprintf("%-10s  %s", $statusText, $batch), $color);
        }
        
        echo "\n";
        
    } catch (\Exception $e) {
        printLine("\n✗ Failed to get status!", COLOR_RED);
        printLine("Error: " . $e->getMessage(), COLOR_RED);
        exit(1);
    }
}

/**
 * Run reset command
 */
function runReset(): void
{
    printHeader('Resetting Database');
    
    printLine("WARNING: This will rollback all migrations and re-run them.", COLOR_YELLOW);
    printLine("All data will be lost!", COLOR_RED);
    echo "\nAre you sure? (yes/no): ";
    
    $handle = fopen("php://stdin", "r");
    $line = trim(fgets($handle));
    fclose($handle);
    
    if ($line !== 'yes') {
        printLine("\nReset cancelled.", COLOR_YELLOW);
        return;
    }
    
    try {
        $runner = new MigrationRunner();
        $output = $runner->reset();
        
        foreach ($output as $line) {
            if (str_contains($line, 'Rolled back:') || str_contains($line, 'Migrated:')) {
                printLine($line, COLOR_GREEN);
            } elseif (str_contains($line, 'failed:') || str_contains($line, 'Failed:')) {
                printLine($line, COLOR_RED);
            } else {
                printLine($line);
            }
        }
        
        printLine("\n✓ Reset completed successfully!", COLOR_GREEN);
        
    } catch (\Exception $e) {
        printLine("\n✗ Reset failed!", COLOR_RED);
        printLine("Error: " . $e->getMessage(), COLOR_RED);
        exit(1);
    }
}

/**
 * Show help
 */
function showHelp(): void
{
    printHeader('P.A.R.C.E Migration CLI');
    
    echo "Usage:\n";
    echo "  php migrate.php <command> [options]\n\n";
    
    echo "Available commands:\n";
    echo "  migrate              Run all pending migrations\n";
    echo "  rollback [steps]     Rollback last migration(s) (default: 1)\n";
    echo "  status               Show migration status\n";
    echo "  reset                Rollback all and re-run migrations\n";
    echo "  help                 Show this help message\n\n";
    
    echo "Examples:\n";
    echo "  php migrate.php migrate\n";
    echo "  php migrate.php rollback\n";
    echo "  php migrate.php rollback 2\n";
    echo "  php migrate.php status\n";
    echo "  php migrate.php reset\n\n";
}

// Main execution
try {
    // Load environment
    loadEnvironment();
    
    // Configure database
    configureDatabase();
    
    // Get command
    $command = $argv[1] ?? 'help';
    
    // Execute command
    switch ($command) {
        case 'migrate':
            runMigrate();
            break;
            
        case 'rollback':
            $steps = isset($argv[2]) ? (int) $argv[2] : 1;
            runRollback($steps);
            break;
            
        case 'status':
            runStatus();
            break;
            
        case 'reset':
            runReset();
            break;
            
        case 'help':
        default:
            showHelp();
            break;
    }
    
} catch (\Exception $e) {
    printLine("\n✗ Fatal error!", COLOR_RED);
    printLine("Error: " . $e->getMessage(), COLOR_RED);
    
    if (env('APP_DEBUG', 'false') === 'true') {
        printLine("\nStack trace:", COLOR_YELLOW);
        printLine($e->getTraceAsString(), COLOR_YELLOW);
    }
    
    exit(1);
}
