<?php

namespace App\Infrastructure\Admin;

use App\Core\Database;

/**
 * Servicio de Administración
 *
 * Agregaciones de solo lectura para el panel de administración: resumen del
 * dashboard y listado de todas las calificaciones con filtros. No duplica
 * lógica de negocio existente, solo consulta las tablas ya presentes
 * (service_requests, pqr, surveys, users).
 */
class AdminService
{
    /**
     * Obtiene los contadores de resumen para el dashboard de administración.
     *
     * @return array Contadores de usuarios, solicitudes de servicio, PQR y encuestas
     */
    public function dashboard(): array
    {
        $totalUsers = Database::fetchOne(
            'SELECT COUNT(*) AS total FROM users WHERE deleted_at IS NULL'
        )['total'] ?? 0;

        $requestsByStatus = Database::fetchAll(
            'SELECT status, COUNT(*) AS total
             FROM service_requests
             WHERE deleted_at IS NULL
             GROUP BY status'
        );

        $pendingPqr = Database::fetchOne(
            "SELECT COUNT(*) AS total FROM pqr WHERE status = 'pending' AND deleted_at IS NULL"
        )['total'] ?? 0;

        $totalPqr = Database::fetchOne(
            'SELECT COUNT(*) AS total FROM pqr WHERE deleted_at IS NULL'
        )['total'] ?? 0;

        $totalSurveys = Database::fetchOne(
            'SELECT COUNT(*) AS total FROM surveys WHERE deleted_at IS NULL'
        )['total'] ?? 0;

        $avgRating = Database::fetchOne(
            "SELECT AVG(customer_rating) AS average
             FROM service_requests
             WHERE customer_rating IS NOT NULL AND deleted_at IS NULL"
        )['average'] ?? null;

        return [
            'total_users' => (int)$totalUsers,
            'total_pqr' => (int)$totalPqr,
            'pending_pqr' => (int)$pendingPqr,
            'total_surveys' => (int)$totalSurveys,
            'average_rating' => $avgRating !== null ? round((float)$avgRating, 2) : null,
            'requests_by_status' => array_map(
                fn($row) => ['status' => $row['status'], 'total' => (int)$row['total']],
                $requestsByStatus
            ),
        ];
    }

    /**
     * Obtiene todas las solicitudes de servicio calificadas, con filtros opcionales.
     *
     * @param array $filters Filtros opcionales: mechanicId, customerId, minRating, dateFrom, dateTo
     * @return array         Lista de solicitudes de servicio calificadas
     */
    public function ratings(array $filters = []): array
    {
        $sql = "SELECT sr.id, sr.service_code, sr.emergency_type, sr.status,
                       sr.customer_rating, sr.punctuality_rating, sr.service_quality_rating,
                       sr.customer_feedback, sr.completed_at,
                       sr.customer_id, sr.mechanic_id,
                       c.first_name AS customer_first_name, c.last_name AS customer_last_name,
                       m.first_name AS mechanic_first_name, m.last_name AS mechanic_last_name
                FROM service_requests sr
                JOIN users c ON c.id = sr.customer_id
                LEFT JOIN users m ON m.id = sr.mechanic_id
                WHERE sr.customer_rating IS NOT NULL AND sr.deleted_at IS NULL";
        $params = [];

        if (!empty($filters['mechanicId'])) {
            $sql .= ' AND sr.mechanic_id = ?';
            $params[] = (int)$filters['mechanicId'];
        }

        if (!empty($filters['customerId'])) {
            $sql .= ' AND sr.customer_id = ?';
            $params[] = (int)$filters['customerId'];
        }

        if (!empty($filters['minRating'])) {
            $sql .= ' AND sr.customer_rating >= ?';
            $params[] = (int)$filters['minRating'];
        }

        if (!empty($filters['dateFrom'])) {
            $sql .= ' AND sr.completed_at >= ?';
            $params[] = $filters['dateFrom'] . ' 00:00:00';
        }

        if (!empty($filters['dateTo'])) {
            $sql .= ' AND sr.completed_at <= ?';
            $params[] = $filters['dateTo'] . ' 23:59:59';
        }

        $sql .= ' ORDER BY sr.completed_at DESC';

        return Database::fetchAll($sql, $params);
    }
}
