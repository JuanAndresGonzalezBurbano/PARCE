# Users and Roles Module Refactoring Summary

## Executive Summary

This document explains the refactoring of the Users and Roles database module for the P.A.R.C.E platform. The refactoring eliminates role duplication and implements proper Role-Based Access Control (RBAC) as the single source of truth for user permissions.

**Scope**: ONLY the following tables were modified:
- `users`
- `roles`
- `user_roles`
- `admin_access_requests`

**Status**: Design complete, ready for implementation

---

## Problem Statement

### The Issue

The original database design had a critical flaw: **user roles were managed in two places**:

1. **`user_type` ENUM field** in the `users` table
   - Values: `customer`, `mechanic`, `admin`
   - Directly on the user record
   - Simple but inflexible

2. **`roles` and `user_roles` tables**
   - Proper many-to-many relationship
   - Supports multiple roles per user
   - Extensible without schema changes

### Why This Was a Problem

| Problem | Impact |
|---------|--------|
| **Two sources of truth** | Risk of inconsistency between `user_type` and `user_roles` |
| **Single role limitation** | Users could only be customer OR mechanic, not both |
| **Schema changes required** | Adding new roles required `ALTER TABLE` statements |
| **No audit trail** | No record of who assigned roles or when |
| **No temporary access** | Could not grant time-limited permissions |
| **Authorization confusion** | Middleware must check both `user_type` and `user_roles` |

### Real-World Scenario

**Before refactoring**:
- A mechanic who wants to request services as a customer must create a second account
- Adding a "dispatcher" role requires altering the `users` table schema
- No way to grant temporary admin access for a specific task
- No record of who promoted a user to administrator

**After refactoring**:
- A mechanic can also have the customer role on the same account
- New roles can be added by inserting into the `roles` table
- Temporary admin access can be granted with an expiration date
- Complete audit trail of all role assignments

---

## Solution: Proper RBAC Implementation

### Design Principles

1. **Single Source of Truth**: `user_roles` table is the ONLY place to check user roles
2. **Flexibility**: Users can have multiple roles simultaneously
3. **Extensibility**: New roles can be added without schema changes
4. **Auditability**: Track who assigned roles, when, and why
5. **Security**: Support temporary access and two-person approval rule

---

## Detailed Changes

### 1. `users` Table

#### Removed Fields
- ❌ `user_type` ENUM('customer', 'mechanic', 'admin')
  - **Reason**: Duplicates functionality of `user_roles` table
  - **Replacement**: Query `user_roles` table instead

- ❌ `verification_status` ENUM('unverified', 'email_verified', 'phone_verified', 'fully_verified')
  - **Reason**: Conflates two independent verification states
  - **Replacement**: Separate `email_verification_status` and `phone_verification_status` fields

#### Added Fields
- ✅ `profile_picture_url` VARCHAR(500) NULL
  - **Purpose**: Store user profile picture URL or path
  - **Use case**: Display user avatars in UI

- ✅ `account_status` ENUM('active', 'suspended', 'deactivated', 'pending_verification')
  - **Purpose**: Overall account state (separate from verification)
  - **Use cases**:
    - `active`: Normal operation
    - `suspended`: Admin-imposed temporary block
    - `deactivated`: User-initiated deactivation
    - `pending_verification`: New account awaiting verification

- ✅ `email_verification_status` ENUM('unverified', 'verified')
  - **Purpose**: Track email verification independently
  - **Benefit**: Email and phone can be verified separately

- ✅ `phone_verification_status` ENUM('unverified', 'verified')
  - **Purpose**: Track phone verification independently
  - **Benefit**: Email and phone can be verified separately

- ✅ `last_login_at` TIMESTAMP NULL
  - **Purpose**: Track most recent successful login
  - **Use cases**: Security auditing, inactive user reports

- ✅ `last_login_ip` VARCHAR(45) NULL
  - **Purpose**: Store IP address of last login (supports IPv4 and IPv6)
  - **Use cases**: Anomaly detection, security auditing

#### Before and After

**Before**:
```sql
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    user_type ENUM('customer', 'mechanic', 'admin') NOT NULL DEFAULT 'customer',
    verification_status ENUM('unverified', 'email_verified', 'phone_verified', 'fully_verified') 
        NOT NULL DEFAULT 'unverified',
    email_verified_at TIMESTAMP NULL,
    phone_verified_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);
```

