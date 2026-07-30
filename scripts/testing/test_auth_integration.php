<?php

/**
 * Authentication Integration Test Script
 * 
 * Tests the complete authentication lifecycle:
 * - Registration
 * - Login
 * - Protected routes
 * - Session persistence
 * - Cookie behavior
 * - Logout
 * - RBAC authorization
 * - Middleware pipeline
 */

// Configuration
define('BASE_URL', 'http://localhost:8000');
define('COLOR_GREEN', "\033[32m");
define('COLOR_RED', "\033[31m");
define('COLOR_YELLOW', "\033[33m");
define('COLOR_BLUE', "\033[34m");
define('COLOR_RESET', "\033[0m");

// Test results
$results = [
    'passed' => 0,
    'failed' => 0,
    'tests' => []
];

/**
 * Print colored output
 */
function printLine(string $message, string $color = COLOR_RESET): void
{
    echo $color . $message . COLOR_RESET . "\n";
}

/**
 * Print test header
 */
function printHeader(string $title): void
{
    echo "\n";
    printLine(str_repeat('=', 70), COLOR_BLUE);
    printLine($title, COLOR_BLUE);
    printLine(str_repeat('=', 70), COLOR_BLUE);
    echo "\n";
}

/**
 * Make HTTP request
 */
function makeRequest(string $method, string $endpoint, array $data = [], array $cookies = []): array
{
    $url = BASE_URL . $endpoint;
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HEADER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false);
    
    // Set method
    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    } elseif ($method !== 'GET') {
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
        if (!empty($data)) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }
    }
    
    // Set headers
    $headers = [
        'Content-Type: application/json',
        'Accept: application/json'
    ];
    
    // Add cookies
    if (!empty($cookies)) {
        $cookieString = [];
        foreach ($cookies as $name => $value) {
            $cookieString[] = "{$name}={$value}";
        }
        $headers[] = 'Cookie: ' . implode('; ', $cookieString);
    }
    
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    
    $response = curl_exec($ch);
    $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
    $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    
    curl_close($ch);
    
    // Parse headers and body
    $headerText = substr($response, 0, $headerSize);
    $body = substr($response, $headerSize);
    
    // Extract cookies from response
    $responseCookies = [];
    preg_match_all('/Set-Cookie: ([^=]+)=([^;]+)/i', $headerText, $matches, PREG_SET_ORDER);
    foreach ($matches as $match) {
        $responseCookies[$match[1]] = $match[2];
    }
    
    return [
        'status' => $statusCode,
        'headers' => $headerText,
        'body' => $body,
        'json' => json_decode($body, true),
        'cookies' => $responseCookies
    ];
}

/**
 * Assert test result
 */
function assertTest(string $name, bool $condition, string $message = ''): void
{
    global $results;
    
    if ($condition) {
        $results['passed']++;
        $results['tests'][] = ['name' => $name, 'status' => 'PASS'];
        printLine("  ✓ {$name}", COLOR_GREEN);
    } else {
        $results['failed']++;
        $results['tests'][] = ['name' => $name, 'status' => 'FAIL', 'message' => $message];
        printLine("  ✗ {$name}", COLOR_RED);
        if ($message) {
            printLine("    Reason: {$message}", COLOR_YELLOW);
        }
    }
}

/**
 * Test 1: Health Endpoint
 */
function testHealthEndpoint(): void
{
    printHeader('Test 1: Health Endpoint');
    
    $response = makeRequest('GET', '/api/health');
    
    assertTest(
        'Health endpoint returns 200',
        $response['status'] === 200,
        "Expected 200, got {$response['status']}"
    );
    
    assertTest(
        'Health endpoint returns JSON',
        isset($response['json']['data']['status']),
        'Response is not valid JSON'
    );
    
    assertTest(
        'Health status is healthy',
        $response['json']['data']['status'] === 'healthy',
        "Expected 'healthy', got '{$response['json']['data']['status']}'"
    );
}

/**
 * Test 2: User Registration
 */
