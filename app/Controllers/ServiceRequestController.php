<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Core\Request;
use App\Core\Response;
use App\Infrastructure\ServiceRequest\ServiceRequestService;
use App\Infrastructure\ServiceRequest\ServiceRequestValidator;
use App\Infrastructure\Http\RequestValidator;
use App\Infrastructure\Http\ResponseFormatter;
use App\Infrastructure\Http\ErrorHandler;

/**
 * Service Request Controller
 * 
 * Handles HTTP requests for service request management including
 * creation, retrieval, updates, cancellation, and rating.
 */
class ServiceRequestController extends Controller
{
    private ServiceRequestService $serviceRequestService;

    public function __construct()
    {
        $this->serviceRequestService = new ServiceRequestService();
    }

    /**
     * List customer's service requests
     * 
     * GET /api/service-requests
     * 
     * @param Request $request HTTP request
     * @return Response HTTP response
     */
    public function index(Request $request): Response
    {
        try {
            // Get authenticated user
            $userId = $request->getAttribute('userId');
            $userRole = $request->getAttribute('userRole');
            
            // Get optional status filter
            $status = $request->query('status');
            
            // Get customer's requests
            $requests = $this->serviceRequestService->getCustomerRequests($userId, $status);
            
            return ResponseFormatter::success([
                'service_requests' => $requests,
                'count' => count($requests)
            ], 'Service requests retrieved successfully', 200);
            
        } catch (\Exception $e) {
            return ErrorHandler::handleException($e);
        }
    }

    /**
     * Create new service request
     * 
     * POST /api/service-requests
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

            // Validate service request data
            $validation = ServiceRequestValidator::validateCreateRequest($request);
            if (!$validation['valid']) {
                return ResponseFormatter::validationError($validation['errors']);
            }

            // Get authenticated user
            $userId = $request->getAttribute('userId');
            $userRole = $request->getAttribute('userRole');
            
            // Extract and sanitize input
            $data = [
                'vehicle_id' => $request->input('vehicle_id'),
                'emergency_type' => RequestValidator::sanitizeString($request->input('emergency_type')),
                'description' => RequestValidator::sanitizeString($request->input('description')),
                'latitude' => $request->input('latitude'),
                'longitude' => $request->input('longitude')
            ];

            // Add optional priority
            if ($request->input('priority') !== null) {
                $data['priority'] = RequestValidator::sanitizeString($request->input('priority'));
            }

            // Create service request
            $requestId = $this->serviceRequestService->create($userId, $data);

            // Fetch created request
            $serviceRequest = $this->serviceRequestService->getById($requestId, $userId, $userRole);

            return ResponseFormatter::success(
                ['service_request' => $serviceRequest],
                'Service request created successfully',
                201
            );

        } catch (\Exception $e) {
            return ErrorHandler::handleException($e);
        }
    }

    /**
     * Get service request details
     * 
     * GET /api/service-requests/{id}
     * 
     * @param Request $request HTTP request
     * @param int $id Service request ID
     * @return Response HTTP response
     */
    public function show(Request $request, int $id): Response
    {
        try {
            // Get authenticated user
            $userId = $request->getAttribute('userId');
            $userRole = $request->getAttribute('userRole');

            // Get service request with access control
            $serviceRequest = $this->serviceRequestService->getById($id, $userId, $userRole);

            if ($serviceRequest === null) {
                return ResponseFormatter::notFound('Service request not found');
            }

            return ResponseFormatter::success(
                ['service_request' => $serviceRequest],
                'Service request retrieved successfully',
                200
            );

        } catch (\Exception $e) {
            return ErrorHandler::handleException($e);
        }
    }

