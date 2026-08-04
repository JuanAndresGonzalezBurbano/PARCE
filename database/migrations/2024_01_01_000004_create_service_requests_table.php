<?php

use App\Core\Migration;

/**
 * Create Service Requests Table Migration
 * 
 * Service requests are emergency assistance requests created by customers
 * for their vehicles. They can be assigned to mechanics and progress through
 * various lifecycle states.
 * 
 * Business Rules:
 * - One active request per customer
 * - One active request per vehicle
 * - Active statuses: pending, assigned, in_progress
 * - Terminal statuses: completed, cancelled, expired
 */
class CreateServiceRequestsTable extends Migration
{
    /**
     * Run the migration
     */
    public function up(): void
    {
        $this->execute("
            CREATE TABLE IF NOT EXISTS service_requests (
                id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                
                -- Public Tracking
                service_code VARCHAR(20) NOT NULL UNIQUE COMMENT 'Public tracking code (e.g., SR-2024-001234)',
                
                -- Ownership & Assignment
                customer_id BIGINT UNSIGNED NOT NULL COMMENT 'Customer who created the request',
                vehicle_id BIGINT UNSIGNED NOT NULL COMMENT 'Vehicle needing service',
                mechanic_id BIGINT UNSIGNED NULL COMMENT 'Assigned mechanic (null until assigned)',
                resolved_by BIGINT UNSIGNED NULL COMMENT 'Mechanic who completed the service',
                
                -- Emergency Details
                emergency_type VARCHAR(50) NOT NULL COMMENT 'tire, battery, fuel, lockout, tow, engine, other',
                description TEXT NOT NULL COMMENT 'Customer description of the problem',
                priority VARCHAR(20) NOT NULL DEFAULT 'normal' COMMENT 'normal, urgent, critical',
                
                -- Location (GPS coordinates)
                latitude DECIMAL(10, 8) NOT NULL COMMENT 'Latitude where help is needed',
                longitude DECIMAL(11, 8) NOT NULL COMMENT 'Longitude where help is needed',
                
                -- Status & Lifecycle Timestamps
                status VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT 'pending, assigned, in_progress, completed, cancelled, expired',
                requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'When request was created',
                assigned_at TIMESTAMP NULL COMMENT 'When mechanic was assigned',
                started_at TIMESTAMP NULL COMMENT 'When mechanic started work',
                completed_at TIMESTAMP NULL COMMENT 'When service was completed',
                cancelled_at TIMESTAMP NULL COMMENT 'When request was cancelled',
                expired_at TIMESTAMP NULL COMMENT 'When request expired',
                
                -- Cancellation Details
                cancellation_reason TEXT NULL COMMENT 'Why the request was cancelled',
                cancelled_by BIGINT UNSIGNED NULL COMMENT 'User who cancelled (customer or admin)',
                
                -- Cost Management
                estimated_cost DECIMAL(10, 2) NULL COMMENT 'Mechanic estimated cost',
                final_cost DECIMAL(10, 2) NULL COMMENT 'Actual final cost',
                
                -- Customer Feedback
                customer_rating TINYINT UNSIGNED NULL COMMENT 'Customer rating 1-5',
                customer_feedback TEXT NULL COMMENT 'Customer review',
                
                -- Standard Timestamps
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete (admin only)',
                
                -- Foreign Keys (ON DELETE RESTRICT for data integrity)
                CONSTRAINT fk_service_requests_customer_id 
                    FOREIGN KEY (customer_id) 
                    REFERENCES users(id) 
                    ON DELETE RESTRICT,
                
                CONSTRAINT fk_service_requests_vehicle_id 
                    FOREIGN KEY (vehicle_id) 
                    REFERENCES vehicles(id) 
                    ON DELETE RESTRICT,
                
                CONSTRAINT fk_service_requests_mechanic_id 
                    FOREIGN KEY (mechanic_id) 
                    REFERENCES users(id) 
                    ON DELETE RESTRICT,
                
                CONSTRAINT fk_service_requests_resolved_by 
                    FOREIGN KEY (resolved_by) 
                    REFERENCES users(id) 
                    ON DELETE RESTRICT,
                
                CONSTRAINT fk_service_requests_cancelled_by 
                    FOREIGN KEY (cancelled_by) 
                    REFERENCES users(id) 
                    ON DELETE RESTRICT,
                
                -- Performance Indexes
                INDEX idx_service_requests_service_code (service_code),
                INDEX idx_service_requests_customer_id (customer_id),
                INDEX idx_service_requests_vehicle_id (vehicle_id),
                INDEX idx_service_requests_mechanic_id (mechanic_id),
                INDEX idx_service_requests_status (status),
                INDEX idx_service_requests_emergency_type (emergency_type),
                INDEX idx_service_requests_priority (priority),
                INDEX idx_service_requests_requested_at (requested_at),
                INDEX idx_service_requests_deleted_at (deleted_at),
                
                -- Composite Indexes for Common Query Patterns
                INDEX idx_service_requests_customer_status (customer_id, status),
                INDEX idx_service_requests_mechanic_status (mechanic_id, status),
                INDEX idx_service_requests_status_requested (status, requested_at),
                INDEX idx_service_requests_status_priority (status, priority, requested_at),
                
                -- Geospatial Index for Location Queries
                INDEX idx_service_requests_location (latitude, longitude)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

        echo "✓ Created service_requests table\n";
    }

    /**
     * Reverse the migration
     */
    public function down(): void
    {
        $this->execute("DROP TABLE IF EXISTS service_requests");
        echo "✓ Dropped service_requests table\n";
    }
}
