<?php

use App\Core\Database;
use App\Core\Migration;

/**
 * Add Missing Rating Columns to Service Requests Migration
 *
 * This environment's `service_requests` table predates migration
 * 2024_01_01_000004 (it used CREATE TABLE IF NOT EXISTS, which silently
 * no-op'd against the already-existing table), so customer_rating,
 * customer_feedback, punctuality_rating and service_quality_rating were
 * never actually added even though ServiceRequestController already reads
 * and writes them. This migration adds only the columns that are missing.
 */
class AddMissingRatingColumnsToServiceRequests extends Migration
{
    /**
     * Run the migration
     */
    public function up(): void
    {
        if (!$this->columnExists('customer_rating')) {
            $this->execute("ALTER TABLE service_requests ADD COLUMN customer_rating TINYINT UNSIGNED NULL COMMENT 'Customer rating 1-5'");
        }

        if (!$this->columnExists('customer_feedback')) {
            $this->execute("ALTER TABLE service_requests ADD COLUMN customer_feedback TEXT NULL COMMENT 'Customer review'");
        }

        if (!$this->columnExists('punctuality_rating')) {
            $this->execute("ALTER TABLE service_requests ADD COLUMN punctuality_rating TINYINT UNSIGNED NULL COMMENT 'Punctuality rating 1-5'");
        }

        if (!$this->columnExists('service_quality_rating')) {
            $this->execute("ALTER TABLE service_requests ADD COLUMN service_quality_rating TINYINT UNSIGNED NULL COMMENT 'Service quality rating 1-5'");
        }
    }

    /**
     * Reverse the migration
     */
    public function down(): void
    {
        if ($this->columnExists('service_quality_rating')) {
            $this->execute("ALTER TABLE service_requests DROP COLUMN service_quality_rating");
        }

        if ($this->columnExists('punctuality_rating')) {
            $this->execute("ALTER TABLE service_requests DROP COLUMN punctuality_rating");
        }

        if ($this->columnExists('customer_feedback')) {
            $this->execute("ALTER TABLE service_requests DROP COLUMN customer_feedback");
        }

        if ($this->columnExists('customer_rating')) {
            $this->execute("ALTER TABLE service_requests DROP COLUMN customer_rating");
        }
    }

    /**
     * Check if a column exists on service_requests
     */
    private function columnExists(string $column): bool
    {
        $result = Database::fetchOne(
            "SELECT COLUMN_NAME FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'service_requests' AND COLUMN_NAME = ?",
            [$column]
        );

        return $result !== null;
    }
}
