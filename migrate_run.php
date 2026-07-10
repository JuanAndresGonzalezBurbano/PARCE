<?php
/**
 * Temporary migration runner wrapper from project root.
 * Runs migrations directly using the project's MigrationRunner.
 * Delete after use.
 */

define('BASE_PATH', __DIR__);

require_once BASE_PATH . '/vendor/autoload.php';

use App\Core\Database;
use App\Core\MigrationRunner;
use App\Core\ConfigValidator;

// Load .env
$envFile = BASE_PATH . '/.env';
$lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
foreach ($lines as $line) {
    if (strpos(trim($line), '#') === 0) continue;
    if (strpos($line, '=') !== false) {
        [$key, $value] = explode('=', $line, 2);
        $key = trim($key);
        $value = trim(trim($value), '"\'');
        $_ENV[$key] = $value;
        putenv("{$key}={$value}");
    }
}

// Configure DB
Database::setConfig([
    'driver'   => $_ENV['DB_CONNECTION'] ?? 'mysql',
    'host'     => $_ENV['DB_HOST']       ?? '127.0.0.1',
    'port'     => (int)($_ENV['DB_PORT'] ?? 3306),
    'database' => $_ENV['DB_DATABASE']   ?? 'parce',
    'username' => $_ENV['DB_USERNAME']   ?? 'root',
    'password' => $_ENV['DB_PASSWORD']   ?? '',
    'charset'  => 'utf8mb4',
]);

$command = $argv[1] ?? 'status';
$runner  = new MigrationRunner(BASE_PATH . '/database/migrations');

switch ($command) {
    case 'migrate':
        echo "Running pending migrations...\n\n";
        $output = $runner->migrate();
        foreach ($output as $line) { echo $line . "\n"; }
        break;

    case 'status':
        echo "Migration status:\n\n";
        $status = $runner->status();
        foreach ($status as $item) {
            $ran   = $item['ran'] ? '[RAN]    ' : '[PENDING]';
            $batch = $item['batch'] ?? '-';
            echo sprintf("%-10s batch=%-3s  %s\n", $ran, $batch, $item['migration']);
        }
        break;

    default:
        echo "Usage: php migrate_run.php [migrate|status]\n";
}