**After**:
```sql
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
    deleted_at TIMESTAMP NULL
);
```

---

### 2. `roles` Table

#### Added Fields
- ✅ `slug` VARCHAR(50) NOT NULL UNIQUE
  - **Purpose**: Machine-readable identifier (e.g., 'customer', 'mechanic', 'administrator')
  - **Use case**: Authorization checks use slug instead of name
  - **Benefit**: Name can be changed for display without breaking code

- ✅ `is_system_role` BOOLEAN NOT NULL DEFAULT FALSE
  - **Purpose**: Mark core roles that cannot be deleted
  - **Use case**: Prevent accidental deletion of 'customer', 'mechanic', 'administrator'
  - **Benefit**: Protects critical roles from admin mistakes

- ✅ `is_active` BOOLEAN NOT NULL DEFAULT TRUE
  - **Purpose**: Enable/disable roles without deletion
  - **Use case**: Temporarily disable a custom role
  - **Benefit**: Preserves role assignments while preventing new assignments

#### Initial Roles

| Name | Slug | System Role | Description |
|------|------|-------------|-------------|
| Customer | customer | Yes | Standard customer user with service request capabilities |
| Mechanic | mechanic | Yes | Mechanic user with service execution and vehicle management |
| Administrator | administrator | Yes | Administrative access to manage users and services |
| Super Administrator | super_admin | Yes | Full system access including role and system configuration |
| Support Staff | support | No | Customer support staff with read-only access |

#### Before and After

