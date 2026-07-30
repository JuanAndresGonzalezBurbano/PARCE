<?php

use App\Core\Migration;

/**
 * Create Users and Roles Tables Migration
 * 
 * Creates the core authentication and authorization tables:
 * - users: User account information
 * - roles: System roles for RBAC
 * - user_roles: Many-to-many relationship between users and roles
 * - admin_access_requests: Administrative access approval workflow
 */
class CreateUsersAndRolesTables extends Migration
{
    /**
     * Run the migration
     */
    public function up(): void
    {
        // Create users table
        $this->execute("
            CREATE TABLE users (
                id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100) NOT NULL,
                phone VARCHAR(20),
                profile_picture_url VARCHAR(500) NULL,
                account_status ENUM('active', 'suspended', 'deactivated', 'pending_verification') 
                    NOT NULL DEFAULT 'active' COMMENT 'MVP: Users active by default. Email verification planned for production.',
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
                
                INDEX idx_email (email),
                INDEX idx_account_status (account_status),
                INDEX idx_email_verification_status (email_verification_status),
                INDEX idx_phone_verification_status (phone_verification_status),
                INDEX idx_last_login_at (last_login_at),
                INDEX idx_deleted_at (deleted_at),
                INDEX idx_created_at (created_at),
                INDEX idx_account_email_status (account_status, email_verification_status),
                INDEX idx_last_login_account (last_login_at, account_status),
                
                CONSTRAINT chk_email_verification CHECK (
                    (email_verification_status = 'verified' AND email_verified_at IS NOT NULL) OR
                    (email_verification_status = 'unverified')
                ),
                CONSTRAINT chk_phone_verification CHECK (
                    (phone_verification_status = 'verified' AND phone_verified_at IS NOT NULL) OR
                    (phone_verification_status = 'unverified')
                )
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");

        // Create roles table
        $this->execute("
            CREATE TABLE roles (
                id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(50) NOT NULL UNIQUE,
                slug VARCHAR(50) NOT NULL UNIQUE,
                description TEXT,
                is_system_role BOOLEAN NOT NULL DEFAULT FALSE,
                is_active BOOLEAN NOT NULL DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                
                INDEX idx_name (name),
                INDEX idx_slug (slug),
                INDEX idx_is_active (is_active),
                INDEX idx_is_system_role (is_system_role),
                INDEX idx_active_system (is_active, is_system_role)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");

        // Insert initial roles
        $this->execute("
            INSERT INTO roles (name, slug, description, is_system_role, is_active) VALUES
            ('Customer', 'customer', 'Standard customer user with service request capabilities', TRUE, TRUE),
            ('Mechanic', 'mechanic', 'Mechanic user with service execution and vehicle management capabilities', TRUE, TRUE),
            ('Administrator', 'administrator', 'Administrative access to manage users, services, and platform operations', TRUE, TRUE),
            ('Super Administrator', 'super_admin', 'Full system access with all permissions including role and system configuration', TRUE, TRUE),
            ('Support Staff', 'support', 'Customer support staff with read-only access to assist users', FALSE, TRUE)
        ");

        // Create user_roles table
        $this->execute("
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
                
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
                FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL,
                
                UNIQUE KEY unique_user_role (user_id, role_id),
                
                INDEX idx_user_id (user_id),
                INDEX idx_role_id (role_id),
                INDEX idx_assigned_by (assigned_by),
                INDEX idx_is_active (is_active),
                INDEX idx_expires_at (expires_at),
                INDEX idx_assigned_at (assigned_at),
                INDEX idx_user_role_active_expires (user_id, role_id, is_active, expires_at),
                INDEX idx_expires_active (expires_at, is_active),
                
                CONSTRAINT chk_expires_future CHECK (
                    expires_at IS NULL OR expires_at > assigned_at
                )
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");

        // Create admin_access_requests table
        $this->execute("
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
                
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (requested_role_id) REFERENCES roles(id) ON DELETE CASCADE,
                FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
                FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
                
                INDEX idx_user_id (user_id),
                INDEX idx_requested_role_id (requested_role_id),
                INDEX idx_status (status),
                INDEX idx_reviewed_by (reviewed_by),
                INDEX idx_approved_by (approved_by),
                INDEX idx_reviewed_at (reviewed_at),
                INDEX idx_created_at (created_at),
                INDEX idx_status_created (status, created_at DESC),
                INDEX idx_status_reviewed_approved (status, reviewed_at, approved_at),
                
                CONSTRAINT chk_approval_consistency CHECK (
                    (status = 'approved' AND approved_by IS NOT NULL AND approved_at IS NOT NULL) OR
                    (status != 'approved')
                ),
                CONSTRAINT chk_rejection_reason CHECK (
                    (status = 'rejected' AND rejection_reason IS NOT NULL) OR
                    (status != 'rejected')
                )
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");
    }

    /**
     * Reverse the migration
     */
    public function down(): void
    {
        $this->dropTable('admin_access_requests');
        $this->dropTable('user_roles');
        $this->dropTable('roles');
        $this->dropTable('users');
    }
}
