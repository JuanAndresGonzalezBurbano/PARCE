<?php

use App\Core\Migration;

/**
 * Create PQR Table Migration
 *
 * Creates the pqr table for Peticiones, Quejas, Reclamos y Sugerencias.
 * Additive-only module for the PARCE-DEMO sustentación project.
 */
class CreatePqrTable extends Migration
{
    /**
     * Run the migration
     */
    public function up(): void
    {
        $this->execute("
            CREATE TABLE pqr (
                id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                user_id BIGINT UNSIGNED NOT NULL,
                ticket_code VARCHAR(20) NOT NULL UNIQUE,
                type ENUM('peticion', 'queja', 'reclamo', 'sugerencia') NOT NULL,
                subject VARCHAR(150) NOT NULL,
                description TEXT NOT NULL,
                status ENUM('pending', 'in_review', 'resolved', 'rejected') NOT NULL DEFAULT 'pending',
                admin_response TEXT NULL,
                responded_by BIGINT UNSIGNED NULL,
                responded_at TIMESTAMP NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                deleted_at TIMESTAMP NULL,

                CONSTRAINT fk_pqr_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
                CONSTRAINT fk_pqr_responded_by FOREIGN KEY (responded_by) REFERENCES users(id) ON DELETE SET NULL,

                INDEX idx_pqr_user_id (user_id),
                INDEX idx_pqr_status (status),
                INDEX idx_pqr_type (type),
                INDEX idx_pqr_created_at (created_at),
                INDEX idx_pqr_deleted_at (deleted_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");
    }

    /**
     * Reverse the migration
     */
    public function down(): void
    {
        $this->dropTable('pqr');
    }
}