function testRegistration(): array
{
    printHeader('Test 2: User Registration');
    
    $email = 'integration_test_' . time() . '@example.com';
    $password = 'TestPassword123!';
    
    $response = makeRequest('POST', '/api/auth/register', [
        'email' => $email,
        'password' => $password,
        'password_confirmation' => $password,
        'first_name' => 'Integration',
        'last_name' => 'Test',
        'phone' => '+1234567899'
    ]);
    
    assertTest(
        'Registration returns 201',
        $response['status'] === 201,
        "Expected 201, got {$response['status']}"
    );
    
    assertTest(
        'Registration returns user data',
        isset($response['json']['data']['user']),
        'User data not found in response'
    );
    
    assertTest(
        'Registration sets session cookie',
        isset($response['cookies']['parce_session']),
        'Session cookie not set'
    );
    
    assertTest(
        'User has customer role by default',
        isset($response['json']['data']['user']['roles']) && 
        in_array('customer', $response['json']['data']['user']['roles']),
        'Customer role not assigned'
    );
    
    return [
        'email' => $email,
        'password' => $password,
        'session' => $response['cookies']['parce_session'] ?? null
    ];
}

/**
 * Test 3: Login with Seeded Users
 */
function testLogin(): array
{
    printHeader('Test 3: Login with Seeded Users');
    
    $testUsers = [
        ['email' => 'superadmin@parce.local', 'password' => 'SuperAdmin123!', 'role' => 'super_admin'],
        ['email' => 'admin@parce.local', 'password' => 'Admin123!', 'role' => 'administrator'],
        ['email' => 'customer@parce.local', 'password' => 'Customer123!', 'role' => 'customer'],
        ['email' => 'mechanic@parce.local', 'password' => 'Mechanic123!', 'role' => 'mechanic']
    ];
    
    $sessions = [];
    
    foreach ($testUsers as $user) {
        $response = makeRequest('POST', '/api/auth/login', [
            'email' => $user['email'],
            'password' => $user['password']
        ]);
        
        assertTest(
            "Login successful for {$user['role']}",
            $response['status'] === 200,
            "Expected 200, got {$response['status']}"
        );
        
        assertTest(
            "Session cookie set for {$user['role']}",
            isset($response['cookies']['parce_session']),
            'Session cookie not set'
        );
        
        assertTest(
            "User has {$user['role']} role",
            isset($response['json']['data']['user']['roles']) && 
            in_array($user['role'], $response['json']['data']['user']['roles']),
            "Expected {$user['role']} role"
        );
        
        $sessions[$user['role']] = $response['cookies']['parce_session'] ?? null;
    }
    
    return $sessions;
}

/**
 * Test 4: Protected Route Access
 */
function testProtectedRoutes(array $sessions): void
{
    printHeader('Test 4: Protected Route Access');
    
    // Test without authentication
    $response = makeRequest('GET', '/api/auth/me');
    assertTest(
        'Protected route returns 401 without auth',
        $response['status'] === 401,
        "Expected 401, got {$response['status']}"
    );
    
    // Test with customer session
    if (isset($sessions['customer'])) {
        $response = makeRequest('GET', '/api/auth/me', [], [
            'parce_session' => $sessions['customer']
        ]);
        
        assertTest(
            'Protected route accessible with valid session',
            $response['status'] === 200,
            "Expected 200, got {$response['status']}"
        );
        
        assertTest(
            'Me endpoint returns user data',
            isset($response['json']['data']['email']),
            'User data not found'
        );
    }
}

/**
 * Test 5: Session Persistence
 */
function testSessionPersistence(array $sessions): void
{
    printHeader('Test 5: Session Persistence');
    
    if (isset($sessions['customer'])) {
        // Make multiple requests with same session
        for ($i = 1; $i <= 3; $i++) {
            $response = makeRequest('GET', '/api/auth/me', [], [
                'parce_session' => $sessions['customer']
            ]);
            
            assertTest(
                "Session persists on request #{$i}",
                $response['status'] === 200,
                "Expected 200, got {$response['status']}"
            );
        }
    }
}

