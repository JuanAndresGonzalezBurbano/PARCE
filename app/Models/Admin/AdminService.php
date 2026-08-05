<?php

namespace App\Models\Admin;

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

    /**
     * Obtiene todos los usuarios con sus roles y vehículos
     *
     * @param array $filters Filtros opcionales: role, status, search
     * @return array Lista de usuarios
     */
    public function getUsers(array $filters = []): array
    {
        $sql = "SELECT u.id, u.email, u.first_name, u.last_name, u.phone,
                       u.account_status, u.created_at, u.last_login_at,
                       GROUP_CONCAT(DISTINCT r.name ORDER BY r.id SEPARATOR ', ') AS roles,
                       GROUP_CONCAT(DISTINCT r.slug ORDER BY r.id SEPARATOR ',') AS role_slugs,
                       COUNT(DISTINCT v.id) AS vehicle_count
                FROM users u
                LEFT JOIN user_roles ur ON ur.user_id = u.id
                LEFT JOIN roles r ON r.id = ur.role_id
                LEFT JOIN vehicles v ON v.user_id = u.id AND v.deleted_at IS NULL
                WHERE u.deleted_at IS NULL";
        
        $params = [];

        // Filtro por rol
        if (!empty($filters['role'])) {
            $sql .= " AND EXISTS (
                SELECT 1 FROM user_roles ur2
                JOIN roles r2 ON r2.id = ur2.role_id
                WHERE ur2.user_id = u.id AND r2.slug = ?
            )";
            $params[] = $filters['role'];
        }

        // Filtro por estado
        if (!empty($filters['status'])) {
            $sql .= ' AND u.account_status = ?';
            $params[] = $filters['status'];
        }

        // Filtro de búsqueda
        if (!empty($filters['search'])) {
            $search = '%' . $filters['search'] . '%';
            $sql .= ' AND (u.email LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ? OR u.phone LIKE ?)';
            $params[] = $search;
            $params[] = $search;
            $params[] = $search;
            $params[] = $search;
        }

        $sql .= ' GROUP BY u.id ORDER BY u.created_at DESC';

        $results = Database::fetchAll($sql, $params);
        
        // Mapear nombres de campos usando snake_case (como espera el frontend)
        return array_map(function($user) {
            return [
                'id' => (int)$user['id'],
                'email' => $user['email'],
                'first_name' => $user['first_name'],
                'last_name' => $user['last_name'],
                'phone' => $user['phone'],
                'account_status' => $user['account_status'],
                'created_at' => $user['created_at'],
                'last_login_at' => $user['last_login_at'],
                'roles' => !empty($user['roles']) ? $user['roles'] : '',
                'role_slugs' => !empty($user['role_slugs']) ? $user['role_slugs'] : '',
                'vehicle_count' => (int)$user['vehicle_count'],
            ];
        }, $results);
    }

    /**
     * Obtiene todos los vehículos con información del propietario
     *
     * @param string|null $search Término de búsqueda opcional
     * @return array Lista de vehículos
     */
    public function getVehicles(?string $search = null): array
    {
        $sql = "SELECT v.id, v.make, v.model, v.license_plate, v.year, v.color,
                       v.vehicle_type, v.soat_number, v.tecnomecanica_number,
                       v.is_primary, v.status, v.created_at,
                       u.id AS user_id, u.first_name, u.last_name, u.email, u.phone
                FROM vehicles v
                JOIN users u ON u.id = v.user_id
                WHERE v.deleted_at IS NULL";
        
        $params = [];

        if (!empty($search)) {
            $search = '%' . $search . '%';
            $sql .= ' AND (v.license_plate LIKE ? OR v.make LIKE ? OR v.model LIKE ? 
                      OR u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ?)';
            $params[] = $search;
            $params[] = $search;
            $params[] = $search;
            $params[] = $search;
            $params[] = $search;
            $params[] = $search;
        }

        $sql .= ' ORDER BY v.created_at DESC';

        return Database::fetchAll($sql, $params);
    }

    /**
     * Actualiza el estado de un usuario
     *
     * @param int $userId ID del usuario
     * @param string $status Nuevo estado (active, inactive, suspended)
     * @return void
     */
    public function updateUserStatus(int $userId, string $status): void
    {
        Database::execute(
            'UPDATE users SET account_status = ?, updated_at = NOW() WHERE id = ?',
            [$status, $userId]
        );
    }
}
