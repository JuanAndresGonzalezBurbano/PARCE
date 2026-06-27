<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Core\Request;
use App\Core\Response;
use App\Infrastructure\ServiceRequest\ServiceRequestService;
use App\Infrastructure\ServiceRequest\ServiceRequestEvidenceService;
use App\Infrastructure\ServiceRequest\ServiceRequestValidator;
use App\Infrastructure\Http\RequestValidator;
use App\Infrastructure\Http\ResponseFormatter;
use App\Infrastructure\Http\ErrorHandler;

/**
 * Service Request Controller
 *
 * Endpoints para clientes:
 *   GET  /api/service-requests           — listar solicitudes propias
 *   POST /api/service-requests           — crear solicitud
 *   GET  /api/service-requests/{id}      — detalle
 *   PUT  /api/service-requests/{id}      — actualizar solicitud pendiente
 *   POST /api/service-requests/{id}/cancel — cancelar
 *   POST /api/service-requests/{id}/rate   — calificar (3 componentes)
 *
 * Endpoints para mecánicos:
 *   GET  /api/mechanic/requests                      — mis solicitudes asignadas
 *   GET  /api/mechanic/requests/available            — solicitudes cercanas disponibles
 *   POST /api/mechanic/requests/{id}/accept          — aceptar solicitud
 *   PUT  /api/mechanic/requests/{id}/start           — iniciar trabajo
 *   PUT  /api/mechanic/requests/{id}/complete        — completar
 *   POST /api/mechanic/requests/{id}/evidence        — agregar evidencia fotográfica
 *   GET  /api/mechanic/requests/{id}/evidences       — listar evidencias
 */
class ServiceRequestController extends Controller
{
    private ServiceRequestService $serviceRequestService;
    private ServiceRequestEvidenceService $evidenceService;

    public function __construct()
    {
        $this->serviceRequestService = new ServiceRequestService();
        // Servicio de evidencias fotográficas (antes/durante/después)
        $this->evidenceService       = new ServiceRequestEvidenceService();
    }

    // =========================================================================
    // GET /api/service-requests
    // =========================================================================

    /** Lista las solicitudes del cliente autenticado. Filtra por ?status= si se envía. */
    public function index(Request $request): Response
    {
        try {
            $userId  = $request->getAttribute('userId');
            $status  = $request->query('status');

            $requests = $this->serviceRequestService->getCustomerRequests($userId, $status);

            return ResponseFormatter::success([
                'service_requests' => $requests,
                'count'            => count($requests),
            ], 'Service requests retrieved successfully', 200);

        } catch (\Exception $e) {
            return ErrorHandler::handleException($e);
        }
    }

    // =========================================================================
    // POST /api/service-requests
    // =========================================================================

    /** Crea una nueva solicitud de servicio de emergencia. */
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

            $validation = ServiceRequestValidator::validateCreateRequest($request);
            if (!$validation['valid']) {
                return ResponseFormatter::validationError($validation['errors']);
            }

            $userId = $request->getAttribute('userId');

            $data = [
                'vehicle_id'     => $request->input('vehicle_id'),
                'emergency_type' => RequestValidator::sanitizeString($request->input('emergency_type')),
                'description'    => RequestValidator::sanitizeString($request->input('description')),
                'latitude'       => $request->input('latitude'),
                'longitude'      => $request->input('longitude'),
            ];

            if ($request->input('priority') !== null) {
                $data['priority'] = RequestValidator::sanitizeString($request->input('priority'));
            }

            $requestId      = $this->serviceRequestService->create($userId, $data);
            $serviceRequest = $this->serviceRequestService->getById($requestId, $userId, 'customer');

