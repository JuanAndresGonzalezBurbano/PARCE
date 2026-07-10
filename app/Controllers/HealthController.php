<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Core\Request;
use App\Core\Response;
use App\Core\Database;
use App\Infrastructure\Http\ResponseFormatter;

/**
 * Controlador de Verificación de Salud del Sistema
 *
 * Provee endpoints para monitorear el estado del sistema.
 * Usado por balanceadores de carga, herramientas de monitoreo y DevOps.
 */
class HealthController extends Controller
{
    /**
     * Verificación básica de salud
     *
     * Retorna 200 OK si la aplicación está en ejecución.
     */
    public function index(Request $request): Response
    {
        return ResponseFormatter::success([
            'status'    => 'healthy',
            'message'   => 'Aplicación en ejecución',
            'timestamp' => date('Y-m-d H:i:s'),
        ]);
    }

    /**
     * Verificación de salud de la base de datos
     *
     * Prueba la conectividad con la base de datos y retorna el estado detallado.
     * CORRECCIÓN: cuando el estado no es 'healthy', se usa ResponseFormatter::error()
     * con código 503 en lugar de ResponseFormatter::success(), lo cual era contradictorio.
     */
    public function database(Request $request): Response
    {
        try {
            $health = Database::healthCheck();

            // Si la base de datos está saludable, retornar respuesta exitosa con 200
            if ($health['status'] === 'healthy') {
                return ResponseFormatter::success([
                    'status'    => $health['status'],
                    'message'   => $health['message'],
                    'details'   => $health['details'],
                    'timestamp' => date('Y-m-d H:i:s'),
                ], null, 200);
            }

            // Si la base de datos NO está saludable, retornar error con 503
            return ResponseFormatter::error(
                'La base de datos no está disponible',
                [
                    'status'    => $health['status'],
                    'message'   => $health['message'],
                    'details'   => $health['details'],
                    'timestamp' => date('Y-m-d H:i:s'),
                ],
                503
            );

        } catch (\Exception $e) {
            return ResponseFormatter::error(
                'La verificación de salud de la base de datos falló',
                [
                    'error'     => $e->getMessage(),
                    'timestamp' => date('Y-m-d H:i:s'),
                ],
                503
            );
        }
    }

    /**
     * Verificación integral de salud del sistema
     *
     * Comprueba todos los componentes del sistema.
     */
    public function system(Request $request): Response
    {
        $checks        = [];
        $overallStatus = 'healthy';

        // Verificar aplicación
        $checks['application'] = [
            'status'  => 'healthy',
            'message' => 'Aplicación en ejecución',
        ];

        // Verificar base de datos
        try {
            $dbHealth             = Database::healthCheck();
            $checks['database']   = $dbHealth;

            if ($dbHealth['status'] !== 'healthy') {
                $overallStatus = 'degraded';
            }
        } catch (\Exception $e) {
            $checks['database'] = [
                'status'  => 'unhealthy',
                'message' => 'Verificación de base de datos falló: ' . $e->getMessage(),
            ];
            $overallStatus = 'unhealthy';
        }

        // Verificar almacenamiento
        $storagePath        = BASE_PATH . '/storage/logs';
        $checks['storage']  = [
            'status'  => is_writable($storagePath) ? 'healthy' : 'unhealthy',
            'message' => is_writable($storagePath)
                ? 'El almacenamiento tiene permisos de escritura'
                : 'El almacenamiento no tiene permisos de escritura',
            'path'    => $storagePath,
        ];

        if ($checks['storage']['status'] !== 'healthy') {
            $overallStatus = 'degraded';
        }

        // Verificar versión de PHP
        $checks['php'] = [
            'status'   => 'healthy',
            'version'  => PHP_VERSION,
            'required' => '>=8.2',
        ];

        $statusCode = match($overallStatus) {
            'healthy'   => 200,
            'degraded'  => 200,
            'unhealthy' => 503,
        };

        return ResponseFormatter::success([
            'status'    => $overallStatus,
            'checks'    => $checks,
            'timestamp' => date('Y-m-d H:i:s'),
        ], null, $statusCode);
    }
}
