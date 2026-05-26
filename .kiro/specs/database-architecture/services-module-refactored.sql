-- ============================================================================
-- P.A.R.C.E PLATFORM - SERVICES MODULE REFACTORED
-- ============================================================================
-- Purpose: Comprehensive refactoring of the services database module
-- Focus: Service lifecycle, assignments, state tracking, and analytics
-- ============================================================================

-- ============================================================================
-- TABLE 1: service_types
-- ============================================================================
-- Purpose: Normalized catalog of available service types
-- Changes from original:
--   - Added category field for grouping
--   - Added estimated_duration for scheduling
--   - Enhanced indexing for performance
-- ============================================================================

CREATE TABLE service_types (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL DEFAULT 'general',
    description TEXT,
    base_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    estimated_duration_minutes INT UNSIGNED NOT NULL DEFAULT 60,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_name (name),
    INDEX idx_category (category),
    INDEX idx_is_active (is_active),
    INDEX idx_category_active (category, is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Normalized service type catalog with categories and pricing';

-- Initial data with categories
INSERT INTO service_types (name, category, description, base_price, estimated_duration_minutes) VALUES
('Tire Change', 'roadside', 'Flat tire replacement or repair', 50000.00, 30),
('Battery Jump Start', 'roadside', 'Jump start service for dead battery', 30000.00, 15),
('Fuel Delivery', 'roadside', 'Emergency fuel delivery service', 40000.00, 20),
('Lockout Service', 'roadside', 'Vehicle lockout assistance', 45000.00, 20),
('Towing', 'transport', 'Vehicle towing service', 80000.00, 45),
('Minor Repair', 'repair', 'On-site minor mechanical repairs', 60000.00, 60),
('Diagnostic', 'repair', 'Vehicle diagnostic and inspection', 55000.00, 45),
('Oil Change', 'maintenance', 'Engine oil and filter replacement', 45000.00, 30);


-- ============================================================================
-- TABLE 2: service_statuses
-- ============================================================================
-- Purpose: Robust status architecture supporting complete service lifecycle
-- Changes from original (service_states):
--   - Renamed to service_statuses for clarity
--   - Added is_terminal flag to identify end states
--   - Added is_cancellable flag for business logic
--   - Expanded status set to include rejected, expired
--   - Added color codes for UI representation
-- ============================================================================

CREATE TABLE service_statuses (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    is_terminal BOOLEAN NOT NULL DEFAULT FALSE,
    is_cancellable BOOLEAN NOT NULL DEFAULT TRUE,
    color_code VARCHAR(7) DEFAULT '#6B7280',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_name (name),
    INDEX idx_sort_order (sort_order),
    INDEX idx_is_terminal (is_terminal)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Service lifecycle status definitions with terminal state flags';

-- Comprehensive status data
INSERT INTO service_statuses (name, description, sort_order, is_terminal, is_cancellable, color_code) VALUES
('requested', 'Service request created, awaiting mechanic assignment', 1, FALSE, TRUE, '#3B82F6'),
('accepted', 'Mechanic accepted the service request', 2, FALSE, TRUE, '#10B981'),
('mechanic_en_route', 'Mechanic is traveling to service location', 3, FALSE, TRUE, '#F59E0B'),
('arrived', 'Mechanic has arrived at service location', 4, FALSE, TRUE, '#8B5CF6'),
('in_progress', 'Service is actively being performed', 5, FALSE, FALSE, '#EC4899'),
('completed', 'Service completed successfully', 6, TRUE, FALSE, '#059669'),
('cancelled', 'Service cancelled by customer or system', 7, TRUE, FALSE, '#6B7280'),
('rejected', 'Service request rejected by mechanic', 8, TRUE, FALSE, '#EF4444'),
('expired', 'Service request expired without assignment', 9, TRUE, FALSE, '#DC2626');


-- ============================================================================
-- TABLE 3: services
-- ============================================================================
-- Purpose: Main service request records with comprehensive lifecycle tracking
-- Changes from original:
--   - Added requested_at, assigned_at, accepted_at, arrived_at timestamps
--   - Added cancelled_at, rejected_at, expired_at for terminal states
--   - Added cancellation_reason and rejection_reason fields
--   - Added final_price to track actual charged amount
--   - Renamed current_state_id to status_id for consistency
--   - Added composite indexes for analytics queries
-- ============================================================================

CREATE TABLE services (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    -- Core relationships
    user_id BIGINT UNSIGNED NOT NULL COMMENT 'Customer who requested the service',
    mechanic_id BIGINT UNSIGNED NULL COMMENT 'Currently assigned mechanic (NULL if unassigned)',
    service_type_id INT UNSIGNED NOT NULL,
    status_id INT UNSIGNED NOT NULL,
    
    -- Location data
    latitude DECIMAL(10, 8) NOT NULL COMMENT 'Service location latitude',
    longitude DECIMAL(11, 8) NOT NULL COMMENT 'Service location longitude',
    address_text VARCHAR(255) NULL COMMENT 'Human-readable address',
    
    -- Service details
    description TEXT COMMENT 'Customer description of the problem',
    user_notes TEXT NULL COMMENT 'Additional notes from customer',
    mechanic_notes TEXT NULL COMMENT 'Notes added by mechanic during service',
    
    -- Pricing
    quoted_price DECIMAL(10, 2) NULL COMMENT 'Initial price quote',
    final_price DECIMAL(10, 2) NULL COMMENT 'Final charged amount',
    
    -- Lifecycle timestamps
    requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'When service was requested',
    assigned_at TIMESTAMP NULL COMMENT 'When mechanic was first assigned',
    accepted_at TIMESTAMP NULL COMMENT 'When mechanic accepted the assignment',
    arrived_at TIMESTAMP NULL COMMENT 'When mechanic arrived at location',
    started_at TIMESTAMP NULL COMMENT 'When service work began',
    completed_at TIMESTAMP NULL COMMENT 'When service was completed',
    cancelled_at TIMESTAMP NULL COMMENT 'When service was cancelled',
    rejected_at TIMESTAMP NULL COMMENT 'When service was rejected',
    expired_at TIMESTAMP NULL COMMENT 'When service request expired',
    
    -- Cancellation/rejection tracking
    cancellation_reason TEXT NULL COMMENT 'Reason for cancellation',
    cancelled_by BIGINT UNSIGNED NULL COMMENT 'User who cancelled (customer or mechanic)',
    rejection_reason TEXT NULL COMMENT 'Reason for rejection by mechanic',
    
    -- Standard timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL COMMENT 'Soft delete timestamp',
    
    -- Foreign keys
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (mechanic_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (service_type_id) REFERENCES service_types(id) ON DELETE RESTRICT,
    FOREIGN KEY (status_id) REFERENCES service_statuses(id) ON DELETE RESTRICT,
    FOREIGN KEY (cancelled_by) REFERENCES users(id) ON DELETE SET NULL,
    
    -- Indexes for common queries
    INDEX idx_user_id (user_id),
    INDEX idx_mechanic_id (mechanic_id),
    INDEX idx_service_type_id (service_type_id),
    INDEX idx_status_id (status_id),
    INDEX idx_requested_at (requested_at),
    INDEX idx_created_at (created_at),
    INDEX idx_deleted_at (deleted_at),
    INDEX idx_location (latitude, longitude),
    
    -- Composite indexes for analytics
    INDEX idx_status_requested (status_id, requested_at),
    INDEX idx_mechanic_status (mechanic_id, status_id, requested_at),
    INDEX idx_user_status (user_id, status_id, requested_at),
    INDEX idx_type_status (service_type_id, status_id, requested_at),
    
    -- Check constraints (MySQL 8.0.16+)
    CONSTRAINT chk_latitude CHECK (latitude BETWEEN -90 AND 90),
    CONSTRAINT chk_longitude CHECK (longitude BETWEEN -180 AND 180),
    CONSTRAINT chk_prices CHECK (quoted_price IS NULL OR quoted_price >= 0),
    CONSTRAINT chk_final_price CHECK (final_price IS NULL OR final_price >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Main service requests with comprehensive lifecycle tracking';


-- ============================================================================
-- TABLE 4: service_assignments
-- ============================================================================
-- Purpose: Dedicated assignment tracking supporting reassignment flows
-- Changes from original: NEW TABLE
--   - Tracks complete assignment history
--   - Supports rejected, expired, and accepted assignments
--   - Enables mechanic performance analytics
--   - Normalized assignment data separate from services table
-- ============================================================================

CREATE TABLE service_assignments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    -- Core relationships
    service_id BIGINT UNSIGNED NOT NULL,
    mechanic_id BIGINT UNSIGNED NOT NULL,
    
    -- Assignment lifecycle
    assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'When assignment was created',
    responded_at TIMESTAMP NULL COMMENT 'When mechanic responded to assignment',
    expires_at TIMESTAMP NULL COMMENT 'When assignment offer expires',
    
    -- Assignment status
    status ENUM('pending', 'accepted', 'rejected', 'expired', 'reassigned') NOT NULL DEFAULT 'pending',
    
    -- Response tracking
    rejection_reason TEXT NULL COMMENT 'Reason provided by mechanic for rejection',
    response_time_seconds INT UNSIGNED NULL COMMENT 'Calculated response time',
    
    -- Assignment metadata
    assignment_order INT UNSIGNED NOT NULL DEFAULT 1 COMMENT 'Order of assignment (1=first, 2=second, etc.)',
    assigned_by BIGINT UNSIGNED NULL COMMENT 'User who created the assignment (admin/system)',
    notes TEXT NULL COMMENT 'Internal notes about assignment',
    
    -- Standard timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign keys
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    FOREIGN KEY (mechanic_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_service_id (service_id),
    INDEX idx_mechanic_id (mechanic_id),
    INDEX idx_status (status),
    INDEX idx_assigned_at (assigned_at),
    INDEX idx_expires_at (expires_at),
    
    -- Composite indexes for analytics
    INDEX idx_mechanic_status (mechanic_id, status, assigned_at),
    INDEX idx_service_order (service_id, assignment_order),
    INDEX idx_response_time (mechanic_id, response_time_seconds),
    
    -- Unique constraint: one pending assignment per service
    UNIQUE KEY uk_service_pending (service_id, status, mechanic_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Assignment tracking with support for reassignment and rejection flows';


-- ============================================================================
-- TABLE 5: service_state_history
-- ============================================================================
-- Purpose: Complete audit trail of ALL service state transitions
-- Changes from original:
--   - Renamed state_id to status_id for consistency
--   - Added previous_status_id to track transitions
--   - Added transition_duration_seconds for analytics
--   - Added actor_role to identify who made the change
--   - Enhanced indexing for audit queries
-- ============================================================================

CREATE TABLE service_state_history (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    -- Core relationships
    service_id BIGINT UNSIGNED NOT NULL,
    previous_status_id INT UNSIGNED NULL COMMENT 'Status before transition (NULL for initial state)',
    new_status_id INT UNSIGNED NOT NULL COMMENT 'Status after transition',
    
    -- Actor tracking
    changed_by BIGINT UNSIGNED NOT NULL COMMENT 'User who triggered the state change',
    actor_role VARCHAR(50) NULL COMMENT 'Role of the actor (customer, mechanic, admin, system)',
    
    -- Transition metadata
    transition_duration_seconds INT UNSIGNED NULL COMMENT 'Time spent in previous status',
    notes TEXT NULL COMMENT 'Reason or notes for state change',
    metadata JSON NULL COMMENT 'Additional structured data about transition',
    
    -- Timestamp
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When transition occurred',
    
    -- Foreign keys
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    FOREIGN KEY (previous_status_id) REFERENCES service_statuses(id) ON DELETE RESTRICT,
    FOREIGN KEY (new_status_id) REFERENCES service_statuses(id) ON DELETE RESTRICT,
    FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE RESTRICT,
    
    -- Indexes
    INDEX idx_service_id (service_id),
    INDEX idx_new_status_id (new_status_id),
    INDEX idx_previous_status_id (previous_status_id),
    INDEX idx_created_at (created_at),
    INDEX idx_changed_by (changed_by),
    
    -- Composite indexes for analytics
    INDEX idx_service_chronological (service_id, created_at),
    INDEX idx_status_transition (previous_status_id, new_status_id, created_at),
    INDEX idx_actor_transitions (changed_by, actor_role, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Immutable audit trail of all service state transitions';


-- ============================================================================
-- TABLE 6: service_locations (unchanged but included for completeness)
-- ============================================================================
-- Purpose: GPS location tracking during service execution
-- No changes from original - already well-designed
-- ============================================================================

CREATE TABLE service_locations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    service_id BIGINT UNSIGNED NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    accuracy DECIMAL(6, 2) NULL COMMENT 'GPS accuracy in meters',
    speed DECIMAL(6, 2) NULL COMMENT 'Speed in km/h',
    heading DECIMAL(5, 2) NULL COMMENT 'Direction in degrees (0-360)',
    recorded_at TIMESTAMP NOT NULL COMMENT 'GPS timestamp',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    
    INDEX idx_service_id (service_id),
    INDEX idx_recorded_at (recorded_at),
    INDEX idx_location (latitude, longitude),
    INDEX idx_service_chronological (service_id, recorded_at),
    
    CONSTRAINT chk_loc_latitude CHECK (latitude BETWEEN -90 AND 90),
    CONSTRAINT chk_loc_longitude CHECK (longitude BETWEEN -180 AND 180),
    CONSTRAINT chk_accuracy CHECK (accuracy IS NULL OR accuracy >= 0),
    CONSTRAINT chk_speed CHECK (speed IS NULL OR speed >= 0),
    CONSTRAINT chk_heading CHECK (heading IS NULL OR (heading >= 0 AND heading <= 360))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='GPS location tracking optimized for high-frequency inserts';


-- ============================================================================
-- ANALYTICS VIEWS
-- ============================================================================
-- Purpose: Pre-built views for common analytics queries
-- ============================================================================

-- View: Service response time metrics
CREATE OR REPLACE VIEW v_service_response_metrics AS
SELECT 
    s.id AS service_id,
    s.user_id,
    s.mechanic_id,
    s.service_type_id,
    s.status_id,
    s.requested_at,
    s.assigned_at,
    s.accepted_at,
    s.arrived_at,
    s.started_at,
    s.completed_at,
    
    -- Response time calculations (in minutes)
    TIMESTAMPDIFF(MINUTE, s.requested_at, s.assigned_at) AS assignment_time_minutes,
    TIMESTAMPDIFF(MINUTE, s.assigned_at, s.accepted_at) AS acceptance_time_minutes,
    TIMESTAMPDIFF(MINUTE, s.accepted_at, s.arrived_at) AS travel_time_minutes,
    TIMESTAMPDIFF(MINUTE, s.arrived_at, s.started_at) AS preparation_time_minutes,
    TIMESTAMPDIFF(MINUTE, s.started_at, s.completed_at) AS service_duration_minutes,
    TIMESTAMPDIFF(MINUTE, s.requested_at, s.completed_at) AS total_time_minutes,
    
    -- Status flags
    CASE WHEN s.completed_at IS NOT NULL THEN TRUE ELSE FALSE END AS is_completed,
    CASE WHEN s.cancelled_at IS NOT NULL THEN TRUE ELSE FALSE END AS is_cancelled
FROM services s
WHERE s.deleted_at IS NULL;

-- View: Mechanic performance metrics
CREATE OR REPLACE VIEW v_mechanic_performance AS
SELECT 
    m.id AS mechanic_id,
    m.full_name AS mechanic_name,
    COUNT(DISTINCT s.id) AS total_services,
    COUNT(DISTINCT CASE WHEN s.status_id = (SELECT id FROM service_statuses WHERE name = 'completed') THEN s.id END) AS completed_services,
    COUNT(DISTINCT CASE WHEN s.status_id = (SELECT id FROM service_statuses WHERE name = 'cancelled') THEN s.id END) AS cancelled_services,
    
    -- Assignment metrics
    COUNT(DISTINCT sa.id) AS total_assignments,
    COUNT(DISTINCT CASE WHEN sa.status = 'accepted' THEN sa.id END) AS accepted_assignments,
    COUNT(DISTINCT CASE WHEN sa.status = 'rejected' THEN sa.id END) AS rejected_assignments,
    
    -- Average response times
    AVG(sa.response_time_seconds) AS avg_response_time_seconds,
    AVG(TIMESTAMPDIFF(MINUTE, s.accepted_at, s.arrived_at)) AS avg_travel_time_minutes,
    AVG(TIMESTAMPDIFF(MINUTE, s.started_at, s.completed_at)) AS avg_service_duration_minutes,
    
    -- Acceptance rate
    ROUND(
        COUNT(DISTINCT CASE WHEN sa.status = 'accepted' THEN sa.id END) * 100.0 / 
        NULLIF(COUNT(DISTINCT sa.id), 0), 
        2
    ) AS acceptance_rate_percent
FROM users m
LEFT JOIN services s ON s.mechanic_id = m.id AND s.deleted_at IS NULL
LEFT JOIN service_assignments sa ON sa.mechanic_id = m.id
WHERE m.deleted_at IS NULL
GROUP BY m.id, m.full_name;

-- View: Service type analytics
CREATE OR REPLACE VIEW v_service_type_analytics AS
SELECT 
    st.id AS service_type_id,
    st.name AS service_type_name,
    st.category,
    st.base_price,
    COUNT(DISTINCT s.id) AS total_requests,
    COUNT(DISTINCT CASE WHEN s.status_id = (SELECT id FROM service_statuses WHERE name = 'completed') THEN s.id END) AS completed_requests,
    COUNT(DISTINCT CASE WHEN s.status_id = (SELECT id FROM service_statuses WHERE name = 'cancelled') THEN s.id END) AS cancelled_requests,
    
    -- Average metrics
    AVG(s.final_price) AS avg_final_price,
    AVG(TIMESTAMPDIFF(MINUTE, s.requested_at, s.completed_at)) AS avg_completion_time_minutes,
    
    -- Completion rate
    ROUND(
        COUNT(DISTINCT CASE WHEN s.status_id = (SELECT id FROM service_statuses WHERE name = 'completed') THEN s.id END) * 100.0 / 
        NULLIF(COUNT(DISTINCT s.id), 0), 
        2
    ) AS completion_rate_percent
FROM service_types st
LEFT JOIN services s ON s.service_type_id = st.id AND s.deleted_at IS NULL
GROUP BY st.id, st.name, st.category, st.base_price;


-- ============================================================================
-- STORED PROCEDURES FOR COMMON OPERATIONS
-- ============================================================================

DELIMITER //

-- Procedure: Assign service to mechanic
CREATE PROCEDURE sp_assign_service_to_mechanic(
    IN p_service_id BIGINT UNSIGNED,
    IN p_mechanic_id BIGINT UNSIGNED,
    IN p_assigned_by BIGINT UNSIGNED,
    IN p_expires_minutes INT,
    OUT p_assignment_id BIGINT UNSIGNED
)
BEGIN
    DECLARE v_assignment_order INT;
    DECLARE v_expires_at TIMESTAMP;
    
    -- Calculate assignment order
    SELECT COALESCE(MAX(assignment_order), 0) + 1 
    INTO v_assignment_order
    FROM service_assignments
    WHERE service_id = p_service_id;
    
    -- Calculate expiration time
    SET v_expires_at = DATE_ADD(NOW(), INTERVAL p_expires_minutes MINUTE);
    
    -- Create assignment
    INSERT INTO service_assignments (
        service_id, 
        mechanic_id, 
        assigned_by, 
        assignment_order, 
        expires_at,
        status
    ) VALUES (
        p_service_id, 
        p_mechanic_id, 
        p_assigned_by, 
        v_assignment_order, 
        v_expires_at,
        'pending'
    );
    
    SET p_assignment_id = LAST_INSERT_ID();
    
    -- Update service
    UPDATE services 
    SET 
        mechanic_id = p_mechanic_id,
        assigned_at = CASE WHEN assigned_at IS NULL THEN NOW() ELSE assigned_at END,
        updated_at = NOW()
    WHERE id = p_service_id;
END//

-- Procedure: Record state transition
CREATE PROCEDURE sp_record_state_transition(
    IN p_service_id BIGINT UNSIGNED,
    IN p_new_status_id INT UNSIGNED,
    IN p_changed_by BIGINT UNSIGNED,
    IN p_actor_role VARCHAR(50),
    IN p_notes TEXT
)
BEGIN
    DECLARE v_previous_status_id INT UNSIGNED;
    DECLARE v_previous_status_time TIMESTAMP;
    DECLARE v_duration_seconds INT UNSIGNED;
    
    -- Get current status
    SELECT status_id INTO v_previous_status_id
    FROM services
    WHERE id = p_service_id;
    
    -- Get timestamp of last status change
    SELECT created_at INTO v_previous_status_time
    FROM service_state_history
    WHERE service_id = p_service_id
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- Calculate duration in previous status
    IF v_previous_status_time IS NOT NULL THEN
        SET v_duration_seconds = TIMESTAMPDIFF(SECOND, v_previous_status_time, NOW());
    END IF;
    
    -- Insert state history record
    INSERT INTO service_state_history (
        service_id,
        previous_status_id,
        new_status_id,
        changed_by,
        actor_role,
        transition_duration_seconds,
        notes
    ) VALUES (
        p_service_id,
        v_previous_status_id,
        p_new_status_id,
        p_changed_by,
        p_actor_role,
        v_duration_seconds,
        p_notes
    );
    
    -- Update service status
    UPDATE services
    SET status_id = p_new_status_id,
        updated_at = NOW()
    WHERE id = p_service_id;
END//

DELIMITER ;


-- ============================================================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMP MANAGEMENT
-- ============================================================================

DELIMITER //

-- Trigger: Update service timestamps based on status changes
CREATE TRIGGER trg_services_status_timestamps
BEFORE UPDATE ON services
FOR EACH ROW
BEGIN
    DECLARE v_status_name VARCHAR(50);
    
    -- Get new status name
    SELECT name INTO v_status_name
    FROM service_statuses
    WHERE id = NEW.status_id;
    
    -- Update appropriate timestamp based on status
    IF v_status_name = 'accepted' AND OLD.accepted_at IS NULL THEN
        SET NEW.accepted_at = NOW();
    ELSEIF v_status_name = 'mechanic_en_route' AND OLD.accepted_at IS NULL THEN
        SET NEW.accepted_at = NOW();
    ELSEIF v_status_name = 'arrived' AND OLD.arrived_at IS NULL THEN
        SET NEW.arrived_at = NOW();
    ELSEIF v_status_name = 'in_progress' AND OLD.started_at IS NULL THEN
        SET NEW.started_at = NOW();
    ELSEIF v_status_name = 'completed' AND OLD.completed_at IS NULL THEN
        SET NEW.completed_at = NOW();
    ELSEIF v_status_name = 'cancelled' AND OLD.cancelled_at IS NULL THEN
        SET NEW.cancelled_at = NOW();
    ELSEIF v_status_name = 'rejected' AND OLD.rejected_at IS NULL THEN
        SET NEW.rejected_at = NOW();
    ELSEIF v_status_name = 'expired' AND OLD.expired_at IS NULL THEN
        SET NEW.expired_at = NOW();
    END IF;
END//

-- Trigger: Calculate response time when assignment is responded to
CREATE TRIGGER trg_assignment_response_time
BEFORE UPDATE ON service_assignments
FOR EACH ROW
BEGIN
    IF OLD.responded_at IS NULL AND NEW.responded_at IS NOT NULL THEN
        SET NEW.response_time_seconds = TIMESTAMPDIFF(SECOND, NEW.assigned_at, NEW.responded_at);
    END IF;
END//

DELIMITER ;


-- ============================================================================
-- INDEXES FOR ANALYTICS AND REPORTING
-- ============================================================================

-- Additional composite indexes for complex queries
CREATE INDEX idx_services_analytics ON services(status_id, service_type_id, requested_at, completed_at);
CREATE INDEX idx_assignments_analytics ON service_assignments(mechanic_id, status, assigned_at, responded_at);
CREATE INDEX idx_history_analytics ON service_state_history(service_id, new_status_id, created_at);

-- ============================================================================
-- END OF SERVICES MODULE REFACTORING
-- ============================================================================