            return ResponseFormatter::success(
                ['service_request' => $serviceRequest],
                'Service request created successfully',
                201
            );

        } catch (\Exception $e) {
            return ErrorHandler::handleException($e);
        }
    }

    // =========================================================================
    // GET /api/service-requests/{id}
    // =========================================================================

    /** Detalle de una solicitud. Aplica control de acceso por rol. */
    public function show(Request $request, int $id): Response
    {
        try {
            $userId   = $request->getAttribute('userId');
            $userRole = $request->getAttribute('userRole');

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

    // =========================================================================
    // PUT /api/service-requests/{id}
    // =========================================================================

    /** Actualiza una solicitud PENDIENTE (solo cliente). */
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

            $validation = ServiceRequestValidator::validateUpdateRequest($request);
            if (!$validation['valid']) {
                return ResponseFormatter::validationError($validation['errors']);
            }

            $userId   = $request->getAttribute('userId');
            $userRole = $request->getAttribute('userRole');
            $data     = [];

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

            $this->serviceRequestService->update($id, $userId, $data);

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

    // =========================================================================
    // POST /api/service-requests/{id}/cancel
    // =========================================================================

    /** Cancela una solicitud pendiente o asignada (solo cliente). */
    public function cancel(Request $request, int $id): Response
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

            $validation = ServiceRequestValidator::validateCancellationRequest($request);
            if (!$validation['valid']) {
                return ResponseFormatter::validationError($validation['errors']);
            }

            $userId   = $request->getAttribute('userId');
            $userRole = $request->getAttribute('userRole');
            $reason   = RequestValidator::sanitizeString($request->input('cancellation_reason'));

            $this->serviceRequestService->cancel($id, $userId, $reason);

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

    // =========================================================================
    // POST /api/service-requests/{id}/rate
    // =========================================================================

    /**
     * El cliente califica una solicitud completada.
     *
     * Sistema de 3 componentes:
     *   customer_rating        (1-5) — calificación general REQUERIDA
     *   punctuality_rating     (1-5) — puntualidad OPCIONAL
     *   service_quality_rating (1-5) — calidad del servicio OPCIONAL
     *   customer_feedback            — texto libre OPCIONAL
     *
     * El validador (ServiceRequestValidator::validateRatingRequest) ya verifica
     * los rangos y tipos antes de llegar aquí.
     */
    public function rate(Request $request, int $id): Response
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

            $validation = ServiceRequestValidator::validateRatingRequest($request);
            if (!$validation['valid']) {
                return ResponseFormatter::validationError($validation['errors']);
            }

            $userId   = $request->getAttribute('userId');
            $userRole = $request->getAttribute('userRole');

            // Calificación general (obligatoria)
            $rating = (int)$request->input('customer_rating');

            // Comentario libre (opcional)
            $feedback = $request->input('customer_feedback')
                ? RequestValidator::sanitizeString($request->input('customer_feedback'))
                : null;

            // Calificaciones de puntualidad y calidad (opcionales, Wave 2)
            $punctualityRating = $request->input('punctuality_rating') !== null
                ? (int)$request->input('punctuality_rating')
                : null;

            $serviceQualityRating = $request->input('service_quality_rating') !== null
                ? (int)$request->input('service_quality_rating')
                : null;

            // Pasar los 3 componentes al servicio
            $this->serviceRequestService->rate(
                $id,
                $userId,
                $rating,
                $feedback,
                $punctualityRating,
                $serviceQualityRating
            );

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

    // =========================================================================
    // GET /api/mechanic/requests/available
    // =========================================================================

    /**
     * Lista las solicitudes pendientes cercanas a la ubicación del mecánico.
     * Usa la fórmula de Haversine para el cálculo de distancia.
     * Las coordenadas exactas NO se exponen; solo valores redondeados a 2 decimales.
     */
    public function availableForMechanic(Request $request): Response
    {
        try {
            $latitude  = $request->query('latitude');
            $longitude = $request->query('longitude');
            $radius    = $request->query('radius', 50); // default 50 km

            if ($latitude === null || $longitude === null) {
                return ResponseFormatter::validationError([
                    'location' => 'Latitude and longitude are required',
                ]);
            }
            if (!is_numeric($latitude) || !is_numeric($longitude)) {
                return ResponseFormatter::validationError([
                    'location' => 'Latitude and longitude must be numbers',
                ]);
            }

            $requests = $this->serviceRequestService->getNearbyPendingRequests(
                (float)$latitude,
                (float)$longitude,
                (int)$radius
            );

            return ResponseFormatter::success([
                'service_requests' => $requests,
                'count'            => count($requests),
            ], 'Available service requests retrieved successfully', 200);

        } catch (\Exception $e) {
            return ErrorHandler::handleException($e);
        }
    }

    // =========================================================================
    // POST /api/mechanic/requests/{id}/accept
    // =========================================================================

    /**
     * El mecánico acepta una solicitud pendiente (auto-asignación).
     * El servicio verifica que la licencia del mecánico no esté vencida.
     */
    public function accept(Request $request, int $id): Response
    {
        try {
            $userId   = $request->getAttribute('userId');
            $userRole = $request->getAttribute('userRole');

            $this->serviceRequestService->accept($id, $userId);

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

    // =========================================================================
    // PUT /api/mechanic/requests/{id}/start
    // =========================================================================

    /** El mecánico marca que comenzó a trabajar en la solicitud asignada. */
    public function start(Request $request, int $id): Response
    {
        try {
            $userId   = $request->getAttribute('userId');
            $userRole = $request->getAttribute('userRole');

            $this->serviceRequestService->start($id, $userId);

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

    // =========================================================================
    // PUT /api/mechanic/requests/{id}/complete
    // =========================================================================

    /** El mecánico completa la solicitud e informa el costo final. */
    public function complete(Request $request, int $id): Response
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

            $userId   = $request->getAttribute('userId');
            $userRole = $request->getAttribute('userRole');

            $finalCost = $request->input('final_cost');
            if ($finalCost === null || $finalCost === '') {
                return ResponseFormatter::validationError(['final_cost' => 'Final cost is required']);
            }
            if (!is_numeric($finalCost) || $finalCost < 0) {
                return ResponseFormatter::validationError(['final_cost' => 'Final cost must be a positive number']);
            }

            $this->serviceRequestService->complete($id, $userId, (float)$finalCost);

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

    // =========================================================================
    // GET /api/mechanic/requests
    // =========================================================================

    /** Lista las solicitudes asignadas al mecánico autenticado. */
    public function mechanicIndex(Request $request): Response
    {
        try {
            $userId = $request->getAttribute('userId');
            $status = $request->query('status');

            $requests = $this->serviceRequestService->getMechanicRequests($userId, $status);

            return ResponseFormatter::success([
                'service_requests' => $requests,
                'count'            => count($requests),
            ], 'Mechanic service requests retrieved successfully', 200);

        } catch (\Exception $e) {
            return ErrorHandler::handleException($e);
        }
    }

    // =========================================================================
    // POST /api/mechanic/requests/{id}/evidence
    // =========================================================================

    /**
     * El mecánico agrega evidencia fotográfica a una solicitud.
     *
     * Solo el mecánico asignado puede subir evidencias.
     * La evidencia se clasifica como: 'before' | 'during' | 'after'.
     * Se almacena la URL del archivo ya subido a un servicio externo (S3, etc.).
     *
     * Body esperado:
     *   evidence_type     (string) — 'before' | 'during' | 'after'  REQUERIDO
     *   image_url         (string) — URL http/https del archivo       REQUERIDO
     *   original_filename (string) — nombre original del archivo      OPCIONAL
     *   file_size         (int)    — tamaño en bytes (máx 5 MB)       OPCIONAL
     */
    public function addEvidence(Request $request, int $id): Response
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

            $mechanicId = $request->getAttribute('userId');

            // Validar campos mínimos aquí antes de pasar al servicio
            $evidenceType = $request->input('evidence_type');
            $imageUrl     = $request->input('image_url');

            $errors = [];
            if (empty($evidenceType)) {
                $errors['evidence_type'] = 'evidence_type is required (before, during, after)';
            }
            if (empty($imageUrl)) {
                $errors['image_url'] = 'image_url is required';
            }
            if (!empty($errors)) {
                return ResponseFormatter::validationError($errors);
            }

            // Construir datos de evidencia; la validación de negocio la hace el servicio
            $data = [
                'evidence_type' => $evidenceType,
                'image_url'     => $imageUrl,
            ];

            if ($request->input('original_filename') !== null) {
                $data['original_filename'] = RequestValidator::sanitizeString(
                    $request->input('original_filename')
                );
            }
            if ($request->input('file_size') !== null) {
                $data['file_size'] = (int)$request->input('file_size');
            }

            // El servicio valida acceso, estado y extensión de imagen
            $evidence = $this->evidenceService->addEvidence($id, $mechanicId, $data);

            return ResponseFormatter::success(
                ['evidence' => $evidence],
                'Evidence added successfully',
                201
            );

        } catch (\InvalidArgumentException $e) {
            // Errores de validación del servicio de evidencias
            return ResponseFormatter::validationError(['evidence' => $e->getMessage()]);

        } catch (\Exception $e) {
            return ErrorHandler::handleException($e);
        }
    }

    // =========================================================================
    // GET /api/mechanic/requests/{id}/evidences
    // =========================================================================

    /**
     * Lista todas las evidencias fotográficas de una solicitud.
     *
     * Los resultados vienen ordenados por created_at ASC (cronológico).
     */
    public function getEvidences(Request $request, int $id): Response
    {
        try {
            $evidences = $this->evidenceService->getEvidences($id);

            return ResponseFormatter::success([
                'evidences' => $evidences,
                'count'     => count($evidences),
            ], 'Evidences retrieved successfully', 200);

        } catch (\Exception $e) {
            return ErrorHandler::handleException($e);
        }
    }
}
