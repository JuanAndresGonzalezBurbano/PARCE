<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Core\Request;
use App\Core\Response;
use App\Infrastructure\Vehicle\VehicleService;
use App\Infrastructure\Vehicle\VehicleValidator;
use App\Infrastructure\Http\RequestValidator;
use App\Infrastructure\Http\ResponseFormatter;
use App\Infrastructure\Http\ErrorHandler;

/**
 * Vehicle Controller
 *
 * Expone los endpoints HTTP de gestión de vehículos:
 *   GET    /api/vehicles          — listar vehículos del usuario
 *   POST   /api/vehicles          — crear vehículo
 *   GET    /api/vehicles/{id}     — detalle de un vehículo
 *   PUT    /api/vehicles/{id}     — actualizar vehículo
 *   DELETE /api/vehicles/{id}     — soft-delete
 *   PUT    /api/vehicles/{id}/primary — marcar como principal
 *
 * Los campos de SOAT y tecnomecánica se extraen y pasan al servicio
 * tanto en la creación como en la actualización.
 */
class VehicleController extends Controller
{
    private VehicleService $vehicleService;

    public function __construct()
    {
        $this->vehicleService = new VehicleService();
    }

    // =========================================================================
    // GET /api/vehicles
    // =========================================================================

    /**
     * Lista los vehículos del usuario autenticado.
     * Admite ?active_only=false para incluir inactivos.
     */
    public function index(Request $request): Response
    {
        try {
            $userId     = $request->getAttribute('userId');
            // Por defecto solo activos; enviar ?active_only=false para ver todos
            $activeOnly = $request->query('active_only', 'true') !== 'false';

            $vehicles = $this->vehicleService->getUserVehicles($userId, $activeOnly);

            return ResponseFormatter::success([
                'vehicles' => $vehicles,
                'count'    => count($vehicles),
            ], 'Vehicles retrieved successfully', 200);

        } catch (\Exception $e) {
            return ErrorHandler::handleException($e);
        }
    }

    // =========================================================================
    // POST /api/vehicles
    // =========================================================================

    /**
     * Crea un nuevo vehículo.
     *
     * Extrae los campos de documentos (SOAT y tecnomecánica) además
     * de los campos básicos del vehículo y los pasa al servicio.
     */
    public function store(Request $request): Response
    {
        try {
            $ctValidation = RequestValidator::validateContentType($request, 'POST');
            if (!$ctValidation['valid']) {
                return ResponseFormatter::error($ctValidation['error'], null, $ctValidation['statusCode']);
            }

            $jsonValidation = RequestValidator::parseJsonBody($request);
            if (!$jsonValidation['valid']) {
                return ResponseFormatter::error($jsonValidation['error'], null, $jsonValidation['statusCode']);
            }

            // VehicleValidator ya valida SOAT y tecnomecánica (Wave 1, ya existente)
            $validation = VehicleValidator::validateCreateRequest($request);
            if (!$validation['valid']) {
                return ResponseFormatter::validationError($validation['errors']);
            }

            $userId = $request->getAttribute('userId');

            // ---- Campos base obligatorios ----
            $data = [
                'license_plate' => RequestValidator::sanitizeString($request->input('license_plate')),
                'make'          => RequestValidator::sanitizeString($request->input('make')),
                'model'         => RequestValidator::sanitizeString($request->input('model')),
                'year'          => $request->input('year'),
                'vehicle_type'  => $request->input('vehicle_type'),
                'fuel_type'     => $request->input('fuel_type'),
            ];

            // ---- Campos base opcionales ----
            if ($request->input('color') !== null) {
                $data['color'] = RequestValidator::sanitizeString($request->input('color'));
            }
            if ($request->input('vin') !== null) {
                $data['vin'] = RequestValidator::sanitizeString($request->input('vin'));
            }
            if ($request->input('nickname') !== null) {
                $data['nickname'] = RequestValidator::sanitizeString($request->input('nickname'));
            }
            if ($request->input('primary_photo_url') !== null) {
                $data['primary_photo_url'] = $request->input('primary_photo_url');
            }
            if ($request->input('is_primary') !== null) {
                $data['is_primary'] = filter_var($request->input('is_primary'), FILTER_VALIDATE_BOOLEAN);
            }

            // ---- Campos SOAT (opcionales en la creación) ----
            if ($request->input('soat_number') !== null) {
                $data['soat_number'] = RequestValidator::sanitizeString($request->input('soat_number'));
            }
            if ($request->input('soat_expiration_date') !== null) {
                $data['soat_expiration_date'] = $request->input('soat_expiration_date');
            }
            if ($request->input('soat_document_url') !== null) {
                $data['soat_document_url'] = $request->input('soat_document_url');
            }

            // ---- Campos Tecnomecánica (opcionales en la creación) ----
            if ($request->input('tecnomecanica_number') !== null) {
                $data['tecnomecanica_number'] = RequestValidator::sanitizeString($request->input('tecnomecanica_number'));
            }
            if ($request->input('tecnomecanica_expiration_date') !== null) {
                $data['tecnomecanica_expiration_date'] = $request->input('tecnomecanica_expiration_date');
            }
            if ($request->input('tecnomecanica_document_url') !== null) {
                $data['tecnomecanica_document_url'] = $request->input('tecnomecanica_document_url');
            }

            $vehicleId = $this->vehicleService->create($userId, $data);

            $vehicle = $this->vehicleService->getById($vehicleId, $userId);

            return ResponseFormatter::success(
                ['vehicle' => $vehicle],
                'Vehicle created successfully',
                201
            );

        } catch (\Exception $e) {
            return ErrorHandler::handleException($e);
        }
    }

    // =========================================================================
    // GET /api/vehicles/{id}
    // =========================================================================

