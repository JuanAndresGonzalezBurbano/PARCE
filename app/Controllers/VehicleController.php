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
 * Handles HTTP requests for vehicle management operations including
 * creation, retrieval, updates, deletion, and primary vehicle designation.
 */
class VehicleController extends Controller
{
    private VehicleService $vehicleService;

    public function __construct()
    {
        $this->vehicleService = new VehicleService();
    }

    /**
     * List user's vehicles
     * 
     * GET /api/vehicles
     * 
     * @param Request $request HTTP request
     * @return Response HTTP response
     */
    public function index(Request $request): Response
    {
        try {
            // Get authenticated user ID (set by AuthMiddleware)
            $userId = $request->getAttribute('userId');
            
            // Get query parameter for filtering
            $activeOnly = $request->query('active_only', 'true') !== 'false';
            
            // Get user's vehicles
            $vehicles = $this->vehicleService->getUserVehicles($userId, $activeOnly);
            
            return ResponseFormatter::success([
                'vehicles' => $vehicles,
                'count' => count($vehicles)
            ], 'Vehicles retrieved successfully', 200);
            
        } catch (\Exception $e) {
            return ErrorHandler::handleException($e);
        }
    }

    /**
     * Create new vehicle
     * 
     * POST /api/vehicles
     * 
     * @param Request $request HTTP request
     * @return Response HTTP response
     */
    public function store(Request $request): Response
    {
        try {
            // Validate Content-Type
            $contentTypeValidation = RequestValidator::validateContentType($request, 'POST');
            if (!$contentTypeValidation['valid']) {
                return ResponseFormatter::error(
                    $contentTypeValidation['error'],
                    null,
                    $contentTypeValidation['statusCode']
                );
            }

            // Parse JSON body
            $jsonValidation = RequestValidator::parseJsonBody($request);
            if (!$jsonValidation['valid']) {
                return ResponseFormatter::error(
                    $jsonValidation['error'],
                    null,
                    $jsonValidation['statusCode']
                );
            }

            // Validate vehicle data
            $validation = VehicleValidator::validateCreateRequest($request);
            if (!$validation['valid']) {
                return ResponseFormatter::validationError($validation['errors']);
            }

            // Get authenticated user ID
            $userId = $request->getAttribute('userId');

            // Extract and sanitize input
            $data = [
                'license_plate' => RequestValidator::sanitizeString($request->input('license_plate')),
                'make' => RequestValidator::sanitizeString($request->input('make')),
                'model' => RequestValidator::sanitizeString($request->input('model')),
                'year' => $request->input('year'),
                'vehicle_type' => $request->input('vehicle_type'),
                'fuel_type' => $request->input('fuel_type')
            ];

            // Add optional fields
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

            // Create vehicle
            $vehicleId = $this->vehicleService->create($userId, $data);

            // Fetch created vehicle
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

    /**
     * Get vehicle details
     * 
     * GET /api/vehicles/{id}
     * 
     * @param Request $request HTTP request
     * @param int $id Vehicle ID
     * @return Response HTTP response
     */
    public function show(Request $request, int $id): Response
    {
        try {
            // Get authenticated user ID
            $userId = $request->getAttribute('userId');

            // Get vehicle
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

    /**
     * Update vehicle
     * 
     * PUT /api/vehicles/{id}
     * 
     * @param Request $request HTTP request
     * @param int $id Vehicle ID
     * @return Response HTTP response
     */
    public function update(Request $request, int $id): Response
    {
        try {
            // Validate Content-Type
            $contentTypeValidation = RequestValidator::validateContentType($request, 'PUT');
            if (!$contentTypeValidation['valid']) {
                return ResponseFormatter::error(
                    $contentTypeValidation['error'],
                    null,
                    $contentTypeValidation['statusCode']
                );
            }

            // Parse JSON body
            $jsonValidation = RequestValidator::parseJsonBody($request);
            if (!$jsonValidation['valid']) {
                return ResponseFormatter::error(
                    $jsonValidation['error'],
                    null,
                    $jsonValidation['statusCode']
                );
            }

            // Validate vehicle data
            $validation = VehicleValidator::validateUpdateRequest($request);
            if (!$validation['valid']) {
                return ResponseFormatter::validationError($validation['errors']);
            }

            // Get authenticated user ID
            $userId = $request->getAttribute('userId');

            // Prepare update data
            $data = [];

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

            // Update vehicle
            $this->vehicleService->update($id, $userId, $data);

            // Fetch updated vehicle
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

    /**
     * Delete vehicle (soft delete)
     * 
     * DELETE /api/vehicles/{id}
     * 
     * @param Request $request HTTP request
     * @param int $id Vehicle ID
     * @return Response HTTP response
     */
    public function destroy(Request $request, int $id): Response
    {
        try {
            // Get authenticated user ID
            $userId = $request->getAttribute('userId');

            // Delete vehicle
            $this->vehicleService->delete($id, $userId);

            return ResponseFormatter::success(
                null,
                'Vehicle deleted successfully',
                200
            );

        } catch (\Exception $e) {
            return ErrorHandler::handleException($e);
        }
    }

    /**
     * Set vehicle as primary
     * 
     * PUT /api/vehicles/{id}/primary
     * 
     * @param Request $request HTTP request
     * @param int $id Vehicle ID
     * @return Response HTTP response
     */
    public function setPrimary(Request $request, int $id): Response
    {
        try {
            // Get authenticated user ID
            $userId = $request->getAttribute('userId');

            // Set as primary
            $this->vehicleService->setPrimary($id, $userId);

            // Fetch updated vehicle
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
