<?php

/**
 * Service Requests Endpoint Validation Script
 * 
 * Validates all Service Request endpoints for both Customer and Mechanic roles.
 * Tests authentication, authorization, and RBAC enforcement.
 */

define('API_BASE', 'http://localhost:8000/api');
define('CUSTOMER_EMAIL', 'customer@parce.local');
define('CUSTOMER_PASSWORD', 'Customer123!');
define('MECHANIC_EMAIL', 'mechanic@parce.local');
define('MECHANIC_PASSWORD', 'Mechanic123!');

$results = [];
$passed = 0;
$failed = 0;

/**
 * Make HTTP request
 */
function makeRequest(string $method, string $url, ?array $data = null, ?string $cookie = null): array
{
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($ch, CURLOPT_HEADER, true);
    
    if ($data !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    }
    
    if ($cookie !== null) {
        curl_setopt($ch, CURLOPT_COOKIE, $cookie);
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
    $headers = substr($response, 0, $headerSize);
    $body = substr($response, $headerSize);
    
    curl_close($ch);
    
    // Extract session cookie
    $sessionCookie = null;
    if (preg_match('/Set-Cookie: (parce_session=[^;]+)/', $headers, $matches)) {
        $sessionCookie = $matches[1];
    }
    
    return [
        'code' => $httpCode,
        'body' => json_decode($body, true),
        'cookie' => $sessionCookie
    ];
}

/**
 * Test endpoint
 */
function test(string $name, bool $condition, string $details = ''): void
{
    global $results, $passed, $failed;
    
    if ($condition) {
        $passed++;
        $status = '✓';
        $color = "\033[32m"; // Green
    } else {
        $failed++;
        $status = '✗';
        $color = "\033[31m"; // Red
    }
    
    $reset = "\033[0m";
    $message = "{$color}{$status} {$name}{$reset}";
    if ($details) {
        $message .= " - {$details}";
    }
    
    echo $message . PHP_EOL;
    $results[] = ['name' => $name, 'passed' => $condition, 'details' => $details];
}

echo "\n";
echo "================================================================================\n";
echo "  SERVICE REQUESTS ENDPOINT VALIDATION\n";
echo "================================================================================\n\n";

// ============================================================================
// Test 1: Customer Login
// ============================================================================

echo "1. CUSTOMER AUTHENTICATION\n";
echo "----------------------------\n";

$response = makeRequest('POST', API_BASE . '/auth/login', [
    'email' => CUSTOMER_EMAIL,
    'password' => CUSTOMER_PASSWORD,
    'remember' => false
]);

test('Customer login', $response['code'] === 200 && $response['body']['success'] === true);
$customerCookie = $response['cookie'];
test('Customer session cookie set', $customerCookie !== null);

echo "\n";

// ============================================================================
// Test 2: Mechanic Login
// ============================================================================

echo "2. MECHANIC AUTHENTICATION\n";
echo "----------------------------\n";

$response = makeRequest('POST', API_BASE . '/auth/login', [
    'email' => MECHANIC_EMAIL,
    'password' => MECHANIC_PASSWORD,
    'remember' => false
]);

test('Mechanic login', $response['code'] === 200 && $response['body']['success'] === true);
$mechanicCookie = $response['cookie'];
test('Mechanic session cookie set', $mechanicCookie !== null);

echo "\n";

// ============================================================================
// Test 3: Customer Endpoints
// ============================================================================

echo "3. CUSTOMER ENDPOINTS\n";
echo "----------------------------\n";

// GET /api/service-requests
$response = makeRequest('GET', API_BASE . '/service-requests', null, $customerCookie);
test('GET /service-requests (customer)', 
    $response['code'] === 200 && $response['body']['success'] === true,
    "HTTP {$response['code']}"
);

// Test without auth
$response = makeRequest('GET', API_BASE . '/service-requests');
test('GET /service-requests (no auth)', 
    $response['code'] === 401 || $response['body']['success'] === false,
    "Returns 401/error"
);

echo "\n";

// ============================================================================
// Test 4: Mechanic Endpoints
// ============================================================================

echo "4. MECHANIC ENDPOINTS\n";
echo "----------------------------\n";

// GET /api/mechanic/requests
$response = makeRequest('GET', API_BASE . '/mechanic/requests', null, $mechanicCookie);
test('GET /mechanic/requests (mechanic)', 
    $response['code'] === 200 && $response['body']['success'] === true,
    "HTTP {$response['code']}"
);

// GET /api/mechanic/requests/available
$response = makeRequest('GET', API_BASE . '/mechanic/requests/available?latitude=40.7128&longitude=-74.0060', null, $mechanicCookie);
test('GET /mechanic/requests/available (mechanic)', 
    $response['code'] === 200 && $response['body']['success'] === true,
    "HTTP {$response['code']}, found {$response['body']['data']['count']} requests"
);

echo "\n";

// ============================================================================
// Test 5: RBAC Enforcement
// ============================================================================

echo "5. RBAC ENFORCEMENT\n";
echo "----------------------------\n";

// Customer trying to access mechanic endpoint
$response = makeRequest('GET', API_BASE . '/mechanic/requests', null, $customerCookie);
test('Customer CANNOT access /mechanic/requests', 
    $response['body']['success'] === false,
    "Returns error: {$response['body']['error']}"
);

// Mechanic trying to access customer endpoint
$response = makeRequest('GET', API_BASE . '/service-requests', null, $mechanicCookie);
test('Mechanic CANNOT access /service-requests', 
    $response['body']['success'] === false,
    "Returns error: {$response['body']['error']}"
);

echo "\n";

// ============================================================================
// Test 6: Error Handling
// ============================================================================

echo "6. ERROR HANDLING\n";
echo "----------------------------\n";

// Missing required params for available requests
$response = makeRequest('GET', API_BASE . '/mechanic/requests/available', null, $mechanicCookie);
test('Available requests requires location params', 
    $response['body']['success'] === false,
    "Returns validation error"
);

echo "\n";

// ============================================================================
// Summary
// ============================================================================

echo "================================================================================\n";
echo "  SUMMARY\n";
echo "================================================================================\n";
echo "\n";
echo "  Total Tests: " . ($passed + $failed) . "\n";
echo "  \033[32mPassed: {$passed}\033[0m\n";
echo "  \033[31mFailed: {$failed}\033[0m\n";
echo "\n";

if ($failed === 0) {
    echo "  \033[32m✓ ALL TESTS PASSED\033[0m\n";
    exit(0);
} else {
    echo "  \033[31m✗ SOME TESTS FAILED\033[0m\n";
    exit(1);
}