    /**
     * Retorna el detalle de un vehículo del usuario, incluyendo documentos.
     */
    public function show(Request $request, int $id): Response
    {
        try {
            $userId  = $request->getAttribute('userId');
            $vehicle = $this->vehicleService->getById($id, $userId);

            if ($vehicle === null) {
                return ResponseFormatter::notFound('Vehicle not found');
            }

            return ResponseFormatter::success(
                ['vehicle' => $vehicle],
                'Vehicle retrieved successfully',
                200
            );

        } catch (\Exception $e) {
            return ErrorHandler::handleException($e);
        }
    }

    // =========================================================================
    // PUT /api/vehicles/{id}
    // =========================================================================

    /**
     * Actualiza un vehículo existente.
     *
     * Permite actualizar campos de SOAT y tecnomecánica.
     * El servicio validará que no se reactive el vehículo si los documentos
     * están vencidos.
     */
    public function update(Request $request, int $id): Response
    {
        try {
            $ctValidation = RequestValidator::validateContentType($request, 'PUT');
            if (!$ctValidation['valid']) {
                return ResponseFormatter::error($ctValidation['error'], null, $ctValidation['statusCode']);
            }

            $jsonValidation = RequestValidator::parseJsonBody($request);
            if (!$jsonValidation['valid']) {
                return ResponseFormatter::error($jsonValidation['error'], null, $jsonValidation['statusCode']);
            }

            $validation = VehicleValidator::validateUpdateRequest($request);
            if (!$validation['valid']) {
                return ResponseFormatter::validationError($validation['errors']);
            }

            $userId = $request->getAttribute('userId');
            $data   = [];

            // ---- Campos base (solo los que vienen en el request) ----
            if ($request->input('license_plate') !== null) {
                $data['license_plate'] = RequestValidator::sanitizeString($request->input('license_plate'));
            }
            if ($request->input('make') !== null) {
                $data['make'] = RequestValidator::sanitizeString($request->input('make'));
            }
            if ($request->input('model') !== null) {
                $data['model'] = RequestValidator::sanitizeString($request->input('model'));
            }
            if ($request->input('year') !== null) {
                $data['year'] = $request->input('year');
            }
            if ($request->input('color') !== null) {
                $data['color'] = RequestValidator::sanitizeString($request->input('color'));
            }
            if ($request->input('vin') !== null) {
                $data['vin'] = RequestValidator::sanitizeString($request->input('vin'));
            }
            if ($request->input('vehicle_type') !== null) {
                $data['vehicle_type'] = $request->input('vehicle_type');
            }
            if ($request->input('fuel_type') !== null) {
                $data['fuel_type'] = $request->input('fuel_type');
            }
            if ($request->input('nickname') !== null) {
                $data['nickname'] = RequestValidator::sanitizeString($request->input('nickname'));
            }
            if ($request->input('primary_photo_url') !== null) {
                $data['primary_photo_url'] = $request->input('primary_photo_url');
            }
            if ($request->input('status') !== null) {
                $data['status'] = $request->input('status');
            }
            if ($request->input('is_primary') !== null) {
                $data['is_primary'] = filter_var($request->input('is_primary'), FILTER_VALIDATE_BOOLEAN);
            }

            // ---- Campos SOAT ----
            if ($request->input('soat_number') !== null) {
                $data['soat_number'] = RequestValidator::sanitizeString($request->input('soat_number'));
            }
            if ($request->input('soat_expiration_date') !== null) {
                $data['soat_expiration_date'] = $request->input('soat_expiration_date');
            }
            if ($request->input('soat_document_url') !== null) {
                $data['soat_document_url'] = $request->input('soat_document_url');
            }

            // ---- Campos Tecnomecánica ----
            if ($request->input('tecnomecanica_number') !== null) {
                $data['tecnomecanica_number'] = RequestValidator::sanitizeString($request->input('tecnomecanica_number'));
            }
            if ($request->input('tecnomecanica_expiration_date') !== null) {
                $data['tecnomecanica_expiration_date'] = $request->input('tecnomecanica_expiration_date');
            }
            if ($request->input('tecnomecanica_document_url') !== null) {
                $data['tecnomecanica_document_url'] = $request->input('tecnomecanica_document_url');
            }

            $this->vehicleService->update($id, $userId, $data);

            $vehicle = $this->vehicleService->getById($id, $userId);

            return ResponseFormatter::success(
                ['vehicle' => $vehicle],
                'Vehicle updated successfully',
                200
            );

        } catch (\Exception $e) {
            return ErrorHandler::handleException($e);
        }
    }

    // =========================================================================
    // DELETE /api/vehicles/{id}
    // =========================================================================

    /**
     * Soft-delete de un vehículo (marca deleted_at, no borra la fila).
     */
    public function destroy(Request $request, int $id): Response
    {
        try {
            $userId = $request->getAttribute('userId');
            $this->vehicleService->delete($id, $userId);

            return ResponseFormatter::success(null, 'Vehicle deleted successfully', 200);

        } catch (\Exception $e) {
            return ErrorHandler::handleException($e);
        }
    }

    // =========================================================================
    // PUT /api/vehicles/{id}/primary
    // =========================================================================

    /**
     * Marca un vehículo como el principal del usuario.
     * Automáticamente desmarca cualquier otro vehículo que fuera principal.
     */
    public function setPrimary(Request $request, int $id): Response
    {
        try {
            $userId = $request->getAttribute('userId');
            $this->vehicleService->setPrimary($id, $userId);

            $vehicle = $this->vehicleService->getById($id, $userId);

            return ResponseFormatter::success(
                ['vehicle' => $vehicle],
                'Vehicle set as primary successfully',
                200
            );

        } catch (\Exception $e) {
            return ErrorHandler::handleException($e);
        }
    }
}
