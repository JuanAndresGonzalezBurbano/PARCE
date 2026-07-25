<?php

/**
 * P.A.R.C.E Pending Request Expiration
 *
 * Marks 'pending' service requests as 'expired' once they've sat unassigned
 * longer than the configured window. service_requests.expired_at exists in
 * the schema but nothing ever set it — no request has ever automatically
 * expired regardless of how long it went unanswered. Intended to run every
 * few minutes via cron, not on every request.
 *
 * The UPDATE is scoped to `WHERE status = 'pending'`, same atomic-conditional
 * pattern already used in ServiceRequestService::accept()/cancel()/start()/
 * complete(): if a mechanic accepts a request in the same instant this script
 * runs, MySQL serializes the two writes at the row level — whichever commits
 * first wins, the other affects zero rows. No race condition, no double state.
 *
 * Usage:
 *   php scripts/maintenance/expire_pending_requests.php [minutes]
 *   (default: 30 minutes)
 *
 * Cron example (every 5 minutes):
 *   0,5,10,15,20,25,30,35,40,45,50,55 * * * * php /path/to/parce/scripts/maintenance/expire_pending_requests.php >> /path/to/parce/storage/logs/expire_requests.log 2>&1
 */

define('BASE_PATH', dirname(__DIR__, 2));

require_once BASE_PATH . '/vendor/autoload.php';

use App\Core\Database;
use App\Core\EnvLoader;

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

$minutes = isset($argv[1]) ? (int) $argv[1] : 30;

if ($minutes < 1) {
    fwrite(STDERR, "minutes must be a positive integer\n");
    exit(1);
}

$expiredCount = Database::update(
    'service_requests',
    [
        'status'     => 'expired',
        'expired_at' => date('Y-m-d H:i:s'),
    ],
    'status = ? AND requested_at < (NOW() - INTERVAL ? MINUTE)',
    ['pending', $minutes]
);

echo date('Y-m-d H:i:s') . " — Expired {$expiredCount} pending request(s) older than {$minutes} minutes.\n";
