-- ============================================================================
-- P.A.R.C.E Database - Users and Roles Module (REFACTORED)
-- ============================================================================
-- This file contains ONLY the Users and Roles module DDL
-- Refactored to eliminate role duplication and implement proper RBAC
-- 
-- CRITICAL CHANGES:
-- - Removed user_type ENUM from users table
-- - Enhanced roles table with slug, is_system_role, is_active
-- - Enhanced user_roles table with assigned_by, expires_at, is_active
-- - Enhanced admin_access_requests with requested_role_id, approved_by, rejection_reason
-- ============================================================================

-- ============================================================================
-- Table: users
-- Purpose: Stores user account information for all platform users
-- ============================================================================
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    profile_picture_url VARCHAR(500) NULL,
    account_status ENUM('active', 'suspended', 'deactivated', 'pending_verification') 
        NOT NULL DEFAULT 'pending_verification',
    email_verification_status ENUM('unverified', 'verified') 
        NOT NULL DEFAULT 'unverified',
    phone_verification_status ENUM('unverified', 'verified') 
        NOT NULL DEFAULT 'unverified',
    email_verified_at TIMESTAMP NULL,
    phone_verified_at TIMESTAMP NULL,
    last_login_at TIMESTAMP NULL,
    last_login_ip VARCHAR(45) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    -- Indexes
    INDEX idx_email (email),
    INDEX idx_account_status (account_status),
    INDEX idx_email_verification_status (email_verification_status),
    INDEX idx_phone_verification_status (phone_verification_status),
    INDEX idx_last_login_at (last_login_at),
    INDEX idx_deleted_at (deleted_at),
    INDEX idx_created_at (created_at),
    
    -- Composite indexes for common queries
    INDEX idx_account_email_status (account_status, email_verification_status),
    INDEX idx_last_login_account (last_login_at, account_status),
    
    -- Check constraints
    CONSTRAINT chk_email_verification CHECK (
        (email_verification_status = 'verified' AND email_verified_at IS NOT NULL) OR
        (email_verification_status = 'unverified')
    ),
    CONSTRAINT chk_phone_verification CHECK (
        (phone_verification_status = 'verified' AND phone_verified_at IS NOT NULL) OR
        (phone_verification_status = 'unverified')
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Table: roles
-- Purpose: Defines system roles for RBAC (single source of truth)
-- ============================================================================
CREATE TABLE roles (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    slug VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    is_system_role BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_name (name),
    INDEX idx_slug (slug),
    INDEX idx_is_active (is_active),
    INDEX idx_is_system_role (is_system_role),
    
    -- Composite index for role management
    INDEX idx_active_system (is_active, is_system_role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Initial Roles Data
-- ============================================================================
INSERT INTO roles (name, slug, description, is_system_role, is_active) VALUES
('Customer', 'customer', 'Standard customer user with service request capabilities', TRUE, TRUE),
('Mechanic', 'mechanic', 'Mechanic user with service execution and vehicle management capabilities', TRUE, TRUE),
('Administrator', 'administrator', 'Administrative access to manage users, services, and platform operations', TRUE, TRUE),
('Super Administrator', 'super_admin', 'Full system access with all permissions including role and system configuration', TRUE, TRUE),
('Support Staff', 'support', 'Customer support staff with read-only access to assist users', FALSE, TRUE);

-- ============================================================================
-- Table: user_roles
-- Purpose: Many-to-many relationship between users and roles
-- This is the authoritative source for user role assignments
-- ============================================================================
CREATE TABLE user_roles (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    role_id INT UNSIGNED NOT NULL,
    assigned_by BIGINT UNSIGNED NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign keys
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL,
    
    -- Unique constraint
    UNIQUE KEY unique_user_role (user_id, role_id),
    
    -- Indexes
    INDEX idx_user_id (user_id),
    INDEX idx_role_id (role_id),
    INDEX idx_assigned_by (assigned_by),
    INDEX idx_is_active (is_active),
    INDEX idx_expires_at (expires_at),
    INDEX idx_assigned_at (assigned_at),
    
    -- Critical composite index for authorization checks
    INDEX idx_user_role_active_expires (user_id, role_id, is_active, expires_at),
    
    -- Composite index for expiration cleanup
    INDEX idx_expires_active (expires_at, is_active),
    
    -- Check constraint
    CONSTRAINT chk_expires_future CHECK (
        expires_at IS NULL OR expires_at > assigned_at
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Table: admin_access_requests
-- Purpose: Tracks requests for administrative access with approval workflow
-- ============================================================================
CREATE TABLE admin_access_requests (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    requested_role_id INT UNSIGNED NOT NULL,
    justification TEXT NOT NULL,
    status ENUM('pending', 'approved', 'rejected', 'cancelled') NOT NULL DEFAULT 'pending',
    reviewed_by BIGINT UNSIGNED NULL,
    approved_by BIGINT UNSIGNED NULL,
    review_notes TEXT NULL,
    rejection_reason TEXT NULL,
    reviewed_at TIMESTAMP NULL,
    approved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign keys
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (requested_role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_user_id (user_id),
    INDEX idx_requested_role_id (requested_role_id),
    INDEX idx_status (status),
    INDEX idx_reviewed_by (reviewed_by),
    INDEX idx_approved_by (approved_by),
    INDEX idx_reviewed_at (reviewed_at),
    INDEX idx_created_at (created_at),
    
    -- Composite indexes for common queries
    INDEX idx_status_created (status, created_at DESC),
    INDEX idx_status_reviewed_approved (status, reviewed_at, approved_at),
    
    -- Check constraints for data integrity
    CONSTRAINT chk_approval_consistency CHECK (
        (status = 'approved' AND approved_by IS NOT NULL AND approved_at IS NOT NULL) OR
        (status != 'approved')
    ),
    CONSTRAINT chk_rejection_reason CHECK (
        (status = 'rejected' AND rejection_reason IS NOT NULL) OR
        (status != 'rejected')
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Common Queries for Authorization and User Management
-- ============================================================================

-- Query 1: Check if user has specific role (for middleware)
-- Usage: Replace ? with user_id and role slug
/*
SELECT COUNT(*) > 0 as has_role
FROM user_roles ur
JOIN roles r ON r.id = ur.role_id
WHERE ur.user_id = ? 
  AND r.slug = ?
  AND ur.is_active = TRUE
  AND (ur.expires_at IS NULL OR ur.expires_at > NOW());
*/

-- Query 2: Get all active roles for user (for JWT token generation)
-- Usage: Replace ? with user_id
/*
SELECT r.slug, r.name
FROM user_roles ur
JOIN roles r ON r.id = ur.role_id
WHERE ur.user_id = ?
  AND ur.is_active = TRUE
  AND (ur.expires_at IS NULL OR ur.expires_at > NOW());
*/

-- Query 3: Get pending admin access requests
/*
SELECT 
    aar.id,
    u.email as requester_email,
    u.first_name,
    u.last_name,
    r.name as requested_role,
    aar.justification,
    aar.created_at
FROM admin_access_requests aar
JOIN users u ON u.id = aar.user_id
JOIN roles r ON r.id = aar.requested_role_id
WHERE aar.status = 'pending'
ORDER BY aar.created_at DESC;
*/

-- Query 4: Assign role to user after approval
-- Usage: Replace ? with admin_access_request id
/*
INSERT INTO user_roles (user_id, role_id, assigned_by, assigned_at)
SELECT user_id, requested_role_id, approved_by, approved_at
FROM admin_access_requests
WHERE id = ? AND status = 'approved';
*/

-- ============================================================================
-- Scheduled Maintenance Jobs
-- ============================================================================

-- Job 1: Expire temporary roles (run every hour)
/*
UPDATE user_roles
SET is_active = FALSE, updated_at = NOW()
WHERE expires_at IS NOT NULL
  AND expires_at < NOW()
  AND is_active = TRUE;
*/

-- Job 2: Clean up old soft-deleted users (run daily)
-- Adjust retention period as needed (90 days shown)
/*
DELETE FROM users
WHERE deleted_at IS NOT NULL
  AND deleted_at < DATE_SUB(NOW(), INTERVAL 90 DAY);
*/

-- Job 3: Alert on expiring roles (run daily)
-- Finds roles expiring in next 7 days
/*
SELECT 
    u.email,
    u.first_name,
    u.last_name,
    r.name as role_name,
    ur.expires_at
FROM user_roles ur
JOIN users u ON u.id = ur.user_id
JOIN roles r ON r.id = ur.role_id
WHERE ur.expires_at BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 7 DAY)
  AND ur.is_active = TRUE
ORDER BY ur.expires_at ASC;
*/

-- ============================================================================
-- Migration Script (if upgrading from old schema with user_type)
-- ============================================================================

-- Step 1: Migrate existing user_type values to user_roles
/*
INSERT INTO user_roles (user_id, role_id, assigned_by, assigned_at)
SELECT 
    u.id,
    r.id,
    NULL, -- Self-assigned during migration
    u.created_at
FROM users u
JOIN roles r ON r.slug = u.user_type
WHERE NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = u.id AND ur.role_id = r.id
);
*/

-- Step 2: Verify all users have at least one role
/*
SELECT u.id, u.email, COUNT(ur.id) as role_count
FROM users u
LEFT JOIN user_roles ur ON ur.user_id = u.id
GROUP BY u.id, u.email
HAVING role_count = 0;
*/

-- Step 3: After verification, drop user_type column
/*
ALTER TABLE users DROP COLUMN user_type;
*/

-- Step 4: Migrate verification_status to separate fields
/*
UPDATE users
SET 
    email_verification_status = CASE 
        WHEN verification_status IN ('email_verified', 'fully_verified') THEN 'verified'
        ELSE 'unverified'
    END,
    phone_verification_status = CASE 
        WHEN verification_status IN ('phone_verified', 'fully_verified') THEN 'verified'
        ELSE 'unverified'
    END
WHERE verification_status IS NOT NULL;
*/

-- Step 5: Drop old verification_status column
/*
ALTER TABLE users DROP COLUMN verification_status;
*/

-- ============================================================================
-- End of Users and Roles Module DDL
-- ============================================================================
