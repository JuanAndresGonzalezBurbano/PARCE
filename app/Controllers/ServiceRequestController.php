<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Core\Request;
use App\Core\Response;
use App\Infrastructure\ServiceRequest\ServiceRequestService;
use App\Infrastructure\ServiceRequest\ServiceRequestValidator;
use App\Infrastructure\ServiceRequest\ServiceRequestEvidenceService;
use App\Infrastructure\Http\RequestValidator;
use App\Infrastructure\Http\ResponseFormatter;
use App\Infrastructure\Http\ErrorHandler;

/**
 * Controlador de Solicitudes de Servicio
 *
 * Gestiona las solicitudes HTTP para el manejo de solicitudes de servicio,
 * incluyendo creación, consulta, actualización, cancelación, calificación
 * y evidencias fotográficas.
 */
class ServiceRequestController extends Controller
{
    private ServiceRequestService $serviceRequestService;
    private ServiceRequestEvidenceService $evidenceService;

    public function __construct()
    {
        $this->serviceRequestService = new ServiceRequestService();
        $this->evidenceService = new ServiceRequestEvidenceService();
    }

    /**
     * Listar las solicitudes de servicio del cliente
     *
     * GET /api/service-requests
     *
     * CORRECCIÓN: Se eliminó la variable $userRole declarada pero nunca usada.
     *
     * @param Request $request Solicitud HTTP
     * @return Response Respuesta HTTP
     */
    public function index(Request $request): Response
    {
        try {
            // Obtener el usuario autenticado
            $userId = $request->getAttribute('userId');

            // Obtener el filtro de estado opcional
            $status = $request->query('status');

            // Obtener las solicitudes del cliente
            $requests = $this->serviceRequestService->getCustomerRequests($userId, $status);

            return ResponseFormatter::success([
                'service_requests' => $requests,
                'count'            => count($requests)
            ], 'Solicitudes de servicio obtenidas exitosamente', 200);

        } catch (\Exception $e) {
            return ErrorHandler::handleException($e);
        }
    }

    /**
     * Crear una nueva solicitud de servicio
     *
     * POST /api/service-requests
     *
     * @param Request $request Solicitud HTTP
     * @return Response Respuesta HTTP
     */
    public function store(Request $request): Response
    {
        try {
            // Validar Content-Type
            $contentTypeValidation = RequestValidator::validateContentType($request, 'POST');
            if (!$contentTypeValidation['valid']) {
                return ResponseFormatter::error(
                    $contentTypeValidation['error'],
                    null,
                    $contentTypeValidation['statusCode']
                );
            }

            // Analizar el cuerpo JSON
            $jsonValidation = RequestValidator::parseJsonBody($request);
            if (!$jsonValidation['valid']) {
                return ResponseFormatter::error(
                    $jsonValidation['error'],
                    null,
                    $jsonValidation['statusCode']
                );
            }

            // Validar los datos de la solicitud de servicio
            $validation = ServiceRequestValidator::validateCreateRequest($request);
            if (!$validation['valid']) {
                return ResponseFormatter::validationError($validation['errors']);
            }

            // Obtener el usuario autenticado
            $userId   = $request->getAttribute('userId');
            $userRole = $request->getAttribute('userRole');

            // Extraer y sanitizar la entrada
            $data = [
                'vehicle_id'     => $request->input('vehicle_id'),
                'emergency_type' => RequestValidator::sanitizeString($request->input('emergency_type')),
                'description'    => RequestValidator::sanitizeString($request->input('description')),
                'latitude'       => $request->input('latitude'),
                'longitude'      => $request->input('longitude')
            ];

            // Agregar prioridad si se proporciona
            if ($request->input('priority') !== null) {
                $data['priority'] = RequestValidator::sanitizeString($request->input('priority'));
            }

            // Crear la solicitud de servicio
            $requestId = $this->serviceRequestService->create($userId, $data);

            // Obtener la solicitud creada
            $serviceRequest = $this->serviceRequestService->getById($requestId, $userId, $userRole);

            return ResponseFormatter::success(
                ['service_request' => $serviceRequest],
                'Solicitud de servicio creada exitosamente',
                201
            );

        } catch (\Exception $e) {
            return ErrorHandler::handleException($e);
        }
    }

