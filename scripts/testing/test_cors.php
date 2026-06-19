<?php

/**
 * CORS Middleware Test Script
 * 
 * Tests CORS functionality for session-based authentication
 */

define('COLOR_GREEN', "\033[32m");
define('COLOR_RED', "\033[31m");
define('COLOR_BLUE', "\033[34m");
define('COLOR_RESET', "\033[0m");

function printLine(string $message, string $color = COLOR_RESET): void
{
    echo $color . $message . COLOR_RESET . "\n";
}

function printHeader(string $title): void
{
    echo "\n";
    printLine(str_repeat('=', 70), COLOR_BLUE);
    printLine($title, COLOR_BLUE);
    printLine(str_repeat('=', 70), COLOR_BLUE);
    echo "\n";
}

function makeRequest(string $method, string $url, string $origin = null): array
{
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HEADER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    
    $headers = ['Accept: application/json'];
    if ($origin) {
        $headers[] = "Origin: {$origin}";
    }
    
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    
    $response = curl_exec($ch);
    $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
    $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    
    curl_close($ch);
    
    $headerText = substr($response, 0, $headerSize);
    $body = substr($response, $headerSize);
    
    // Parse headers
    $headers = [];
    foreach (explode("\n", $headerText) as $line) {
        if (strpos($line, ':') !== false) {
            [$key, $value] = explode(':', $line, 2);
            $headers[trim($key)] = trim($value);
        }
    }
    
    return [
        'status' => $statusCode,
        'headers' => $headers,
        'body' => $body
    ];
}

function assertHeader(string $name, array $headers, string $expected = null): bool
{
    if (!isset($headers[$name])) {
        printLine("  ✗ Header '{$name}' not found", COLOR_RED);
        return false;
    }
    
    if ($expected !== null && $headers[$name] !== $expected) {
        printLine("  ✗ Header '{$name}' = '{$headers[$name]}' (expected '{$expected}')", COLOR_RED);
        return false;
    }
    
    printLine("  ✓ Header '{$name}' = '{$headers[$name]}'", COLOR_GREEN);
    return true;
}

printHeader('P.A.R.C.E CORS Middleware Tests');

$baseUrl = 'http://localhost:8000';
$testOrigin = 'http://localhost:3000';
$passed = 0;
$failed = 0;

// Test 1: OPTIONS Preflight Request
printHeader('Test 1: OPTIONS Preflight Request');
$response = makeRequest('OPTIONS', "{$baseUrl}/api/health", $testOrigin);

if ($response['status'] === 204) {
    printLine("✓ Preflight returns 204 No Content", COLOR_GREEN);
    $passed++;
} else {
    printLine("✗ Preflight returns {$response['status']} (expected 204)", COLOR_RED);
    $failed++;
}

if (assertHeader('Access-Control-Allow-Origin', $response['headers'], $testOrigin)) $passed++; else $failed++;
if (assertHeader('Access-Control-Allow-Methods', $response['headers'])) $passed++; else $failed++;
if (assertHeader('Access-Control-Allow-Headers', $response['headers'])) $passed++; else $failed++;
if (assertHeader('Access-Control-Allow-Credentials', $response['headers'], 'true')) $passed++; else $failed++;

// Test 2: Actual Request with Origin
printHeader('Test 2: GET Request with Origin');
$response = makeRequest('GET', "{$baseUrl}/api/health", $testOrigin);

if ($response['status'] === 200) {
    printLine("✓ Request returns 200 OK", COLOR_GREEN);
    $passed++;
} else {
    printLine("✗ Request returns {$response['status']} (expected 200)", COLOR_RED);
    $failed++;
}

if (assertHeader('Access-Control-Allow-Origin', $response['headers'], $testOrigin)) $passed++; else $failed++;
if (assertHeader('Access-Control-Allow-Credentials', $response['headers'], 'true')) $passed++; else $failed++;
if (assertHeader('Access-Control-Expose-Headers', $response['headers'])) $passed++; else $failed++;
if (assertHeader('Vary', $response['headers'], 'Origin')) $passed++; else $failed++;

// Test 3: Request without Origin (same-origin)
printHeader('Test 3: Request without Origin (Same-Origin)');
$response = makeRequest('GET', "{$baseUrl}/api/health");

if ($response['status'] === 200) {
    printLine("✓ Same-origin request works", COLOR_GREEN);
    $passed++;
} else {
    printLine("✗ Same-origin request failed", COLOR_RED);
    $failed++;
}

// Test 4: Blocked Origin
printHeader('Test 4: Request from Blocked Origin');
$blockedOrigin = 'http://evil.com';
$response = makeRequest('GET', "{$baseUrl}/api/health", $blockedOrigin);

if (!isset($response['headers']['Access-Control-Allow-Origin'])) {
    printLine("✓ Blocked origin has no CORS headers", COLOR_GREEN);
    $passed++;
} else {
    printLine("✗ Blocked origin received CORS headers", COLOR_RED);
    $failed++;
}

// Summary
printHeader('Test Summary');
$total = $passed + $failed;
printLine("Total Tests: {$total}", COLOR_BLUE);
printLine("Passed: {$passed}", COLOR_GREEN);
printLine("Failed: {$failed}", $failed > 0 ? COLOR_RED : COLOR_GREEN);

if ($failed === 0) {
    printLine("\n✓ All CORS tests passed!", COLOR_GREEN);
    exit(0);
} else {
    printLine("\n✗ Some CORS tests failed!", COLOR_RED);
    exit(1);
}
