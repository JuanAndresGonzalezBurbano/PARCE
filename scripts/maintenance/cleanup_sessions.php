<?php

/**
 * P.A.R.C.E Session Cleanup
 *
 * Deletes expired sessions (SessionManager::cleanup()) — a real method that
 * existed but nothing ever called it: no cron entry, no route, no other
 * script. Without this, the `sessions` table accumulates one row per login
 * forever (validate() only skips expired rows on read, it never deletes
 * them), unbounded growth over the life of a production deployment.
 *
 * Usage:
 *   php scripts/maintenance/cleanup_sessions.php
 *
 * Cron example (once per hour):
 *   0 * * * * php /path/to/parce/scripts/maintenance/cleanup_sessions.php >> /path/to/parce/storage/logs/cleanup_sessions.log 2>&1
 */

define('BASE_PATH', dirname(__DIR__, 2));

require_once BASE_PATH . '/vendor/autoload.php';

use App\Core\Database;
use App\Core\EnvLoader;
use App\Infrastructure\Auth\Services\SessionManager;

EnvLoader::load(BASE_PATH . '/.env');

function env(string $key, mixed $default = null): mixed
{
    return $_ENV[$key] ?? getenv($key) ?: $default;
}

Database::setConfig([
    'driver'   => env('DB_CONNECTION', 'mysql'),
    'host'     => env('DB_HOST', '127.0.0.1'),
    'port'     => (int) env('DB_PORT', '3306'),
    'database' => env('DB_DATABASE', 'parce'),
    'username' => env('DB_USERNAME', 'root'),
    'password' => env('DB_PASSWORD', ''),
    'charset'  => 'utf8mb4',
]);

$deletedCount = (new SessionManager())->cleanup();

echo date('Y-m-d H:i:s') . " — Deleted {$deletedCount} expired session(s).\n";
