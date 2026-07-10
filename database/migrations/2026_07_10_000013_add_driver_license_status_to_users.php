<?php

use App\Core\Migration;

/**
 * Add Driver License Status Column to Users Migration
 *
 * `AuthController::me()` and `AuthController::profile()` have always read/written
 * a `driver_license_status` column on `users`, but the original driver-license
 * migration (2026_01_01_000006) never created it — every call to `GET /api/auth/me`
 * for a user with a driver license on file (or a fresh login re-check) throws
 * `DatabaseException: Unknown column 'driver_license_status'`. This adds the
 * missing column and backfills it for any existing rows so behavior matches what
 * the application code already assumes.
 *
 * Values mirror App\Controllers\Auth\AuthController::profile()'s calculation:
 * 'not_set' | 'valid' | 'expiring_soon' (<=30 days) | 'expired'.
 */
class AddDriverLicenseStatusToUsers extends Migration
{
    /**
     * Run the migration
     */
    public function up(): void
    {
        $this->execute("
            ALTER TABLE users
                ADD COLUMN driver_license_status
                    ENUM('not_set', 'valid', 'expiring_soon', 'expired')
                    NOT NULL DEFAULT 'not_set'
                    AFTER driver_license_document_url
        ");

        // Backfill status for any users who already have a license expiration date on file
        $this->execute("
            UPDATE users
            SET driver_license_status = CASE
                WHEN driver_license_expiration_date IS NULL THEN 'not_set'
                WHEN driver_license_expiration_date < CURDATE() THEN 'expired'
                WHEN driver_license_expiration_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 'expiring_soon'
                ELSE 'valid'
            END
            WHERE driver_license_number IS NOT NULL OR driver_license_expiration_date IS NOT NULL
        ");

        echo "✓ Added driver_license_status column to users table and backfilled existing rows\n";
    }

    /**
     * Reverse the migration
     */
    public function down(): void
    {
        $this->execute("ALTER TABLE users DROP COLUMN driver_license_status");

        echo "✓ Removed driver_license_status column from users table\n";
    }
}
