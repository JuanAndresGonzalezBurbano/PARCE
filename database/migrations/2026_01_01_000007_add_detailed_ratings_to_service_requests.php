<?php

use App\Core\Migration;

/**
 * Add Detailed Ratings to Service Requests Migration
 *
 * Adds granular rating columns to the service_requests table so customers
 * can rate punctuality and service quality independently from the existing
 * overall customer_rating field.
 *
 * Business Rules:
 * - Both new rating columns are optional (NULL allowed)
 * - Valid rating range is 1–5 (enforced via CHECK constraints)
 * - Existing customer_rating and customer_feedback columns are untouched
 */
class AddDetailedRatingsToServiceRequests extends Migration
{
    /**
     * Run the migration
     */
    public function up(): void
    {
        $this->execute("ALTER TABLE service_requests ADD COLUMN punctuality_rating TINYINT UNSIGNED NULL COMMENT 'Punctuality rating 1-5'");

        $this->execute("ALTER TABLE service_requests ADD COLUMN service_quality_rating TINYINT UNSIGNED NULL COMMENT 'Service quality rating 1-5'");

        $this->execute("ALTER TABLE service_requests ADD CONSTRAINT chk_punctuality_rating CHECK (punctuality_rating IS NULL OR (punctuality_rating >= 1 AND punctuality_rating <= 5))");

        $this->execute("ALTER TABLE service_requests ADD CONSTRAINT chk_service_quality_rating CHECK (service_quality_rating IS NULL OR (service_quality_rating >= 1 AND service_quality_rating <= 5))");

        echo "✓ Added punctuality_rating and service_quality_rating columns to service_requests table\n";
    }

    /**
     * Reverse the migration
     */
    public function down(): void
    {
        $this->execute("ALTER TABLE service_requests DROP CHECK chk_punctuality_rating");

        $this->execute("ALTER TABLE service_requests DROP CHECK chk_service_quality_rating");

        $this->execute("ALTER TABLE service_requests DROP COLUMN punctuality_rating");

        $this->execute("ALTER TABLE service_requests DROP COLUMN service_quality_rating");

        echo "✓ Removed punctuality_rating and service_quality_rating columns from service_requests table\n";
    }
}
