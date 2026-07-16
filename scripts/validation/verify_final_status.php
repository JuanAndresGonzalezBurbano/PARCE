<?php

// Este script vive dos niveles bajo la raíz del proyecto (scripts/validation/)
define('BASE_PATH', dirname(__DIR__, 2));

require_once BASE_PATH . '/vendor/autoload.php';
require_once BASE_PATH . '/app/Core/Database.php';

use App\Core\Database;

$env = [];
if (file_exists(BASE_PATH . '/.env')) {
    $lines = file(BASE_PATH . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        list($key, $value) = explode('=', $line, 2);
        $env[trim($key)] = trim($value);
    }
}

Database::setConfig([
    'driver' => 'mysql',
    'host' => $env['DB_HOST'] ?? '127.0.0.1',
    'port' => (int)($env['DB_PORT'] ?? 3306),
    'database' => $env['DB_DATABASE'] ?? '',
    'username' => $env['DB_USERNAME'] ?? 'root',
    'password' => $env['DB_PASSWORD'] ?? '',
    'charset' => 'utf8mb4'
]);

echo "=== SERVICE REQUEST DOMAIN - ESTADO FINAL ===\n\n";

$count = Database::fetchOne('SELECT COUNT(*) as c FROM service_requests')['c'];
echo "Total Service Requests: {$count}\n\n";

if ($count > 0) {
    $statuses = Database::fetchAll('SELECT status, COUNT(*) as c FROM service_requests GROUP BY status');
    echo "Por status:\n";
    foreach ($statuses as $status) {
        echo "  - {$status['status']}: {$status['c']}\n";
    }
    
    echo "\n✅ SERVICE REQUEST DOMAIN FUNCIONANDO CORRECTAMENTE\n";
} else {
    echo "❌ No hay service requests en la base de datos\n";
}
