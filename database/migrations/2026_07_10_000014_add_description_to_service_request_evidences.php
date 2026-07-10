<?php

use App\Core\Migration;

/**
 * Add Description Column to Service Request Evidences Migration
 *
 * The mechanic evidence-upload UI already collects an optional description for
 * each photo, but `service_request_evidences` never had a column to store it.
 * Purely additive — nullable, no backfill needed, no existing rows affected.
 */
class AddDescriptionToServiceRequestEvidences extends Migration
{
    /**
     * Run the migration
     */
    public function up(): void
    {
        $this->execute("
            ALTER TABLE service_request_evidences
                ADD COLUMN description VARCHAR(500) NULL AFTER original_filename
        ");

        echo "✓ Added description column to service_request_evidences table\n";
    }

    /**
     * Reverse the migration
     */
    public function down(): void
    {
        $this->execute("ALTER TABLE service_request_evidences DROP COLUMN description");

        echo "✓ Removed description column from service_request_evidences table\n";
    }
}