    /**
     * Update pending service request
     * 
     * PUT /api/service-requests/{id}
     * 
     * @param Request $request HTTP request
     * @param int $id Service request ID
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

            // Validate service request data
            $validation = ServiceRequestValidator::validateUpdateRequest($request);
            if (!$validation['valid']) {
                return ResponseFormatter::validationError($validation['errors']);
            }

            // Get authenticated user
            $userId = $request->getAttribute('userId');
            $userRole = $request->getAttribute('userRole');
            
            // Prepare update data
            $data = [];

            if ($request->input('description') !== null) {
                $data['description'] = RequestValidator::sanitizeString($request->input('description'));
            }
            if ($request->input('latitude') !== null) {
                $data['latitude'] = $request->input('latitude');
            }
            if ($request->input('longitude') !== null) {
                $data['longitude'] = $request->input('longitude');
            }
            if ($request->input('priority') !== null) {
                $data['priority'] = RequestValidator::sanitizeString($request->input('priority'));
            }

            // Update service request
            $this->serviceRequestService->update($id, $userId, $data);

            // Fetch updated request
            $serviceRequest = $this->serviceRequestService->getById($id, $userId, $userRole);

            return ResponseFormatter::success(
                ['service_request' => $serviceRequest],
                'Service request updated successfully',
                200
            );

        } catch (\Exception $e) {
            return ErrorHandler::handleException($e);
        }
    }

    /**
     * Cancel service request
     * 
     * POST /api/service-requests/{id}/cancel
     * 
     * @param Request $request HTTP request
     * @param int $id Service request ID
     * @return Response HTTP response
     */
    public function cancel(Request $request, int $id): Response
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

            // Validate cancellation data
            $validation = ServiceRequestValidator::validateCancellationRequest($request);
            if (!$validation['valid']) {
                return ResponseFormatter::validationError($validation['errors']);
            }

            // Get authenticated user
            $userId = $request->getAttribute('userId');
            $userRole = $request->getAttribute('userRole');
            
            // Cancel service request
            $reason = RequestValidator::sanitizeString($request->input('cancellation_reason'));
            $this->serviceRequestService->cancel($id, $userId, $reason);

            // Fetch updated request
            $serviceRequest = $this->serviceRequestService->getById($id, $userId, $userRole);

