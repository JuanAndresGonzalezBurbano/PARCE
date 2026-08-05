<?php

namespace App\Models\Survey;

use App\Core\Database;
use App\Core\DomainException;

/**
 * Servicio de Encuestas
 *
 * Lógica de negocio para las encuestas de satisfacción posteriores al servicio:
 * creación por parte del cliente y consulta por parte del cliente y del administrador.
 */
class SurveyService
{
    /**
     * Crea una encuesta para una solicitud de servicio completada del cliente.
     *
     * @param int   $customerId ID del cliente autenticado
     * @param array $data       Datos de la encuesta
     * @return int              ID de la encuesta creada
     * @throws DomainException  Si la solicitud de servicio no existe, no pertenece al
     *                          cliente, no está completada, o ya tiene una encuesta
     */
    public function create(int $customerId, array $data): int
    {
        $serviceRequestId = (int)$data['service_request_id'];

        $serviceRequest = Database::fetchOne(
            'SELECT id, customer_id, status FROM service_requests WHERE id = ? AND deleted_at IS NULL',
            [$serviceRequestId]
        );

        if ($serviceRequest === null) {
            throw new DomainException('Solicitud de servicio no encontrada', 404);
        }

        if ((int)$serviceRequest['customer_id'] !== $customerId) {
            throw new DomainException('No eres el propietario de esta solicitud de servicio', 403);
        }

        if ($serviceRequest['status'] !== 'completed') {
            throw new DomainException('Solo se puede encuestar un servicio completado', 400);
        }

        $existing = Database::fetchOne(
            'SELECT id FROM surveys WHERE service_request_id = ?',
            [$serviceRequestId]
        );

        if ($existing !== null) {
            throw new DomainException('Ya existe una encuesta para esta solicitud de servicio', 409);
        }

        return Database::insert('surveys', [
            'service_request_id'   => $serviceRequestId,
            'customer_id'          => $customerId,
            'overall_satisfaction' => (int)$data['overall_satisfaction'],
            'would_recommend'      => !empty($data['would_recommend']) ? 1 : 0,
            'comments'             => $data['comments'] ?? null,
        ]);
    }

    /**
     * Obtiene las encuestas enviadas por el cliente autenticado.
     *
     * @param int $customerId ID del cliente
     * @return array          Lista de encuestas
     */
    public function getByCustomer(int $customerId): array
    {
        return Database::fetchAll(
            'SELECT s.*, sr.service_code, sr.emergency_type
             FROM surveys s
             JOIN service_requests sr ON sr.id = s.service_request_id
             WHERE s.customer_id = ? AND s.deleted_at IS NULL
             ORDER BY s.created_at DESC',
            [$customerId]
        );
    }

    /**
     * Obtiene todas las encuestas para el administrador.
     *
     * @return array Lista de encuestas con datos del cliente y de la solicitud de servicio
     */
    public function adminList(): array
    {
        return Database::fetchAll(
            'SELECT s.*,
                    sr.service_code, sr.emergency_type, sr.mechanic_id,
                    u.first_name AS customer_first_name, u.last_name AS customer_last_name,
                    m.first_name AS mechanic_first_name, m.last_name AS mechanic_last_name
             FROM surveys s
             JOIN service_requests sr ON sr.id = s.service_request_id
             JOIN users u ON u.id = s.customer_id
             LEFT JOIN users m ON m.id = sr.mechanic_id
             WHERE s.deleted_at IS NULL
             ORDER BY s.created_at DESC'
        );
    }
}