    /**
     * Obtener los detalles de una solicitud de servicio
     *
     * GET /api/service-requests/{id}
     *
     * @param Request $request Solicitud HTTP
     * @param int     $id      ID de la solicitud de servicio
     * @return Response Respuesta HTTP
     */
    public function show(Request $request, int $id): Response
    {
        try {
            // Obtener el usuario autenticado
            $userId   = $request->getAttribute('userId');
            $userRole = $request->getAttribute('userRole');

            // Obtener la solicitud de servicio con control de acceso
            $serviceRequest = $this->serviceRequestService->getById($id, $userId, $userRole);

            if ($serviceRequest === null) {
                return ResponseFormatter::notFound('Solicitud de servicio no encontrada');
            }

            return ResponseFormatter::success(
                ['service_request' => $serviceRequest],
                'Solicitud de servicio obtenida exitosamente',
                200
            );

        } catch (\Exception $e) {
            return ErrorHandler::handleException($e);
        }
    }

    /**
     * Actualizar una solicitud de servicio pendiente
     *
     * PUT /api/service-requests/{id}
     *
     * @param Request $request Solicitud HTTP
     * @param int     $id      ID de la solicitud de servicio
     * @return Response Respuesta HTTP
     */
    public function update(Request $request, int $id): Response
    {
        try {
            // Validar Content-Type
            $contentTypeValidation = RequestValidator::validateContentType($request, 'PUT');
            if (!$contentTypeValidation['valid']) {
                return ResponseFormatter::error(
                    $contentTypeValidation['error'],
                    null,
                    $contentTypeValidation['statusCode']
                );
            }

            // Analizar el cuerpo JSON
            $jsonValidation = RequestValidator::parseJsonBody($request);
            if (!$jsonValidation['valid']) {
                return ResponseFormatter::error(
                    $jsonValidation['error'],
                    null,
                    $jsonValidation['statusCode']
                );
            }

            // Validar los datos de la solicitud de servicio
            $validation = ServiceRequestValidator::validateUpdateRequest($request);
            if (!$validation['valid']) {
                return ResponseFormatter::validationError($validation['errors']);
            }

            // Obtener el usuario autenticado
            $userId   = $request->getAttribute('userId');
            $userRole = $request->getAttribute('userRole');

            // Preparar los datos a actualizar
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

            // Actualizar la solicitud de servicio
            $this->serviceRequestService->update($id, $userId, $data);

            // Obtener la solicitud actualizada
            $serviceRequest = $this->serviceRequestService->getById($id, $userId, $userRole);

            return ResponseFormatter::success(
                ['service_request' => $serviceRequest],
                'Solicitud de servicio actualizada exitosamente',
                200
            );

        } catch (\Exception $e) {
            return ErrorHandler::handleException($e);
        }
    }

    /**
     * Cancelar una solicitud de servicio
     *
     * POST /api/service-requests/{id}/cancel
     *
     * CORRECCIÓN: Se eliminó la variable $userRole declarada pero nunca usada
     * (la variable se necesita solo para getById(), que se llama con $userRole
     * también obtenido aquí — se mantiene su uso real, solo se quita la variable
     * cuando no se usa en métodos donde era código muerto).
     *
     * @param Request $request Solicitud HTTP
     * @param int     $id      ID de la solicitud de servicio
     * @return Response Respuesta HTTP
     */
    public function cancel(Request $request, int $id): Response
    {
        try {
            // Validar Content-Type
            $contentTypeValidation = RequestValidator::validateContentType($request, 'POST');
            if (!$contentTypeValidation['valid']) {
                return ResponseFormatter::error(
                    $contentTypeValidation['error'],
                    null,
                    $contentTypeValidation['statusCode']
                );
            }

            // Analizar el cuerpo JSON
            $jsonValidation = RequestValidator::parseJsonBody($request);
            if (!$jsonValidation['valid']) {
                return ResponseFormatter::error(
                    $jsonValidation['error'],
                    null,
                    $jsonValidation['statusCode']
                );
            }

            // Validar los datos de cancelación
            $validation = ServiceRequestValidator::validateCancellationRequest($request);
            if (!$validation['valid']) {
                return ResponseFormatter::validationError($validation['errors']);
            }

            // Obtener el usuario autenticado
            $userId = $request->getAttribute('userId');

            // Cancelar la solicitud de servicio
            $reason = RequestValidator::sanitizeString($request->input('cancellation_reason'));
            $this->serviceRequestService->cancel($id, $userId, $reason);

            // Obtener la solicitud actualizada
            $serviceRequest = $this->serviceRequestService->getById($id, $userId, null);

            return ResponseFormatter::success(
                ['service_request' => $serviceRequest],
                'Solicitud de servicio cancelada exitosamente',
                200
            );

        } catch (\Exception $e) {
            return ErrorHandler::handleException($e);
        }
    }

