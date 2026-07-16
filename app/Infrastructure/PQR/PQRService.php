<?php

namespace App\Infrastructure\PQR;

use App\Core\Database;
use App\Core\DomainException;

/**
 * Servicio de PQR
 *
 * Lógica de negocio para peticiones, quejas, reclamos y sugerencias:
 * creación por parte del usuario y gestión (filtrar, responder, cambiar estado)
 * por parte del administrador.
 */
class PQRService
{
    /**
     * Crea un nuevo PQR para el usuario autenticado.
     *
     * @param int   $userId ID del usuario que crea el ticket
     * @param array $data   Datos del PQR (type, subject, description)
     * @return int          ID del PQR creado
     */
    public function create(int $userId, array $data): int
    {
        $ticketId = Database::insert('pqr', [
            'user_id'     => $userId,
            'ticket_code' => 'PENDING',
            'type'        => $data['type'],
            'subject'     => $data['subject'],
            'description' => $data['description'],
            'status'      => 'pending',
        ]);

        $ticketCode = PQRValidator::generateTicketCode($ticketId);
        Database::update('pqr', ['ticket_code' => $ticketCode], 'id = ?', [$ticketId]);

        return $ticketId;
    }

    /**
     * Obtiene todos los tickets PQR de un usuario, opcionalmente filtrados por estado.
     *
     * @param int         $userId ID del usuario
     * @param string|null $status Filtro de estado opcional
     * @return array              Lista de tickets PQR
     */
    public function getUserPqrs(int $userId, ?string $status = null): array
    {
        $sql = 'SELECT * FROM pqr WHERE user_id = ? AND deleted_at IS NULL';
        $params = [$userId];

        if ($status !== null) {
            $sql .= ' AND status = ?';
            $params[] = $status;
        }

        $sql .= ' ORDER BY created_at DESC';

        return Database::fetchAll($sql, $params);
    }

    /**
     * Obtiene un ticket PQR perteneciente a un usuario específico.
     *
     * @param int $ticketId ID del PQR
     * @param int $userId   ID del usuario propietario
     * @return array        Ticket PQR
     * @throws DomainException Si el ticket no existe o no pertenece al usuario (404)
     */
    public function getByIdForUser(int $ticketId, int $userId): array
    {
        $ticket = Database::fetchOne(
            'SELECT * FROM pqr WHERE id = ? AND user_id = ? AND deleted_at IS NULL',
            [$ticketId, $userId]
        );

        if ($ticket === null) {
            throw new DomainException('Ticket PQR no encontrado', 404);
        }

        return $ticket;
    }

    /**
     * Obtiene un ticket PQR por ID sin restricción de propietario (uso administrativo).
     *
     * @param int $ticketId ID del PQR
     * @return array        Ticket PQR con datos del usuario que lo creó
     * @throws DomainException Si el ticket no existe (404)
     */
    public function getByIdForAdmin(int $ticketId): array
    {
        $ticket = Database::fetchOne(
            'SELECT p.*,
                    u.first_name AS reporter_first_name,
                    u.last_name AS reporter_last_name,
                    u.email AS reporter_email
             FROM pqr p
             JOIN users u ON u.id = p.user_id
             WHERE p.id = ? AND p.deleted_at IS NULL',
            [$ticketId]
        );

        if ($ticket === null) {
            throw new DomainException('Ticket PQR no encontrado', 404);
        }

        return $ticket;
    }

    /**
     * Obtiene todos los tickets PQR con filtros para el administrador.
     *
     * @param array $filters Filtros opcionales: status, type, q (busca en subject/description)
     * @return array         Lista de tickets PQR con datos del usuario que los creó
     */
    public function adminList(array $filters = []): array
    {
        $sql = 'SELECT p.*,
                       u.first_name AS reporter_first_name,
                       u.last_name AS reporter_last_name,
                       u.email AS reporter_email
                FROM pqr p
                JOIN users u ON u.id = p.user_id
                WHERE p.deleted_at IS NULL';
        $params = [];

        if (!empty($filters['status'])) {
            $sql .= ' AND p.status = ?';
            $params[] = $filters['status'];
        }

        if (!empty($filters['type'])) {
            $sql .= ' AND p.type = ?';
            $params[] = $filters['type'];
        }

        if (!empty($filters['q'])) {
            $sql .= ' AND (p.subject LIKE ? OR p.description LIKE ? OR p.ticket_code LIKE ?)';
            $like = '%' . $filters['q'] . '%';
            $params[] = $like;
            $params[] = $like;
            $params[] = $like;
        }

        $sql .= ' ORDER BY p.created_at DESC';

        return Database::fetchAll($sql, $params);
    }

    /**
     * Actualiza el estado de un ticket PQR.
     *
     * @param int    $ticketId ID del PQR
     * @param string $status   Nuevo estado
     * @return bool            Verdadero si se actualizó correctamente
     */
    public function updateStatus(int $ticketId, string $status): bool
    {
        $affected = Database::update(
            'pqr',
            ['status' => $status],
            'id = ? AND deleted_at IS NULL',
            [$ticketId]
        );

        return $affected > 0;
    }

    /**
     * Registra la respuesta del administrador y marca el ticket como resuelto.
     *
     * @param int    $ticketId      ID del PQR
     * @param int    $adminUserId   ID del administrador que responde
     * @param string $responseText Texto de la respuesta
     * @return bool                Verdadero si se actualizó correctamente
     */
    public function respond(int $ticketId, int $adminUserId, string $responseText): bool
    {
        $affected = Database::update(
            'pqr',
            [
                'admin_response' => $responseText,
                'responded_by'   => $adminUserId,
                'responded_at'   => date('Y-m-d H:i:s'),
                'status'         => 'resolved',
            ],
            'id = ? AND deleted_at IS NULL',
            [$ticketId]
        );

        return $affected > 0;
    }
}
