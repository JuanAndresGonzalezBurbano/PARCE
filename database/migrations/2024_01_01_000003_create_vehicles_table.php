<?php

use App\Core\Migration;

/**
 * Create Vehicles Table Migration
 * 
 * Vehicles are registered by customers and referenced by service requests.
 * Supports soft deletion, primary vehicle designation, and historical integrity.
 */
class CreateVehiclesTable extends Migration
{
    /**
     * Run the migration
     */
    public function up(): void
    {
        $this->execute("
            CREATE TABLE IF NOT EXISTS vehicles (
                id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                user_id BIGINT UNSIGNED NOT NULL COMMENT 'Owner of the vehicle',
                license_plate VARCHAR(20) NOT NULL UNIQUE COMMENT 'Normalized license plate (uppercase, trimmed)',
                make VARCHAR(50) NOT NULL COMMENT 'Vehicle manufacturer',
                model VARCHAR(50) NOT NULL COMMENT 'Vehicle model',
                year SMALLINT UNSIGNED NOT NULL COMMENT 'Manufacturing year',
                color VARCHAR(30) COMMENT 'Vehicle color',
                vin VARCHAR(17) UNIQUE COMMENT 'Vehicle Identification Number (17 chars)',
                vehicle_type VARCHAR(20) NOT NULL DEFAULT 'sedan' COMMENT 'sedan, suv, truck, motorcycle, van, other',
                fuel_type VARCHAR(20) NOT NULL DEFAULT 'gasoline' COMMENT 'gasoline, diesel, electric, hybrid, other',
                nickname VARCHAR(50) COMMENT 'User-friendly name for the vehicle',
                primary_photo_url VARCHAR(255) COMMENT 'URL to primary vehicle photo',
                is_primary BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Is this the user primary vehicle?',
                status VARCHAR(20) NOT NULL DEFAULT 'active' COMMENT 'active or inactive',
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete timestamp',
                
                -- Foreign Keys (ON DELETE RESTRICT to preserve historical integrity)
                CONSTRAINT fk_vehicles_user_id 
                    FOREIGN KEY (user_id) 
                    REFERENCES users(id) 
                    ON DELETE RESTRICT,
                
                -- Indexes for performance
                INDEX idx_vehicles_user_id (user_id),
                INDEX idx_vehicles_license_plate (license_plate),
                INDEX idx_vehicles_status (status),
                INDEX idx_vehicles_deleted_at (deleted_at),
                INDEX idx_vehicles_is_primary (is_primary),
                INDEX idx_vehicles_created_at (created_at),
                
                -- Composite Indexes for common query patterns
                INDEX idx_vehicles_user_status (user_id, status),
                INDEX idx_vehicles_user_deleted (user_id, deleted_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

        echo "✓ Created vehicles table\n";
    }

    /**
     * Reverse the migration
     */
    public function down(): void
    {
        $this->execute("DROP TABLE IF EXISTS vehicles");
        echo "✓ Dropped vehicles table\n";
    }
}