**Before**:
```sql
CREATE TABLE roles (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**After**:
```sql
CREATE TABLE roles (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    slug VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    is_system_role BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

### 3. `user_roles` Table

#### Added Fields
- ✅ `assigned_by` BIGINT UNSIGNED NULL
  - **Purpose**: Track which administrator assigned the role
  - **Use case**: Audit trail, accountability
  - **NULL value**: Self-assigned during registration (e.g., customer role)

- ✅ `expires_at` TIMESTAMP NULL
  - **Purpose**: Support temporary role assignments
  - **Use case**: Grant admin access for 24 hours, temporary mechanic certification
  - **NULL value**: Permanent role assignment

- ✅ `is_active` BOOLEAN NOT NULL DEFAULT TRUE
  - **Purpose**: Enable/disable role assignment without deletion
  - **Use case**: Temporarily suspend a role without losing assignment history
  - **Benefit**: Can be reactivated without reassignment

#### Before and After

**Before**:
```sql
CREATE TABLE user_roles (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    role_id INT UNSIGNED NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_role (user_id, role_id)
);
```

**After**:
```sql
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
    UNIQUE KEY unique_user_role (user_id, role_id)
);
```

---

### 4. `admin_access_requests` Table

#### Added Fields
- ✅ `requested_role_id` INT UNSIGNED NOT NULL
  - **Purpose**: Specify which role is being requested
  - **Use case**: Request mechanic role, request administrator role
  - **Benefit**: Single table handles all role requests, not just admin

- ✅ `approved_by` BIGINT UNSIGNED NULL
  - **Purpose**: Track who gave final approval (separate from reviewer)
  - **Use case**: Two-person rule for sensitive roles
  - **Benefit**: Separation of duties for security

- ✅ `approved_at` TIMESTAMP NULL
  - **Purpose**: Track when approval was granted
  - **Use case**: Audit timeline, SLA tracking
  - **Benefit**: Separate from review time (review != approval)

- ✅ `rejection_reason` TEXT NULL
  - **Purpose**: Required explanation for rejected requests
  - **Use case**: Transparency, reduce repeat requests
  - **Benefit**: User understands why request was denied

- ✅ `status` ENUM: Added 'cancelled' option
  - **Purpose**: User can cancel their own request before review
  - **Use case**: User changes mind, submits duplicate request
  - **Benefit**: Reduces admin workload

#### Before and After

**Before**:
```sql
CREATE TABLE admin_access_requests (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    justification TEXT NOT NULL,
    status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    reviewed_by BIGINT UNSIGNED NULL,
    review_notes TEXT NULL,
    reviewed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);
```

**After**:
```sql
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
    
    CONSTRAINT chk_approval_consistency CHECK (
        (status = 'approved' AND approved_by IS NOT NULL AND approved_at IS NOT NULL) OR
        (status != 'approved')
    ),
    CONSTRAINT chk_rejection_reason CHECK (
        (status = 'rejected' AND rejection_reason IS NOT NULL) OR
        (status != 'rejected')
    )
);
```

---

## Recommended Indexes

### Critical Performance Indexes

**Authorization Check** (most frequent query):
```sql
-- user_roles table
CREATE INDEX idx_user_role_active_expires ON user_roles(user_id, role_id, is_active, expires_at);
```
This composite index covers the entire authorization query, enabling index-only scans.

**Role Lookup for JWT Generation**:
```sql
-- user_roles table
CREATE INDEX idx_user_id ON user_roles(user_id);
```

**Pending Requests Dashboard**:
```sql
-- admin_access_requests table
CREATE INDEX idx_status_created ON admin_access_requests(status, created_at DESC);
```

**Inactive User Reports**:
```sql
-- users table
CREATE INDEX idx_last_login_account ON users(last_login_at, account_status);
```

### All Recommended Indexes

See `users-roles-module.sql` for complete index definitions.

---

## Migration Strategy

### Prerequisites
- Backup database before migration
- Test migration on staging environment first
- Schedule migration during low-traffic period

### Migration Steps

#### Step 1: Add New Columns (Non-Breaking)
```sql
-- Add new columns to users table
ALTER TABLE users 
    ADD COLUMN profile_picture_url VARCHAR(500) NULL AFTER phone,
    ADD COLUMN account_status ENUM('active', 'suspended', 'deactivated', 'pending_verification') 
        NOT NULL DEFAULT 'pending_verification' AFTER profile_picture_url,
    ADD COLUMN email_verification_status ENUM('unverified', 'verified') 
        NOT NULL DEFAULT 'unverified' AFTER account_status,
    ADD COLUMN phone_verification_status ENUM('unverified', 'verified') 
        NOT NULL DEFAULT 'unverified' AFTER email_verification_status,
    ADD COLUMN last_login_at TIMESTAMP NULL AFTER phone_verified_at,
    ADD COLUMN last_login_ip VARCHAR(45) NULL AFTER last_login_at;

-- Add new columns to roles table
ALTER TABLE roles
    ADD COLUMN slug VARCHAR(50) NOT NULL UNIQUE AFTER name,
    ADD COLUMN is_system_role BOOLEAN NOT NULL DEFAULT FALSE AFTER description,
    ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE AFTER is_system_role;

-- Add new columns to user_roles table
ALTER TABLE user_roles
    ADD COLUMN assigned_by BIGINT UNSIGNED NULL AFTER role_id,
    ADD COLUMN expires_at TIMESTAMP NULL AFTER assigned_at,
    ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE AFTER expires_at,
    ADD FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL;

-- Add new columns to admin_access_requests table
ALTER TABLE admin_access_requests
    ADD COLUMN requested_role_id INT UNSIGNED NOT NULL AFTER user_id,
    ADD COLUMN approved_by BIGINT UNSIGNED NULL AFTER reviewed_by,
    ADD COLUMN rejection_reason TEXT NULL AFTER review_notes,
    ADD COLUMN approved_at TIMESTAMP NULL AFTER reviewed_at,
    ADD FOREIGN KEY (requested_role_id) REFERENCES roles(id) ON DELETE CASCADE,
    ADD FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL;
```

#### Step 2: Migrate Data
```sql
-- Migrate user_type to user_roles
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

-- Migrate verification_status to separate fields
UPDATE users
SET 
    email_verification_status = CASE 
        WHEN verification_status IN ('email_verified', 'fully_verified') THEN 'verified'
        ELSE 'unverified'
    END,
    phone_verification_status = CASE 
        WHEN verification_status IN ('phone_verified', 'fully_verified') THEN 'verified'
        ELSE 'unverified'
    END,
    account_status = 'active'
WHERE verification_status IS NOT NULL;
```

#### Step 3: Verify Migration
```sql
-- Verify all users have at least one role
SELECT u.id, u.email, COUNT(ur.id) as role_count
FROM users u
LEFT JOIN user_roles ur ON ur.user_id = u.id
GROUP BY u.id, u.email
HAVING role_count = 0;

-- Should return 0 rows
```

#### Step 4: Update Application Code
- Update all authorization checks to use `user_roles` table
- Update JWT token generation to include roles from `user_roles`
- Update middleware to check `user_roles` instead of `user_type`
- Test thoroughly in staging environment

#### Step 5: Remove Old Columns (Breaking Change)
```sql
-- After application is updated and tested
ALTER TABLE users DROP COLUMN user_type;
ALTER TABLE users DROP COLUMN verification_status;
```

---

## Authorization Code Changes

### Old Approach (DEPRECATED)

```sql
-- ❌ DO NOT USE
SELECT * FROM users 
WHERE id = ? AND user_type = 'admin';
```

```php
// ❌ DO NOT USE
if ($user->user_type === 'admin') {
    // Allow access
}
```

### New Approach (CORRECT)

```sql
-- ✅ USE THIS
SELECT COUNT(*) > 0 as has_role
FROM user_roles ur
JOIN roles r ON r.id = ur.role_id
WHERE ur.user_id = ? 
  AND r.slug = 'administrator'
  AND ur.is_active = TRUE
  AND (ur.expires_at IS NULL OR ur.expires_at > NOW());
```

```php
// ✅ USE THIS
if ($user->hasRole('administrator')) {
    // Allow access
}

// Implementation of hasRole method
public function hasRole(string $roleSlug): bool
{
    return $this->roles()
        ->where('slug', $roleSlug)
        ->where('user_roles.is_active', true)
        ->where(function($query) {
            $query->whereNull('user_roles.expires_at')
                  ->orWhere('user_roles.expires_at', '>', now());
        })
        ->exists();
}
```

### JWT Token Structure

**Old Token Payload**:
```json
{
  "sub": 123,
  "email": "user@example.com",
  "user_type": "admin",
  "iat": 1234567890,
  "exp": 1234571490
}
```

**New Token Payload**:
```json
{
  "sub": 123,
  "email": "user@example.com",
  "roles": ["customer", "mechanic"],
  "account_status": "active",
  "iat": 1234567890,
  "exp": 1234571490
}
```

---

## Security Improvements

### 1. Two-Person Rule for Sensitive Roles
- `reviewed_by` and `approved_by` can be different users
- Prevents single administrator from granting themselves elevated privileges
- Audit trail shows both reviewer and approver

### 2. Temporary Access
- `expires_at` field enables time-limited role assignments
- Automatic expiration via scheduled job
- Reduces risk of forgotten elevated privileges

### 3. Role Suspension
- `is_active` flag allows temporary role suspension
- No need to delete and recreate role assignments
- Preserves audit trail

### 4. Account Status Separation
- `account_status` separate from role assignments
- Can suspend account without affecting role data
- Enables immediate access revocation

### 5. Complete Audit Trail
- `assigned_by` tracks who granted roles
- `assigned_at` tracks when roles were granted
- `reviewed_by` and `approved_by` track approval workflow
- All changes logged to `activity_logs` table

---

## Performance Considerations

### Query Optimization

**Most Frequent Query** (authorization check):
- Optimized with `idx_user_role_active_expires` composite index
- Index covers entire query (index-only scan)
- Expected execution time: <1ms

**Caching Strategy**:
- Cache user roles in JWT token (refresh on role changes)
- Cache role definitions in application memory (rarely change)
- Cache pending request count with 1-minute TTL

### Scheduled Jobs

**Expire Temporary Roles** (run hourly):
```sql
UPDATE user_roles
SET is_active = FALSE, updated_at = NOW()
WHERE expires_at IS NOT NULL
  AND expires_at < NOW()
  AND is_active = TRUE;
```

**Clean Up Soft-Deleted Users** (run daily):
```sql
DELETE FROM users
WHERE deleted_at IS NOT NULL
  AND deleted_at < DATE_SUB(NOW(), INTERVAL 90 DAY);
```

**Alert on Expiring Roles** (run daily):
```sql
SELECT u.email, r.name, ur.expires_at
FROM user_roles ur
JOIN users u ON u.id = ur.user_id
JOIN roles r ON r.id = ur.role_id
WHERE ur.expires_at BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 7 DAY)
  AND ur.is_active = TRUE;
```

---

## Testing Checklist

### Unit Tests
- [ ] User can have multiple roles simultaneously
- [ ] Role assignment creates audit trail
- [ ] Temporary roles expire correctly
- [ ] Inactive roles are excluded from authorization
- [ ] System roles cannot be deleted
- [ ] Approval requires both approved_by and approved_at
- [ ] Rejection requires rejection_reason

### Integration Tests
- [ ] User registration assigns customer role
- [ ] Mechanic application workflow assigns mechanic role
- [ ] Admin access request workflow assigns administrator role
- [ ] JWT token includes all active, non-expired roles
- [ ] Middleware correctly checks user_roles table
- [ ] Role expiration job runs correctly
- [ ] Soft delete cleanup job runs correctly

### Performance Tests
- [ ] Authorization check completes in <1ms
- [ ] Role lookup for JWT generation completes in <5ms
- [ ] Pending requests dashboard loads in <100ms
- [ ] User list with role counts loads in <500ms

---

## Rollback Plan

If issues are discovered after migration:

### Step 1: Restore user_type Column
```sql
ALTER TABLE users 
ADD COLUMN user_type ENUM('customer', 'mechanic', 'admin') NOT NULL DEFAULT 'customer';

-- Restore user_type from user_roles
UPDATE users u
SET user_type = (
    SELECT r.slug
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = u.id
    ORDER BY 
        CASE r.slug
            WHEN 'super_admin' THEN 1
            WHEN 'administrator' THEN 2
            WHEN 'mechanic' THEN 3
            WHEN 'customer' THEN 4
            ELSE 5
        END
    LIMIT 1
);
```

### Step 2: Revert Application Code
- Deploy previous version of application
- Restore authorization checks to use `user_type`

### Step 3: Investigate and Fix
- Identify root cause of issues
- Fix problems in staging environment
- Re-test migration

---

## Benefits Summary

| Benefit | Before | After |
|---------|--------|-------|
| **Multiple Roles** | ❌ No | ✅ Yes |
| **Extensibility** | ❌ Schema changes required | ✅ Insert into roles table |
| **Audit Trail** | ❌ No | ✅ Complete |
| **Temporary Access** | ❌ No | ✅ Yes |
| **Two-Person Rule** | ❌ No | ✅ Yes |
| **Role Suspension** | ❌ Delete only | ✅ Suspend/reactivate |
| **Consistency** | ❌ Two sources of truth | ✅ Single source |

---

## Next Steps

1. **Review**: Have database architect review this refactoring
2. **Approve**: Get stakeholder approval for changes
3. **Test**: Implement and test in development environment
4. **Stage**: Deploy to staging and run full test suite
5. **Migrate**: Execute migration in production during maintenance window
6. **Monitor**: Monitor performance and error logs after migration
7. **Document**: Update API documentation and developer guides

---

## Questions and Answers

### Q: Can a user be both a customer and a mechanic?
**A**: Yes! That's one of the key benefits of this refactoring. A user can have multiple roles simultaneously.

### Q: How do I check if a user has a specific role?
**A**: Query the `user_roles` table joined with `roles` table, checking the `slug` field. See "Authorization Code Changes" section for examples.

### Q: What happens to existing users during migration?
**A**: Their `user_type` value is migrated to a corresponding role in the `user_roles` table. No data is lost.

### Q: Can roles be deleted?
**A**: System roles (customer, mechanic, administrator) cannot be deleted due to the `is_system_role` flag. Custom roles can be deleted or deactivated.

### Q: How do temporary roles work?
**A**: Set the `expires_at` field when assigning a role. A scheduled job runs hourly to deactivate expired roles.

### Q: What if I need to add a new role like "dispatcher"?
**A**: Simply insert a new row into the `roles` table. No schema changes required.

### Q: How is the audit trail maintained?
**A**: The `user_roles` table tracks `assigned_by` and `assigned_at`. The `admin_access_requests` table tracks the full approval workflow. All changes should also be logged to the `activity_logs` table.

---

## Contact

For questions about this refactoring, contact the database architecture team.

**Document Version**: 1.0  
**Last Updated**: [Current Date]  
**Author**: Database Architecture Team
