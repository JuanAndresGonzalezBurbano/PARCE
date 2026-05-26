<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Core\Request;
use App\Core\Response;
use App\Core\Database;

/**
 * Health Check Controller
 * 
 * Provides health check endpoints for monitoring system status.
 * Used by load balancers, monitoring tools, and DevOps.
 */
class HealthController extends Controller
{
    /**
     * Basic health check
     * 
     * Returns 200 OK if application is running
     */
    public function index(Request $request): Response
    {
        return Response::success([
            'status' => 'healthy',
            'message' => 'Application is running',
            'timestamp' => date('Y-m-d H:i:s'),
        ]);
    }

    /**
     * Database health check
     * 
     * Tests database connectivity and returns detailed status
     */
    public function database(Request $request): Response
    {
        try {
            $health = Database::healthCheck();
            
            $statusCode = $health['status'] === 'healthy' ? 200 : 503;
            
            return (new Response())
                ->json([
                    'status' => $health['status'],
                    'message' => $health['message'],
                    'details' => $health['details'],
                    'timestamp' => date('Y-m-d H:i:s'),
                ])
                ->setStatusCode($statusCode);
                
        } catch (\Exception $e) {
            return Response::error(
                'Database health check failed',
                [
                    'error' => $e->getMessage(),
                    'timestamp' => date('Y-m-d H:i:s'),
                ],
                503
            );
        }
    }

    /**
     * Comprehensive system health check
     * 
     * Checks all system components
     */
    public function system(Request $request): Response
    {
        $checks = [];
        $overallStatus = 'healthy';

        // Check application
        $checks['application'] = [
            'status' => 'healthy',
            'message' => 'Application is running',
        ];

        // Check database
        try {
            $dbHealth = Database::healthCheck();
            $checks['database'] = $dbHealth;
            
            if ($dbHealth['status'] !== 'healthy') {
                $overallStatus = 'degraded';
            }
        } catch (\Exception $e) {
            $checks['database'] = [
                'status' => 'unhealthy',
                'message' => 'Database check failed: ' . $e->getMessage(),
            ];
            $overallStatus = 'unhealthy';
        }

        // Check storage
        $storagePath = BASE_PATH . '/storage/logs';
        $checks['storage'] = [
            'status' => is_writable($storagePath) ? 'healthy' : 'unhealthy',
            'message' => is_writable($storagePath) 
                ? 'Storage is writable' 
                : 'Storage is not writable',
            'path' => $storagePath,
        ];

        if ($checks['storage']['status'] !== 'healthy') {
            $overallStatus = 'degraded';
        }

        // Check PHP version
        $checks['php'] = [
            'status' => 'healthy',
            'version' => PHP_VERSION,
            'required' => '>=8.2',
        ];

        $statusCode = match($overallStatus) {
            'healthy' => 200,
            'degraded' => 200,
            'unhealthy' => 503,
        };

        return (new Response())
            ->json([
                'status' => $overallStatus,
                'checks' => $checks,
                'timestamp' => date('Y-m-d H:i:s'),
            ])
            ->setStatusCode($statusCode);
    }
}
