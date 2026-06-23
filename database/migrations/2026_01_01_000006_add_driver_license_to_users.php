<?php

use App\Core\Migration;

/**
 * Add Driver License Fields to Users Table Migration
 * 
 * Adds driver license information columns to the users table
 * to support mechanic credential tracking:
 * - driver_license_number: License identifier
 * - driver_license_expiration_date: License validity date
 * - driver_license_document_url: URL to uploaded license document
 * - driver_license_uploaded_at: Timestamp of document upload
 */
class AddDriverLicenseToUsers extends Migration
{
    /**
     * Run the migration
     */
    public function up(): void
    {
        $this->execute("
            ALTER TABLE users
                ADD COLUMN driver_license_number VARCHAR(50) NULL,
                ADD COLUMN driver_license_expiration_date DATE NULL,
                ADD COLUMN driver_license_document_url VARCHAR(500) NULL,
                ADD COLUMN driver_license_uploaded_at TIMESTAMP NULL
        ");
    }

    /**
     * Reverse the migration
     */
    public function down(): void
    {
        $this->execute("
            ALTER TABLE users
                DROP COLUMN driver_license_uploaded_at,
                DROP COLUMN driver_license_document_url,
                DROP COLUMN driver_license_expiration_date,
                DROP COLUMN driver_license_number
        ");
    }
}
