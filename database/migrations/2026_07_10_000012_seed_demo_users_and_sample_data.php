<?php

use App\Core\Database;
use App\Core\Migration;

/**
 * Seed Demo Users and Sample Data Migration
 *
 * Idempotent seed for the PARCE-DEMO sustentación project: creates one demo
 * user per role (customer, mechanic, administrator) if they don't already
 * exist, plus a sample vehicle, a completed+rated service request, one PQR
 * ticket and one survey so the demo isn't empty on first login.
 *
 * Safe to run multiple times: every insert is guarded by a SELECT check.
 */
class SeedDemoUsersAndSampleData extends Migration
{
    private const DEMO_PASSWORD = 'Demo12345';

    /**
     * Run the migration
     */
    public function up(): void
    {
        $customerId   = $this->ensureUser('cliente.demo@parcedemo.local', 'Cliente', 'Demo', '3001234567', 'customer');
        $mechanicId   = $this->ensureUser('mecanico.demo@parcedemo.local', 'Mecánico', 'Demo', '3007654321', 'mechanic');
        $this->ensureUser('admin.demo@parcedemo.local', 'Administrador', 'Demo', '3009998888', 'administrator');

        $vehicleId = $this->ensureVehicle($customerId);
        $serviceRequestId = $this->ensureServiceRequest($customerId, $mechanicId, $vehicleId);
        $this->ensurePqr($customerId);
        $this->ensureSurvey($serviceRequestId, $customerId);
    }

    /**
     * Reverse the migration
     */
    public function down(): void
    {
        $demoEmails = [
            'cliente.demo@parcedemo.local',
            'mecanico.demo@parcedemo.local',
            'admin.demo@parcedemo.local',
        ];

        foreach ($demoEmails as $email) {
            $user = Database::fetchOne('SELECT id FROM users WHERE email = ?', [$email]);
            if ($user === null) {
                continue;
            }

            $userId = (int)$user['id'];

            Database::query('DELETE FROM surveys WHERE customer_id = ?', [$userId]);
            Database::query('DELETE FROM pqr WHERE user_id = ?', [$userId]);
            Database::query('DELETE FROM service_requests WHERE customer_id = ? OR mechanic_id = ?', [$userId, $userId]);
            Database::query('DELETE FROM vehicles WHERE user_id = ?', [$userId]);
            Database::query('DELETE FROM user_roles WHERE user_id = ?', [$userId]);
            Database::query('DELETE FROM users WHERE id = ?', [$userId]);
        }
    }

    /**
     * Create the demo user and assign its role if it doesn't already exist.
     */
    private function ensureUser(string $email, string $firstName, string $lastName, string $phone, string $roleSlug): int
    {
        $existing = Database::fetchOne('SELECT id FROM users WHERE email = ?', [$email]);

        if ($existing !== null) {
            return (int)$existing['id'];
        }

        $userId = Database::insert('users', [
            'email' => $email,
            'password_hash' => password_hash(self::DEMO_PASSWORD, PASSWORD_ARGON2ID),
            'first_name' => $firstName,
            'last_name' => $lastName,
            'phone' => $phone,
            'account_status' => 'active',
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s'),
        ]);

        $role = Database::fetchOne('SELECT id FROM roles WHERE slug = ? AND is_active = TRUE', [$roleSlug]);

        if ($role === null) {
            throw new \Exception("Role not found: {$roleSlug}");
        }

        Database::insert('user_roles', [
            'user_id' => $userId,
            'role_id' => $role['id'],
            'assigned_at' => date('Y-m-d H:i:s'),
            'is_active' => 1,
        ]);

        return $userId;
    }

    /**
     * Create a sample vehicle for the demo customer if it doesn't already exist.
     */
    private function ensureVehicle(int $customerId): int
    {
        $existing = Database::fetchOne('SELECT id FROM vehicles WHERE license_plate = ?', ['DEM001']);

        if ($existing !== null) {
            return (int)$existing['id'];
        }

        return Database::insert('vehicles', [
            'user_id' => $customerId,
            'license_plate' => 'DEM001',
            'make' => 'Chevrolet',
            'model' => 'Spark GT',
            'year' => 2020,
            'color' => 'Blanco',
            'vehicle_type' => 'sedan',
            'fuel_type' => 'gasoline',
            'nickname' => 'Vehículo Demo',
            'is_primary' => 1,
            'status' => 'active',
        ]);
    }

    /**
     * Create a completed, fully-rated service request tying the demo customer
     * and mechanic together, if one doesn't already exist.
     */
    private function ensureServiceRequest(int $customerId, int $mechanicId, int $vehicleId): int
    {
        $existing = Database::fetchOne(
            'SELECT id FROM service_requests WHERE customer_id = ? AND mechanic_id = ? AND deleted_at IS NULL',
            [$customerId, $mechanicId]
        );

        if ($existing !== null) {
            return (int)$existing['id'];
        }

        $now = date('Y-m-d H:i:s');

        $requestId = Database::insert('service_requests', [
            'customer_id' => $customerId,
            'vehicle_id' => $vehicleId,
            'mechanic_id' => $mechanicId,
            'resolved_by' => $mechanicId,
            'emergency_type' => 'battery',
            'description' => 'Batería descargada en zona norte de Bogotá (dato de demostración).',
            'priority' => 'normal',
            'latitude' => 4.7110,
            'longitude' => -74.0721,
            'status' => 'completed',
            'requested_at' => $now,
            'assigned_at' => $now,
            'started_at' => $now,
            'completed_at' => $now,
            'estimated_cost' => 80000.00,
            'final_cost' => 75000.00,
            'customer_rating' => 5,
            'customer_feedback' => 'Excelente atención, muy puntual y profesional (dato de demostración).',
            'punctuality_rating' => 5,
            'service_quality_rating' => 5,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $year = date('Y');
        $serviceCode = 'SR-' . $year . '-' . str_pad((string)$requestId, 6, '0', STR_PAD_LEFT);
        Database::update('service_requests', ['service_code' => $serviceCode], 'id = ?', [$requestId]);

        return $requestId;
    }

    /**
     * Create a sample PQR ticket for the demo customer if one doesn't already exist.
     */
    private function ensurePqr(int $customerId): void
    {
        $existing = Database::fetchOne('SELECT id FROM pqr WHERE user_id = ?', [$customerId]);

        if ($existing !== null) {
            return;
        }

        $requestId = Database::insert('pqr', [
            'user_id' => $customerId,
            'ticket_code' => 'PQR-PENDING',
            'type' => 'peticion',
            'subject' => 'Solicitud de factura del servicio',
            'description' => 'Quisiera recibir la factura electrónica de mi último servicio (dato de demostración).',
            'status' => 'pending',
        ]);

        $year = date('Y');
        $ticketCode = 'PQR-' . $year . '-' . str_pad((string)$requestId, 6, '0', STR_PAD_LEFT);
        Database::update('pqr', ['ticket_code' => $ticketCode], 'id = ?', [$requestId]);
    }

    /**
     * Create a sample survey for the seeded service request if one doesn't already exist.
     */
    private function ensureSurvey(int $serviceRequestId, int $customerId): void
    {
        $existing = Database::fetchOne('SELECT id FROM surveys WHERE service_request_id = ?', [$serviceRequestId]);

        if ($existing !== null) {
            return;
        }

        Database::insert('surveys', [
            'service_request_id' => $serviceRequestId,
            'customer_id' => $customerId,
            'overall_satisfaction' => 5,
            'would_recommend' => 1,
            'comments' => 'Muy buena experiencia con el mecánico asignado (dato de demostración).',
        ]);
    }
}