/**
 * Test 6: Logout
 */
function testLogout(array $sessions): void
{
    printHeader('Test 6: Logout');
    
    if (isset($sessions['customer'])) {
        // Logout
        $response = makeRequest('POST', '/api/auth/logout', [], [
            'parce_session' => $sessions['customer']
        ]);
        
        assertTest(
            'Logout returns 200',
            $response['status'] === 200,
            "Expected 200, got {$response['status']}"
        );
        
        // Try to access protected route with logged out session
        $response = makeRequest('GET', '/api/auth/me', [], [
            'parce_session' => $sessions['customer']
        ]);
        
        assertTest(
            'Session invalidated after logout',
            $response['status'] === 401,
            "Expected 401, got {$response['status']}"
        );
    }
}

/**
 * Test 7: Invalid Credentials
 */
function testInvalidCredentials(): void
{
    printHeader('Test 7: Invalid Credentials');
    
    $response = makeRequest('POST', '/api/auth/login', [
        'email' => 'customer@parce.local',
        'password' => 'WrongPassword123!'
    ]);
    
    assertTest(
        'Invalid password returns 401',
        $response['status'] === 401,
        "Expected 401, got {$response['status']}"
    );
    
    $response = makeRequest('POST', '/api/auth/login', [
        'email' => 'nonexistent@example.com',
        'password' => 'Password123!'
    ]);
    
    assertTest(
        'Nonexistent user returns 401',
        $response['status'] === 401,
        "Expected 401, got {$response['status']}"
    );
}

/**
 * Test 8: Validation Errors
 */
function testValidationErrors(): void
{
    printHeader('Test 8: Validation Errors');
    
    // Missing email
    $response = makeRequest('POST', '/api/auth/login', [
        'password' => 'Password123!'
    ]);
    
    assertTest(
        'Missing email returns 400',
        $response['status'] === 400,
        "Expected 400, got {$response['status']}"
    );
    
    // Invalid email format
    $response = makeRequest('POST', '/api/auth/register', [
        'email' => 'invalid-email',
        'password' => 'Password123!',
        'password_confirmation' => 'Password123!',
        'first_name' => 'Test',
        'last_name' => 'User'
    ]);
    
    assertTest(
        'Invalid email format returns 400',
        $response['status'] === 400,
        "Expected 400, got {$response['status']}"
    );
    
    // Short password
    $response = makeRequest('POST', '/api/auth/register', [
        'email' => 'test@example.com',
        'password' => 'short',
        'password_confirmation' => 'short',
        'first_name' => 'Test',
        'last_name' => 'User'
    ]);
    
    assertTest(
        'Short password returns 400',
        $response['status'] === 400,
        "Expected 400, got {$response['status']}"
    );
}

// Run all tests
try {
    printHeader('P.A.R.C.E Authentication Integration Tests');
    echo "Testing against: " . BASE_URL . "\n";
    
    $startTime = microtime(true);
    
    testHealthEndpoint();
    $registrationData = testRegistration();
    $sessions = testLogin();
    testProtectedRoutes($sessions);
    testSessionPersistence($sessions);
    testLogout($sessions);
    testInvalidCredentials();
    testValidationErrors();
    
    $duration = round(microtime(true) - $startTime, 2);
    
    // Print summary
    printHeader('Test Summary');
    printLine("Total Tests: " . ($results['passed'] + $results['failed']), COLOR_BLUE);
    printLine("Passed: {$results['passed']}", COLOR_GREEN);
    printLine("Failed: {$results['failed']}", $results['failed'] > 0 ? COLOR_RED : COLOR_GREEN);
    printLine("Duration: {$duration}s", COLOR_BLUE);
    
    if ($results['failed'] === 0) {
        printLine("\n✓ All tests passed!", COLOR_GREEN);
        exit(0);
    } else {
        printLine("\n✗ Some tests failed!", COLOR_RED);
        exit(1);
    }
    
} catch (Exception $e) {
    printLine("\n✗ Test execution failed: " . $e->getMessage(), COLOR_RED);
    exit(1);
}
