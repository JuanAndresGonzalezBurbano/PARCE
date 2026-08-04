<?php

use App\Core\Migration;

/**
 * Create Service Request Evidences Table Migration
 *
 * Creates the service_request_evidences table for storing photographic
 * evidence (before, during, after) associated with service requests.
 */
class CreateServiceRequestEvidencesTable extends Migration
{
    /**
     * Run the migration
     */
    public function up(): void
    {
        $this->execute("
            CREATE TABLE service_request_evidences (
                id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                service_request_id BIGINT UNSIGNED NOT NULL,
                uploaded_by BIGINT UNSIGNED NOT NULL,
                evidence_type ENUM('before', 'during', 'after') NOT NULL,
                image_url VARCHAR(500) NOT NULL,
                original_filename VARCHAR(255) NULL,
                file_size INT UNSIGNED NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                INDEX idx_service_request_id (service_request_id),

                CONSTRAINT fk_evidence_service_request FOREIGN KEY (service_request_id) REFERENCES service_requests(id) ON DELETE CASCADE,
                CONSTRAINT fk_evidence_user FOREIGN KEY (uploaded_by) REFERENCES users(id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");
    }

    /**
     * Reverse the migration
     */
    public function down(): void
    {
        $this->dropTable('service_request_evidences');
    }
}
