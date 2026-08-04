<?php

use App\Core\Migration;

/**
 * Drop Unique Constraint from Vehicle Plate/VIN Migration
 *
 * `vehicles.license_plate` and `vehicles.vin` both had a hard UNIQUE constraint
 * at the column level, enforced regardless of `deleted_at`. Combined with soft
 * deletes, this meant a customer who deleted a vehicle could never register a
 * new vehicle (or re-add the same one) with that same plate/VIN ever again —
 * confirmed live: deleting a vehicle then re-creating one with the identical
 * plate threw a raw DB unique-constraint violation (masked as a generic
 * "Internal server error" by ErrorHandler, since it wasn't a DomainException).
 *
 * MySQL has no native partial/filtered unique index (unlike Postgres), so a
 * `WHERE deleted_at IS NULL` uniqueness constraint isn't directly expressible
 * at the schema level. The application layer (VehicleService::create/update)
 * already enforces "no duplicate plate/VIN among non-deleted vehicles" — this
 * migration removes the stricter, soft-delete-unaware DB constraint so that
 * check is the sole enforcement, replacing each UNIQUE index with an ordinary
 * (non-unique) index of the same name to preserve query performance.
 *
 * No data loss: only the constraint changes, no columns or rows are touched.
 */
class DropUniqueConstraintFromVehiclePlateVin extends Migration
{
    /**
     * Run the migration
     */
    public function up(): void
    {
        // license_plate ya tiene un índice no-único separado (idx_vehicles_license_plate),
        // así que aquí basta con eliminar el índice único sin reemplazarlo.
        $this->execute("ALTER TABLE vehicles DROP INDEX license_plate");

        // vin no tiene otro índice, así que se reemplaza el único por uno no-único
        // para conservar el rendimiento de las búsquedas por VIN.
        $this->execute("ALTER TABLE vehicles DROP INDEX vin");
        $this->execute("ALTER TABLE vehicles ADD INDEX idx_vehicles_vin (vin)");

        echo "✓ Dropped UNIQUE constraint from vehicles.license_plate and vehicles.vin\n";
    }

    /**
     * Reverse the migration
     *
     * Nota: si para este punto existen vehículos duplicados en plate/vin entre
     * un registro activo y uno eliminado (el escenario que esta migración
     * habilitó a propósito), recrear el índice UNIQUE aquí fallará hasta que
     * esos duplicados se resuelvan manualmente — comportamiento esperado, no
     * un error de la migración.
     */
    public function down(): void
    {
        $this->execute("ALTER TABLE vehicles DROP INDEX idx_vehicles_vin");
        $this->execute("ALTER TABLE vehicles ADD UNIQUE INDEX vin (vin)");
        $this->execute("ALTER TABLE vehicles ADD UNIQUE INDEX license_plate (license_plate)");

        echo "✓ Restored UNIQUE constraint on vehicles.license_plate and vehicles.vin\n";
    }
}