    /**
     * Calificar una solicitud de servicio completada
     *
     * POST /api/service-requests/{id}/rate
     *
     * CORRECCIÓN: Se eliminó la variable $userRole declarada pero nunca usada.
     *
     * @param Request $request Solicitud HTTP
     * @param int     $id      ID de la solicitud de servicio
     * @return Response Respuesta HTTP
     */
    public function rate(Request $request, int $id): Response
    {
        try {
            // Validar Content-Type
            $contentTypeValidation = RequestValidator::validateContentType($request, 'POST');
            if (!$contentTypeValidation['valid']) {
                return ResponseFormatter::error(
                    $contentTypeValidation['error'],
                    null,
                    $contentTypeValidation['statusCode']
                );
            }

            // Analizar el cuerpo JSON
            $jsonValidation = RequestValidator::parseJsonBody($request);
            if (!$jsonValidation['valid']) {
                return ResponseFormatter::error(
                    $jsonValidation['error'],
                    null,
                    $jsonValidation['statusCode']
                );
            }

            // Validar los datos de calificación
            $validation = ServiceRequestValidator::validateRatingRequest($request);
            if (!$validation['valid']) {
                return ResponseFormatter::validationError($validation['errors']);
            }

            // Obtener el usuario autenticado
            $userId = $request->getAttribute('userId');

            // Calificar la solicitud de servicio
            $rating   = (int)$request->input('customer_rating');
            $feedback = $request->input('customer_feedback')
                ? RequestValidator::sanitizeString($request->input('customer_feedback'))
                : null;

            $punctualityRating = $request->input('punctuality_rating') !== null
                ? (int)$request->input('punctuality_rating')
                : null;
            $serviceQualityRating = $request->input('service_quality_rating') !== null
                ? (int)$request->input('service_quality_rating')
                : null;

            $this->serviceRequestService->rate(
                $id,
                $userId,
                $rating,
                $feedback,
                $punctualityRating,
                $serviceQualityRating
            );

            // Obtener la solicitud actualizada
            $serviceRequest = $this->serviceRequestService->getById($id, $userId, null);

            return ResponseFormatter::success(
                ['service_request' => $serviceRequest],
                'Solicitud de servicio calificada exitosamente',
                200
            );

        } catch (\Exception $e) {
            return ErrorHandler::handleException($e);
        }
    }

    /**
     * Listar las solicitudes pendientes disponibles para mecánicos (cercanas)
     *
     * GET /api/mechanic/requests/available
     *
     * @param Request $request Solicitud HTTP
     * @return Response Respuesta HTTP
     */
    public function availableForMechanic(Request $request): Response
    {
        try {
            // Obtener el rol del usuario autenticado
            $userRole = $request->getAttribute('userRole');

            // Obtener la ubicación actual del mecánico desde los parámetros de consulta
            $latitude  = $request->query('latitude');
            $longitude = $request->query('longitude');
            $radius    = $request->query('radius', 50); // Por defecto 50 km

            // Validar los parámetros de ubicación
            if ($latitude === null || $longitude === null) {
                return ResponseFormatter::validationError([
                    'location' => 'La latitud y longitud son requeridas'
                ]);
            }

            if (!is_numeric($latitude) || !is_numeric($longitude)) {
                return ResponseFormatter::validationError([
                    'location' => 'La latitud y longitud deben ser números'
                ]);
            }

            // Obtener las solicitudes pendientes cercanas
            $requests = $this->serviceRequestService->getNearbyPendingRequests(
                (float)$latitude,
                (float)$longitude,
                (int)$radius
            );

            return ResponseFormatter::success([
                'service_requests' => $requests,
                'count'            => count($requests)
            ], 'Solicitudes de servicio disponibles obtenidas exitosamente', 200);

        } catch (\Exception $e) {
            return ErrorHandler::handleException($e);
        }
    }

