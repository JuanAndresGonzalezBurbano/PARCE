<?php

use App\Core\Migration;

/**
 * Create Surveys Table Migration
 *
 * Creates the surveys table for post-service customer satisfaction surveys.
 * Additive-only module for the PARCE-DEMO sustentación project.
 */
class CreateSurveysTable extends Migration
{
    /**
     * Run the migration
     */
    public function up(): void
    {
        $this->execute("
            CREATE TABLE surveys (
                id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                service_request_id BIGINT UNSIGNED NOT NULL UNIQUE,
                customer_id BIGINT UNSIGNED NOT NULL,
                overall_satisfaction TINYINT UNSIGNED NOT NULL,
                would_recommend BOOLEAN NOT NULL,
                comments TEXT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                deleted_at TIMESTAMP NULL,

                CONSTRAINT fk_surveys_service_request_id FOREIGN KEY (service_request_id) REFERENCES service_requests(id) ON DELETE CASCADE,
                CONSTRAINT fk_surveys_customer_id FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE RESTRICT,
                CONSTRAINT chk_overall_satisfaction CHECK (overall_satisfaction BETWEEN 1 AND 5),

                INDEX idx_surveys_customer_id (customer_id),
                INDEX idx_surveys_created_at (created_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");
    }

    /**
     * Reverse the migration
     */
    public function down(): void
    {
        $this->dropTable('surveys');
    }
}
