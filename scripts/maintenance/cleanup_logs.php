<?php

/**
 * P.A.R.C.E Log Cleanup
 *
 * Deletes files in storage/logs/ older than a retention window. The app logs
 * one file per day (error-YYYY-MM-DD.log, database-YYYY-MM-DD.log) with no
 * built-in rotation, so this script exists to keep storage/logs/ from
 * growing unbounded in production. Intended to run daily via cron/scheduled
 * task, not on every request.
 *
 * Usage:
 *   php scripts/maintenance/cleanup_logs.php [retention_days]
 *   (default retention: 30 days)
 *
 * Cron example (daily at 3am):
 *   0 3 * * * php /path/to/parce/scripts/maintenance/cleanup_logs.php >> /path/to/parce/storage/logs/cleanup.log 2>&1
 */

define('BASE_PATH', dirname(__DIR__, 2));

$retentionDays = isset($argv[1]) ? (int) $argv[1] : 30;

if ($retentionDays < 1) {
    fwrite(STDERR, "retention_days must be a positive integer\n");
    exit(1);
}

$logDir = BASE_PATH . '/storage/logs';

if (!is_dir($logDir)) {
    echo "No log directory at {$logDir}, nothing to clean up.\n";
    exit(0);
}

$cutoff = time() - ($retentionDays * 86400);
$deleted = 0;
$kept = 0;

foreach (scandir($logDir) as $entry) {
    if ($entry === '.' || $entry === '..' || $entry === '.gitkeep') {
        continue;
    }

    $path = $logDir . '/' . $entry;

    if (!is_file($path)) {
        continue;
    }

    if (filemtime($path) < $cutoff) {
        unlink($path);
        $deleted++;
        echo "Deleted: {$entry}\n";
    } else {
        $kept++;
    }
}

echo "\nDone. Deleted {$deleted} file(s) older than {$retentionDays} days, kept {$kept}.\n";