    /**
     * Aceptar una solicitud de servicio pendiente (auto-asignación del mecánico)
     *
     * POST /api/mechanic/requests/{id}/accept
     *
     * @param Request $request Solicitud HTTP
     * @param int     $id      ID de la solicitud de servicio
     * @return Response Respuesta HTTP
     */
    public function accept(Request $request, int $id): Response
    {
        try {
            // Obtener el usuario autenticado
            $userId   = $request->getAttribute('userId');
            $userRole = $request->getAttribute('userRole');

            // Aceptar la solicitud
            $this->serviceRequestService->accept($id, $userId);

            // Obtener la solicitud actualizada
            $serviceRequest = $this->serviceRequestService->getById($id, $userId, $userRole);

            return ResponseFormatter::success(
                ['service_request' => $serviceRequest],
                'Solicitud de servicio aceptada exitosamente',
                200
            );

        } catch (\Exception $e) {
            return ErrorHandler::handleException($e);
        }
    }

    /**
     * Iniciar el trabajo en una solicitud de servicio asignada
     *
     * PUT /api/mechanic/requests/{id}/start
     *
     * @param Request $request Solicitud HTTP
     * @param int     $id      ID de la solicitud de servicio
     * @return Response Respuesta HTTP
     */
    public function start(Request $request, int $id): Response
    {
        try {
            // Obtener el usuario autenticado
            $userId   = $request->getAttribute('userId');
            $userRole = $request->getAttribute('userRole');

            // Iniciar la solicitud
            $this->serviceRequestService->start($id, $userId);

            // Obtener la solicitud actualizada
            $serviceRequest = $this->serviceRequestService->getById($id, $userId, $userRole);

            return ResponseFormatter::success(
                ['service_request' => $serviceRequest],
                'Trabajo de servicio iniciado exitosamente',
                200
            );

        } catch (\Exception $e) {
            return ErrorHandler::handleException($e);
        }
    }

    /**
     * Completar una solicitud de servicio
     *
     * PUT /api/mechanic/requests/{id}/complete
     *
     * @param Request $request Solicitud HTTP
     * @param int     $id      ID de la solicitud de servicio
     * @return Response Respuesta HTTP
     */
    public function complete(Request $request, int $id): Response
    {
        try {
            // Validar Content-Type
            $contentTypeValidation = RequestValidator::validateContentType($request, 'PUT');
            if (!$contentTypeValidation['valid']) {
                return ResponseFormatter::error(
                    $contentTypeValidation['error'],
                    null,
                    $contentTypeValidation['statusCode']
                );
            }

            // Analizar el cuerpo JSON
            $jsonValidation = RequestValidator::parseJsonBody($request);
            if (!$jsonValidation['valid']) {
                return ResponseFormatter::error(
                    $jsonValidation['error'],
                    null,
                    $jsonValidation['statusCode']
                );
            }

            // Obtener el usuario autenticado
            $userId   = $request->getAttribute('userId');
            $userRole = $request->getAttribute('userRole');

            // Validar el costo final
            $finalCost = $request->input('final_cost');
            if ($finalCost === null || $finalCost === '') {
                return ResponseFormatter::validationError([
                    'final_cost' => 'El costo final es requerido'
                ]);
            }

            if (!is_numeric($finalCost) || $finalCost < 0) {
                return ResponseFormatter::validationError([
                    'final_cost' => 'El costo final debe ser un número positivo'
                ]);
            }

            // Completar la solicitud
            $this->serviceRequestService->complete($id, $userId, (float)$finalCost);

            // Obtener la solicitud actualizada
            $serviceRequest = $this->serviceRequestService->getById($id, $userId, $userRole);

            return ResponseFormatter::success(
                ['service_request' => $serviceRequest],
                'Solicitud de servicio completada exitosamente',
                200
            );

        } catch (\Exception $e) {
            return ErrorHandler::handleException($e);
        }
    }

