<?php
/**
 * Migration runner wrapper from project root.
 *
 * Runs migrations directly using the project's MigrationRunner.
 * Usage: php migrate_run.php migrate|status
 */

define('BASE_PATH', __DIR__);

require_once BASE_PATH . '/vendor/autoload.php';

use App\Core\Database;
use App\Core\EnvLoader;
use App\Core\MigrationRunner;
use App\Core\ConfigValidator;

// Load .env
EnvLoader::load(BASE_PATH . '/.env');

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
