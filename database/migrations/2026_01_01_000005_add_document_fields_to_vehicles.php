<?php

use App\Core\Migration;

/**
 * Add Document Fields to Vehicles Table Migration
 * 
 * Adds SOAT and Tecnomecánica document fields to the vehicles table,
 * supporting document number, expiration date, storage URL, and upload timestamp.
 */
class AddDocumentFieldsToVehicles extends Migration
{
    /**
     * Run the migration
     */
    public function up(): void
    {
        $this->execute("
            ALTER TABLE vehicles
                ADD COLUMN soat_number VARCHAR(50) NULL COMMENT 'SOAT policy number',
                ADD COLUMN soat_expiration_date DATE NULL COMMENT 'SOAT expiration date',
                ADD COLUMN soat_document_url VARCHAR(500) NULL COMMENT 'URL to uploaded SOAT document',
                ADD COLUMN soat_uploaded_at TIMESTAMP NULL COMMENT 'When the SOAT document was uploaded',
                ADD COLUMN tecnomecanica_number VARCHAR(50) NULL COMMENT 'Tecnomecánica certificate number',
                ADD COLUMN tecnomecanica_expiration_date DATE NULL COMMENT 'Tecnomecánica expiration date',
                ADD COLUMN tecnomecanica_document_url VARCHAR(500) NULL COMMENT 'URL to uploaded Tecnomecánica document',
                ADD COLUMN tecnomecanica_uploaded_at TIMESTAMP NULL COMMENT 'When the Tecnomecánica document was uploaded'
        ");

        echo "✓ Added document fields to vehicles table\n";
    }

    /**
     * Reverse the migration
     */
    public function down(): void
    {
        $this->execute("
            ALTER TABLE vehicles
                DROP COLUMN tecnomecanica_uploaded_at,
                DROP COLUMN tecnomecanica_document_url,
                DROP COLUMN tecnomecanica_expiration_date,
                DROP COLUMN tecnomecanica_number,
                DROP COLUMN soat_uploaded_at,
                DROP COLUMN soat_document_url,
                DROP COLUMN soat_expiration_date,
                DROP COLUMN soat_number
        ");

        echo "✓ Removed document fields from vehicles table\n";
    }
}
