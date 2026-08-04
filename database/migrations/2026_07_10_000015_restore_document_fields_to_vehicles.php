<?php

use App\Core\Migration;

/**
 * Restore Document Fields to Vehicles Migration
 *
 * Live-database investigation found that `vehicles.soat_expiration_date` and
 * `vehicles.tecnomecanica_expiration_date` (plus their sibling number/url/uploaded_at
 * columns, originally added by 2026_01_01_000005_add_document_fields_to_vehicles)
 * no longer exist on the live table, even though `VehicleController::formatVehicle()`,
 * `::store()` and `::update()` still read/write them directly — meaning any attempt to
 * set a vehicle's SOAT or Tecnomecánica expiration date currently throws
 * `DatabaseException: Unknown column 'soat_expiration_date'` (HTTP 500).
 *
 * The columns were evidently dropped by an undocumented migration (recorded in the
 * `migrations` table as batch 9, `2026_01_01_000009_add_technical_fields_to_vehicles`,
 * whose file is missing from disk) that added other technical fields
 * (engine_displacement_cc, transmission_type, engine_number, chassis_number, mileage,
 * condition_status, notes — all still present) while apparently also removing the
 * document columns, perhaps in favor of the newer `vehicle_documents` table. That table
 * is not wired into any controller yet, so restoring the flat columns is the safe,
 * immediate fix — a proper migration to `vehicle_documents` is a larger, separate
 * decision (see BACKLOG.md).
 *
 * Purely additive: nullable columns, no data loss, no changes to existing rows.
 */
class RestoreDocumentFieldsToVehicles extends Migration
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

        echo "✓ Restored SOAT/Tecnomecánica document fields on vehicles table\n";
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

        echo "✓ Removed SOAT/Tecnomecánica document fields from vehicles table\n";
    }
}