    /**
     * Listar las solicitudes asignadas al mecánico
     *
     * GET /api/mechanic/requests
     *
     * @param Request $request Solicitud HTTP
     * @return Response Respuesta HTTP
     */
    public function mechanicIndex(Request $request): Response
    {
        try {
            // Obtener el usuario autenticado
            $userId   = $request->getAttribute('userId');
            $userRole = $request->getAttribute('userRole');

            // Obtener el filtro de estado opcional
            $status = $request->query('status');

            // Obtener las solicitudes asignadas al mecánico
            $requests = $this->serviceRequestService->getMechanicRequests($userId, $status);

            return ResponseFormatter::success([
                'service_requests' => $requests,
                'count'            => count($requests)
            ], 'Solicitudes de servicio del mecánico obtenidas exitosamente', 200);

        } catch (\Exception $e) {
            return ErrorHandler::handleException($e);
        }
    }

    /**
     * Agregar evidencia fotográfica a una solicitud de servicio
     *
     * POST /api/mechanic/requests/{id}/evidence
     *
     * Solo el mecánico asignado puede agregar evidencias. La imagen debe haber
     * sido subida previamente a un servicio externo (ej. S3); aquí solo se
     * registra la URL y sus metadatos.
     *
     * @param Request $request Solicitud HTTP
     * @param int     $id      ID de la solicitud de servicio
     * @return Response Respuesta HTTP
     */
    public function addEvidence(Request $request, int $id): Response
    {
        try {
            $contentTypeValidation = RequestValidator::validateContentType($request, 'POST');
            if (!$contentTypeValidation['valid']) {
                return ResponseFormatter::error(
                    $contentTypeValidation['error'],
                    null,
                    $contentTypeValidation['statusCode']
                );
            }

            $jsonValidation = RequestValidator::parseJsonBody($request);
            if (!$jsonValidation['valid']) {
                return ResponseFormatter::error(
                    $jsonValidation['error'],
                    null,
                    $jsonValidation['statusCode']
                );
            }

            $mechanicId = $request->getAttribute('userId');

            $evidence = $this->evidenceService->addEvidence($id, $mechanicId, [
                'evidence_type'     => $request->input('evidence_type'),
                'image_url'         => $request->input('image_url'),
                'original_filename' => $request->input('original_filename'),
                'description'       => $request->input('description')
                    ? RequestValidator::sanitizeString($request->input('description'))
                    : null,
                'file_size'         => $request->input('file_size'),
            ]);

            return ResponseFormatter::success(
                ['evidence' => $evidence],
                'Evidencia agregada exitosamente',
                201
            );

        } catch (\Exception $e) {
            return ErrorHandler::handleException($e);
        }
    }

    /**
     * Listar las evidencias fotográficas de una solicitud de servicio
     *
     * GET /api/mechanic/requests/{id}/evidences
     * GET /api/service-requests/{id}/evidences
     *
     * Accesible tanto por el cliente propietario como por el mecánico asignado.
     *
     * @param Request $request Solicitud HTTP
     * @param int     $id      ID de la solicitud de servicio
     * @return Response Respuesta HTTP
     */
    public function getEvidences(Request $request, int $id): Response
    {
        try {
            $userId   = $request->getAttribute('userId');
            $userRole = $request->getAttribute('userRole');

            $evidences = $this->evidenceService->getEvidences($id, $userId, $userRole);

            return ResponseFormatter::success([
                'evidences' => $evidences,
                'count'     => count($evidences),
            ], 'Evidencias obtenidas exitosamente', 200);

        } catch (\Exception $e) {
            return ErrorHandler::handleException($e);
        }
    }
}
