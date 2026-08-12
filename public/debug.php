<?php
// Debug file to diagnose routing issues
header('Content-Type: application/json');

$debug = [
    'REQUEST_URI' => $_SERVER['REQUEST_URI'] ?? 'NOT SET',
    'SCRIPT_NAME' => $_SERVER['SCRIPT_NAME'] ?? 'NOT SET',
    'PHP_SELF' => $_SERVER['PHP_SELF'] ?? 'NOT SET',
    'REQUEST_METHOD' => $_SERVER['REQUEST_METHOD'] ?? 'NOT SET',
    'SERVER_NAME' => $_SERVER['SERVER_NAME'] ?? 'NOT SET',
    'SERVER_PORT' => $_SERVER['SERVER_PORT'] ?? 'NOT SET',
    'DOCUMENT_ROOT' => $_SERVER['DOCUMENT_ROOT'] ?? 'NOT SET',
];

echo json_encode($debug, JSON_PRETTY_PRINT);
