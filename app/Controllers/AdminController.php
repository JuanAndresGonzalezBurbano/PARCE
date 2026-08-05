<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Core\Request;
use App\Core\Response;
use App\Models\Admin\AdminService;
use App\Views\ResponseFormatter;
use App\Views\ErrorHandler;

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

    /**
     * Listar todos los usuarios con filtros
     *
     * GET /api/admin/users
     */
    public function users(Request $request): Response
    {
        try {
            $filters = [
                'role'   => $request->query('role'),
                'status' => $request->query('status'),
                'search' => $request->query('search'),
            ];

            $users = $this->adminService->getUsers($filters);

            return ResponseFormatter::success([
                'users' => $users,
                'count' => count($users),
            ], 'Usuarios obtenidos correctamente', 200);

        } catch (\Exception $e) {
            return ErrorHandler::handleException($e);
        }
    }

    /**
     * Listar todos los vehículos
     *
     * GET /api/admin/vehicles
     */
    public function vehicles(Request $request): Response
    {
        try {
            $search = $request->query('search');
            $vehicles = $this->adminService->getVehicles($search);

            return ResponseFormatter::success([
                'vehicles' => $vehicles,
                'count'    => count($vehicles),
            ], 'Vehículos obtenidos correctamente', 200);

        } catch (\Exception $e) {
            return ErrorHandler::handleException($e);
        }
    }

    /**
     * Actualizar estado de un usuario
     *
     * PUT /api/admin/users/{id}/status
     */
    public function updateUserStatus(Request $request): Response
    {
        try {
            $userId = (int) $request->getAttribute('id');
            $status = $request->input('status');

            if (!in_array($status, ['active', 'inactive', 'suspended'])) {
                return ResponseFormatter::validationError([
                    'status' => 'Estado inválido. Debe ser: active, inactive o suspended'
                ]);
            }

            $this->adminService->updateUserStatus($userId, $status);

            return ResponseFormatter::success(
                null,
                'Estado del usuario actualizado correctamente',
                200
            );

        } catch (\Exception $e) {
            return ErrorHandler::handleException($e);
        }
    }
}