            return ResponseFormatter::success(
                ['service_request' => $serviceRequest],
                'Service request cancelled successfully',
                200
            );

        } catch (\Exception $e) {
            return ErrorHandler::handleException($e);
        }
    }

    /**
     * Rate completed service request
     * 
     * POST /api/service-requests/{id}/rate
     * 
     * @param Request $request HTTP request
     * @param int $id Service request ID
     * @return Response HTTP response
     */
    public function rate(Request $request, int $id): Response
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

            // Validate rating data
            $validation = ServiceRequestValidator::validateRatingRequest($request);
            if (!$validation['valid']) {
                return ResponseFormatter::validationError($validation['errors']);
            }

            // Get authenticated user
            $userId = $request->getAttribute('userId');
            $userRole = $request->getAttribute('userRole');
            
            // Rate service request
            $rating = (int)$request->input('customer_rating');
            $feedback = $request->input('customer_feedback') 
                ? RequestValidator::sanitizeString($request->input('customer_feedback'))
                : null;
            
            $this->serviceRequestService->rate($id, $userId, $rating, $feedback);

            // Fetch updated request
            $serviceRequest = $this->serviceRequestService->getById($id, $userId, $userRole);

            return ResponseFormatter::success(
                ['service_request' => $serviceRequest],
                'Service request rated successfully',
                200
            );

        } catch (\Exception $e) {
            return ErrorHandler::handleException($e);
        }
    }

    /**
     * List available pending requests for mechanics (nearby)
     * 
     * GET /api/mechanic/requests/available
     * 
     * @param Request $request HTTP request
     * @return Response HTTP response
     */
    public function availableForMechanic(Request $request): Response
    {
        try {
            // Get authenticated user
            $userRole = $request->getAttribute('userRole');
            
            // Get mechanic's current location from query params
            $latitude = $request->query('latitude');
            $longitude = $request->query('longitude');
            $radius = $request->query('radius', 50); // Default 50km

            // Validate location parameters
            if ($latitude === null || $longitude === null) {
                return ResponseFormatter::validationError([
                    'location' => 'Latitude and longitude are required'
                ]);
            }

            if (!is_numeric($latitude) || !is_numeric($longitude)) {
                return ResponseFormatter::validationError([
                    'location' => 'Latitude and longitude must be numbers'
                ]);
            }

            // Get nearby pending requests
            $requests = $this->serviceRequestService->getNearbyPendingRequests(
                (float)$latitude,
                (float)$longitude,
                (int)$radius
            );

            return ResponseFormatter::success([
                'service_requests' => $requests,
                'count' => count($requests)
            ], 'Available service requests retrieved successfully', 200);

        } catch (\Exception $e) {
            return ErrorHandler::handleException($e);
        }
    }

    /**
     * Accept a pending service request (mechanic self-assignment)
     * 
     * POST /api/mechanic/requests/{id}/accept
     * 
     * @param Request $request HTTP request
     * @param int $id Service request ID
     * @return Response HTTP response
     */
    public function accept(Request $request, int $id): Response
    {
        try {
            // Get authenticated user
            $userId = $request->getAttribute('userId');
            $userRole = $request->getAttribute('userRole');
            
            // Accept request
            $this->serviceRequestService->accept($id, $userId);

            // Fetch updated request
            $serviceRequest = $this->serviceRequestService->getById($id, $userId, $userRole);

            return ResponseFormatter::success(
                ['service_request' => $serviceRequest],
                'Service request accepted successfully',
                200
            );

        } catch (\Exception $e) {
            return ErrorHandler::handleException($e);
        }
    }

    /**
     * Start work on an assigned service request
     * 
     * PUT /api/mechanic/requests/{id}/start
     * 
     * @param Request $request HTTP request
     * @param int $id Service request ID
     * @return Response HTTP response
     */
    public function start(Request $request, int $id): Response
    {
        try {
            // Get authenticated user
            $userId = $request->getAttribute('userId');
            $userRole = $request->getAttribute('userRole');
            
            // Start request
            $this->serviceRequestService->start($id, $userId);

            // Fetch updated request
            $serviceRequest = $this->serviceRequestService->getById($id, $userId, $userRole);

            return ResponseFormatter::success(
                ['service_request' => $serviceRequest],
                'Service work started successfully',
                200
            );

        } catch (\Exception $e) {
            return ErrorHandler::handleException($e);
        }
    }

    /**
     * Complete a service request
     * 
     * PUT /api/mechanic/requests/{id}/complete
     * 
     * @param Request $request HTTP request
     * @param int $id Service request ID
     * @return Response HTTP response
     */
    public function complete(Request $request, int $id): Response
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

            // Get authenticated user
            $userId = $request->getAttribute('userId');
            $userRole = $request->getAttribute('userRole');
            
            // Validate final_cost
            $finalCost = $request->input('final_cost');
            if ($finalCost === null || $finalCost === '') {
                return ResponseFormatter::validationError([
                    'final_cost' => 'Final cost is required'
                ]);
            }

            if (!is_numeric($finalCost) || $finalCost < 0) {
                return ResponseFormatter::validationError([
                    'final_cost' => 'Final cost must be a positive number'
                ]);
            }

            // Complete request
            $this->serviceRequestService->complete($id, $userId, (float)$finalCost);

            // Fetch updated request
            $serviceRequest = $this->serviceRequestService->getById($id, $userId, $userRole);

            return ResponseFormatter::success(
                ['service_request' => $serviceRequest],
                'Service request completed successfully',
                200
            );

        } catch (\Exception $e) {
            return ErrorHandler::handleException($e);
        }
    }

    /**
     * List mechanic's assigned requests
     * 
     * GET /api/mechanic/requests
     * 
     * @param Request $request HTTP request
     * @return Response HTTP response
     */
    public function mechanicIndex(Request $request): Response
    {
        try {
            // Get authenticated user
            $userId = $request->getAttribute('userId');
            $userRole = $request->getAttribute('userRole');
            
            // Get optional status filter
            $status = $request->query('status');

            // Get mechanic's assigned requests
            $requests = $this->serviceRequestService->getMechanicRequests($userId, $status);

            return ResponseFormatter::success([
                'service_requests' => $requests,
                'count' => count($requests)
            ], 'Mechanic service requests retrieved successfully', 200);

        } catch (\Exception $e) {
            return ErrorHandler::handleException($e);
        }
    }
}
