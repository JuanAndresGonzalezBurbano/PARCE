<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Core\Request;
use App\Core\Response;
use App\Infrastructure\Admin\AdminService;
use App\Infrastructure\Http\ResponseFormatter;
use App\Infrastructure\Http\ErrorHandler;

/**
 * Controlador de Administración
 *
 * Maneja las peticiones HTTP para el panel de administración: resumen del
 * dashboard y listado de todas las calificaciones con filtros.
 */
class AdminController extends Controller
{
    private AdminService $adminService;

    public function __construct()
    {
        $this->adminService = new AdminService();
    }

    /**
     * Obtener el resumen del dashboard de administración
     *
     * GET /api/admin/dashboard
     */
    public function dashboard(Request $request): Response
    {
        try {
            $summary = $this->adminService->dashboard();

            return ResponseFormatter::success(
                ['summary' => $summary],
                'Resumen del dashboard obtenido correctamente',
                200
            );

        } catch (\Exception $e) {
            return ErrorHandler::handleException($e);
        }
    }

    /**
     * Listar todas las calificaciones con filtros
     *
     * GET /api/admin/ratings
     */
    public function ratings(Request $request): Response
    {
        try {
            $filters = [
                'mechanicId' => $request->query('mechanic_id'),
                'customerId' => $request->query('customer_id'),
                'minRating'  => $request->query('min_rating'),
                'dateFrom'   => $request->query('date_from'),
                'dateTo'     => $request->query('date_to'),
            ];

            $ratings = $this->adminService->ratings($filters);

            return ResponseFormatter::success([
                'ratings' => $ratings,
                'count'   => count($ratings),
            ], 'Calificaciones obtenidas correctamente', 200);

        } catch (\Exception $e) {
            return ErrorHandler::handleException($e);
        }
    }
}
