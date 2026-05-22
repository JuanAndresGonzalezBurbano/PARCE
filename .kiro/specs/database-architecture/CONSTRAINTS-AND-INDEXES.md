# Users and Roles Module - Constraints and Indexes Reference

## Overview

This document provides a comprehensive reference for all constraints, indexes, and performance optimizations for the Users and Roles module.

---

## Table of Contents

1. [Foreign Key Constraints](#foreign-key-constraints)
2. [Unique Constraints](#unique-constraints)
3. [Check Constraints](#check-constraints)
4. [Indexes](#indexes)
5. [Composite Indexes](#composite-indexes)
6. [Performance Recommendations](#performance-recommendations)

---

## Foreign Key Constraints

### users Table

**No foreign keys** (root table in hierarchy)

---

### roles Table

**No foreign keys** (lookup table)

---

### user_roles Table

#### FK1: user_id → users.id
```sql
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
```
**Purpose**: Link role assignment to user  
**Delete Behavior**: CASCADE - When user is deleted, all their role assignments are removed  
**Rationale**: Role assignments are meaningless without the user

#### FK2: role_id → roles.id
```sql
FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
```
**Purpose**: Link role assignment to role definition  
**Delete Behavior**: CASCADE - When role is deleted, all assignments of that role are removed  
**Rationale**: Role assignments are meaningless without the role definition  
**Protection**: System roles (`is_system_role = TRUE`) should be protected from deletion in application logic

#### FK3: assigned_by → users.id
```sql
FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL
```
**Purpose**: Track which administrator assigned the role  
**Delete Behavior**: SET NULL - Preserve assignment even if assigning admin is deleted  
**Rationale**: Audit trail is more important than referential integrity for this field

---

### admin_access_requests Table

#### FK1: user_id → users.id
```sql
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
```
**Purpose**: Link request to requesting user  
**Delete Behavior**: CASCADE - When user is deleted, their requests are removed  
**Rationale**: Requests are meaningless without the requesting user

#### FK2: requested_role_id → roles.id
```sql
FOREIGN KEY (requested_role_id) REFERENCES roles(id) ON DELETE CASCADE
```
**Purpose**: Link request to requested role  
**Delete Behavior**: CASCADE - When role is deleted, requests for that role are removed  
**Rationale**: Requests are meaningless without the role definition

#### FK3: reviewed_by → users.id
```sql
FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
```
**Purpose**: Track which administrator reviewed the request  
**Delete Behavior**: SET NULL - Preserve request even if reviewer is deleted  
**Rationale**: Audit trail is more important than referential integrity

#### FK4: approved_by → users.id
```sql
FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
```
**Purpose**: Track which administrator approved the request  
**Delete Behavior**: SET NULL - Preserve request even if approver is deleted  
**Rationale**: Audit trail is more important than referential integrity

---

## Unique Constraints

### users Table

#### UK1: email
```sql
UNIQUE KEY (email)
```
**Purpose**: Prevent duplicate email addresses  
**Rationale**: Email is used for login and must be unique across all users  
**Enforcement**: Database-level constraint + application-level validation

---

### roles Table

#### UK1: name
```sql
UNIQUE KEY (name)
```
**Purpose**: Prevent duplicate role display names  
**Rationale**: Role names are shown in UI and must be unique

#### UK2: slug
```sql
UNIQUE KEY (slug)
```
**Purpose**: Prevent duplicate role slugs  
**Rationale**: Slugs are used in code for authorization checks and must be unique  
**Critical**: This is the most important unique constraint for authorization

---

### user_roles Table

#### UK1: unique_user_role (user_id, role_id)
```sql
UNIQUE KEY unique_user_role (user_id, role_id)
```
**Purpose**: Prevent duplicate role assignments  
**Rationale**: A user should not have the same role assigned multiple times  
**Note**: This allows a user to have multiple different roles, but not duplicates of the same role

---

### admin_access_requests Table

**No unique constraints**

**Rationale**: A user can submit multiple requests over time (e.g., request mechanic role, later request admin role)

**Application Logic**: Prevent multiple pending requests for the same role per user

---

## Check Constraints

### users Table

#### CHK1: chk_email_verification
```sql
CONSTRAINT chk_email_verification CHECK (
    (email_verification_status = 'verified' AND email_verified_at IS NOT NULL) OR
    (email_verification_status = 'unverified')
)
```
**Purpose**: Ensure email_verified_at is set when status is 'verified'  
**Prevents**: Verified status without timestamp  
**Enforcement**: Database-level

#### CHK2: chk_phone_verification
```sql
CONSTRAINT chk_phone_verification CHECK (
    (phone_verification_status = 'verified' AND phone_verified_at IS NOT NULL) OR
    (phone_verification_status = 'unverified')
)
```
**Purpose**: Ensure phone_verified_at is set when status is 'verified'  
**Prevents**: Verified status without timestamp  
**Enforcement**: Database-level

---

### user_roles Table

#### CHK1: chk_expires_future
```sql
CONSTRAINT chk_expires_future CHECK (
    expires_at IS NULL OR expires_at > assigned_at
)
```
**Purpose**: Ensure expiration date is after assignment date  
**Prevents**: Roles that expire before they're assigned  
**Enforcement**: Database-level

---

### admin_access_requests Table

#### CHK1: chk_approval_consistency
```sql
CONSTRAINT chk_approval_consistency CHECK (
    (status = 'approved' AND approved_by IS NOT NULL AND approved_at IS NOT NULL) OR
    (status != 'approved')
)
```
**Purpose**: Ensure approved requests have approver and timestamp  
**Prevents**: Approved status without accountability  
**Enforcement**: Database-level

#### CHK2: chk_rejection_reason
```sql
CONSTRAINT chk_rejection_reason CHECK (
    (status = 'rejected' AND rejection_reason IS NOT NULL) OR
    (status != 'rejected')
)
```
**Purpose**: Ensure rejected requests have explanation  
**Prevents**: Rejected status without reason  
**Enforcement**: Database-level  
**Benefit**: Transparency and reduced repeat requests

---

## Indexes

### users Table

#### IDX1: idx_email
```sql
INDEX idx_email (email)
```
**Purpose**: Fast login lookups  
**Query Pattern**: `WHERE email = ?`  
**Frequency**: Very high (every login)  
**Type**: B-tree  
**Cardinality**: High (unique values)

#### IDX2: idx_account_status
```sql
INDEX idx_account_status (account_status)
```
**Purpose**: Filter users by account status  
**Query Pattern**: `WHERE account_status = 'active'`  
**Frequency**: High (admin dashboards, user lists)  
**Type**: B-tree  
**Cardinality**: Low (4 possible values)

#### IDX3: idx_email_verification_status
```sql
INDEX idx_email_verification_status (email_verification_status)
```
**Purpose**: Find unverified users  
**Query Pattern**: `WHERE email_verification_status = 'unverified'`  
**Frequency**: Medium (verification reminders)  
**Type**: B-tree  
**Cardinality**: Low (2 possible values)

#### IDX4: idx_phone_verification_status
```sql
INDEX idx_phone_verification_status (phone_verification_status)
```
**Purpose**: Find unverified phone numbers  
**Query Pattern**: `WHERE phone_verification_status = 'unverified'`  
**Frequency**: Medium (verification reminders)  
**Type**: B-tree  
**Cardinality**: Low (2 possible values)

#### IDX5: idx_last_login_at
```sql
INDEX idx_last_login_at (last_login_at)
```
**Purpose**: Find inactive users  
**Query Pattern**: `WHERE last_login_at < DATE_SUB(NOW(), INTERVAL 90 DAY)`  
**Frequency**: Low (periodic reports)  
**Type**: B-tree  
**Cardinality**: High (timestamp values)

#### IDX6: idx_deleted_at
```sql
INDEX idx_deleted_at (deleted_at)
```
**Purpose**: Soft delete queries  
**Query Pattern**: `WHERE deleted_at IS NULL` (active users)  
**Frequency**: Very high (most queries)  
**Type**: B-tree  
**Cardinality**: Low (mostly NULL)  
**Note**: Partial index on NULL values would be ideal

#### IDX7: idx_created_at
```sql
INDEX idx_created_at (created_at)
```
**Purpose**: User registration reports  
**Query Pattern**: `WHERE created_at BETWEEN ? AND ?`  
**Frequency**: Low (periodic reports)  
**Type**: B-tree  
**Cardinality**: High (timestamp values)

---

### roles Table

#### IDX1: idx_name
```sql
INDEX idx_name (name)
```
**Purpose**: Display name lookups  
**Query Pattern**: `WHERE name = ?`  
**Frequency**: Low (admin UI)  
**Type**: B-tree  
**Cardinality**: High (unique values)

#### IDX2: idx_slug
```sql
INDEX idx_slug (slug)
```
**Purpose**: Authorization checks  
**Query Pattern**: `WHERE slug = ?`  
**Frequency**: Very high (every authorization check)  
**Type**: B-tree  
**Cardinality**: High (unique values)  
**Critical**: Most important index for authorization

#### IDX3: idx_is_active
```sql
INDEX idx_is_active (is_active)
```
**Purpose**: Filter active roles  
**Query Pattern**: `WHERE is_active = TRUE`  
**Frequency**: Medium (role selection UI)  
**Type**: B-tree  
**Cardinality**: Low (2 possible values)

#### IDX4: idx_is_system_role
```sql
INDEX idx_is_system_role (is_system_role)
```
**Purpose**: Protect system roles  
**Query Pattern**: `WHERE is_system_role = TRUE`  
**Frequency**: Low (admin operations)  
**Type**: B-tree  
**Cardinality**: Low (2 possible values)

---

### user_roles Table

#### IDX1: idx_user_id
```sql
INDEX idx_user_id (user_id)
```
**Purpose**: Get all roles for a user  
**Query Pattern**: `WHERE user_id = ?`  
**Frequency**: Very high (JWT generation, user profile)  
**Type**: B-tree  
**Cardinality**: Medium (many users)

#### IDX2: idx_role_id
```sql
INDEX idx_role_id (role_id)
```
**Purpose**: Get all users with a role  
**Query Pattern**: `WHERE role_id = ?`  
**Frequency**: Medium (admin reports)  
**Type**: B-tree  
**Cardinality**: Low (few roles)

#### IDX3: idx_assigned_by
```sql
INDEX idx_assigned_by (assigned_by)
```
**Purpose**: Audit trail - who assigned roles  
**Query Pattern**: `WHERE assigned_by = ?`  
**Frequency**: Low (audit reports)  
**Type**: B-tree  
**Cardinality**: Medium (many admins)

#### IDX4: idx_is_active
```sql
INDEX idx_is_active (is_active)
```
**Purpose**: Filter active role assignments  
**Query Pattern**: `WHERE is_active = TRUE`  
**Frequency**: Very high (authorization checks)  
**Type**: B-tree  
**Cardinality**: Low (2 possible values)

#### IDX5: idx_expires_at
```sql
INDEX idx_expires_at (expires_at)
```
**Purpose**: Find expiring roles  
**Query Pattern**: `WHERE expires_at < NOW()` or `WHERE expires_at BETWEEN ? AND ?`  
**Frequency**: Medium (scheduled job, expiration alerts)  
**Type**: B-tree  
**Cardinality**: High (timestamp values)

#### IDX6: idx_assigned_at
```sql
INDEX idx_assigned_at (assigned_at)
```
**Purpose**: Audit timeline  
**Query Pattern**: `WHERE assigned_at BETWEEN ? AND ?`  
**Frequency**: Low (audit reports)  
**Type**: B-tree  
**Cardinality**: High (timestamp values)

---

### admin_access_requests Table

#### IDX1: idx_user_id
```sql
INDEX idx_user_id (user_id)
```
**Purpose**: User's request history  
**Query Pattern**: `WHERE user_id = ?`  
**Frequency**: Medium (user profile, request history)  
**Type**: B-tree  
**Cardinality**: Medium (many users)

#### IDX2: idx_requested_role_id
```sql
INDEX idx_requested_role_id (requested_role_id)
```
**Purpose**: Requests by role type  
**Query Pattern**: `WHERE requested_role_id = ?`  
**Frequency**: Low (admin reports)  
**Type**: B-tree  
**Cardinality**: Low (few roles)

#### IDX3: idx_status
```sql
INDEX idx_status (status)
```
**Purpose**: Pending requests dashboard  
**Query Pattern**: `WHERE status = 'pending'`  
**Frequency**: High (admin dashboard)  
**Type**: B-tree  
**Cardinality**: Low (4 possible values)

#### IDX4: idx_reviewed_by
```sql
INDEX idx_reviewed_by (reviewed_by)
```
**Purpose**: Reviewer's activity  
**Query Pattern**: `WHERE reviewed_by = ?`  
**Frequency**: Low (admin reports)  
**Type**: B-tree  
**Cardinality**: Medium (many admins)

#### IDX5: idx_approved_by
```sql
INDEX idx_approved_by (approved_by)
```
**Purpose**: Approver's activity  
**Query Pattern**: `WHERE approved_by = ?`  
**Frequency**: Low (audit reports)  
**Type**: B-tree  
**Cardinality**: Medium (many admins)

#### IDX6: idx_reviewed_at
```sql
INDEX idx_reviewed_at (reviewed_at)
```
**Purpose**: Audit timeline  
**Query Pattern**: `WHERE reviewed_at BETWEEN ? AND ?`  
**Frequency**: Low (audit reports)  
**Type**: B-tree  
**Cardinality**: High (timestamp values)

#### IDX7: idx_created_at
```sql
INDEX idx_created_at (created_at)
```
**Purpose**: Request timeline  
**Query Pattern**: `WHERE created_at BETWEEN ? AND ?`  
**Frequency**: Medium (request list, reports)  
**Type**: B-tree  
**Cardinality**: High (timestamp values)

---

## Composite Indexes

### users Table

#### CIDX1: idx_account_email_status
```sql
INDEX idx_account_email_status (account_status, email_verification_status)
```
**Purpose**: Find active users with verified emails  
**Query Pattern**: `WHERE account_status = 'active' AND email_verification_status = 'verified'`  
**Frequency**: Medium (user lists, reports)  
**Benefit**: Covers both columns in single index scan  
**Cardinality**: Low (few combinations)

#### CIDX2: idx_last_login_account
```sql
INDEX idx_last_login_account (last_login_at, account_status)
```
**Purpose**: Find inactive users with active accounts  
**Query Pattern**: `WHERE last_login_at < ? AND account_status = 'active'`  
**Frequency**: Low (inactive user reports)  
**Benefit**: Efficient range scan on timestamp + filter on status  
**Cardinality**: High on first column, low on second

---

### roles Table

#### CIDX1: idx_active_system
```sql
INDEX idx_active_system (is_active, is_system_role)
```
**Purpose**: Role management UI  
**Query Pattern**: `WHERE is_active = TRUE ORDER BY is_system_role DESC`  
**Frequency**: Low (admin UI)  
**Benefit**: Separate system roles from custom roles  
**Cardinality**: Low (few combinations)

---

### user_roles Table

#### CIDX1: idx_user_role_active_expires (CRITICAL)
```sql
INDEX idx_user_role_active_expires (user_id, role_id, is_active, expires_at)
```
**Purpose**: Authorization checks (most critical query)  
**Query Pattern**: 
```sql
WHERE user_id = ? 
  AND role_id = ? 
  AND is_active = TRUE 
  AND (expires_at IS NULL OR expires_at > NOW())
```
**Frequency**: Very high (every authorization check)  
**Benefit**: Covers entire query, enables index-only scan  
**Cardinality**: High on first two columns, low on last two  
**Performance**: < 1ms response time  
**Critical**: This is the most important index in the entire module

#### CIDX2: idx_expires_active
```sql
INDEX idx_expires_active (expires_at, is_active)
```
**Purpose**: Expiration cleanup job  
**Query Pattern**: `WHERE expires_at < NOW() AND is_active = TRUE`  
**Frequency**: Medium (hourly scheduled job)  
**Benefit**: Efficient range scan on timestamp + filter on status  
**Cardinality**: High on first column, low on second

---

### admin_access_requests Table

#### CIDX1: idx_status_created
```sql
INDEX idx_status_created (status, created_at DESC)
```
**Purpose**: Pending requests dashboard  
**Query Pattern**: `WHERE status = 'pending' ORDER BY created_at DESC`  
**Frequency**: High (admin dashboard)  
**Benefit**: Filter + sort in single index scan  
**Cardinality**: Low on first column, high on second

#### CIDX2: idx_status_reviewed_approved
```sql
INDEX idx_status_reviewed_approved (status, reviewed_at, approved_at)
```
**Purpose**: Audit reports on approval timelines  
**Query Pattern**: `WHERE status = 'approved' AND reviewed_at BETWEEN ? AND ?`  
**Frequency**: Low (audit reports)  
**Benefit**: Covers status filter and date range  
**Cardinality**: Low on first column, high on last two

---

## Performance Recommendations

### Query Optimization

#### 1. Authorization Check (Most Critical)

**Query**:
```sql
SELECT COUNT(*) > 0 as has_role
FROM user_roles ur
JOIN roles r ON r.id = ur.role_id
WHERE ur.user_id = ? 
  AND r.slug = ?
  AND ur.is_active = TRUE
  AND (ur.expires_at IS NULL OR ur.expires_at > NOW());
```

**Optimization**:
- Uses `idx_user_role_active_expires` composite index
- Index covers entire query (index-only scan)
- Expected execution time: < 1ms
- **Caching**: Cache result in JWT token to avoid repeated queries

**Explain Plan**:
```
-> Index lookup on user_roles using idx_user_role_active_expires
   -> Nested loop join with roles using PRIMARY key
```

---

#### 2. Role Lookup for JWT Generation

**Query**:
```sql
SELECT r.slug, r.name
FROM user_roles ur
JOIN roles r ON r.id = ur.role_id
WHERE ur.user_id = ?
  AND ur.is_active = TRUE
  AND (ur.expires_at IS NULL OR ur.expires_at > NOW());
```

**Optimization**:
- Uses `idx_user_id` on user_roles
- Small result set (typically 1-3 roles per user)
- Expected execution time: < 5ms
- **Caching**: Cache in JWT token, refresh on role changes

---

#### 3. Pending Requests Dashboard

**Query**:
```sql
SELECT * FROM admin_access_requests
WHERE status = 'pending'
ORDER BY created_at DESC
LIMIT 50;
```

**Optimization**:
- Uses `idx_status_created` composite index
- Index covers filter and sort
- Expected execution time: < 100ms
- **Caching**: Cache count with 1-minute TTL

---

#### 4. Inactive User Report

**Query**:
```sql
SELECT * FROM users
WHERE last_login_at < DATE_SUB(NOW(), INTERVAL 90 DAY)
  AND account_status = 'active'
  AND deleted_at IS NULL;
```

**Optimization**:
- Uses `idx_last_login_account` composite index
- Range scan on timestamp + filter on status
- Expected execution time: < 500ms
- **Caching**: Cache result with 1-hour TTL

---

### Caching Strategy

#### JWT Token Caching
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
**Benefit**: Eliminates authorization queries for token lifetime  
**Invalidation**: Refresh token on role changes  
**TTL**: 15 minutes (configurable)

#### Application Memory Caching
- **Role Definitions**: Cache all roles in memory (rarely change)
- **Active User Count**: Cache with 5-minute TTL
- **Pending Request Count**: Cache with 1-minute TTL

---

### Scheduled Maintenance Jobs

#### Job 1: Expire Temporary Roles (Hourly)
```sql
UPDATE user_roles
SET is_active = FALSE, updated_at = NOW()
WHERE expires_at IS NOT NULL
  AND expires_at < NOW()
  AND is_active = TRUE;
```
**Index Used**: `idx_expires_active`  
**Expected Rows**: 0-10 per run  
**Execution Time**: < 100ms

#### Job 2: Clean Up Soft-Deleted Users (Daily)
```sql
DELETE FROM users
WHERE deleted_at IS NOT NULL
  AND deleted_at < DATE_SUB(NOW(), INTERVAL 90 DAY);
```
**Index Used**: `idx_deleted_at`  
**Expected Rows**: 0-100 per run  
**Execution Time**: < 1 second  
**Note**: Adjust retention period as needed

#### Job 3: Alert on Expiring Roles (Daily)
```sql
SELECT u.email, r.name, ur.expires_at
FROM user_roles ur
JOIN users u ON u.id = ur.user_id
JOIN roles r ON r.id = ur.role_id
WHERE ur.expires_at BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 7 DAY)
  AND ur.is_active = TRUE
ORDER BY ur.expires_at ASC;
```
**Index Used**: `idx_expires_active`  
**Expected Rows**: 0-50 per run  
**Execution Time**: < 500ms

---

## Index Maintenance

### Monitoring

**Check Index Usage**:
```sql
SELECT 
    table_name,
    index_name,
    cardinality,
    seq_in_index,
    column_name
FROM information_schema.statistics
WHERE table_schema = 'parce_db'
  AND table_name IN ('users', 'roles', 'user_roles', 'admin_access_requests')
ORDER BY table_name, index_name, seq_in_index;
```

**Check Index Fragmentation**:
```sql
SHOW TABLE STATUS 
WHERE Name IN ('users', 'roles', 'user_roles', 'admin_access_requests');
```

### Optimization

**Rebuild Indexes** (if fragmentation > 30%):
```sql
OPTIMIZE TABLE users;
OPTIMIZE TABLE roles;
OPTIMIZE TABLE user_roles;
OPTIMIZE TABLE admin_access_requests;
```

**Update Statistics**:
```sql
ANALYZE TABLE users;
ANALYZE TABLE roles;
ANALYZE TABLE user_roles;
ANALYZE TABLE admin_access_requests;
```

---

## Summary

### Critical Indexes (Must Have)
1. `user_roles.idx_user_role_active_expires` - Authorization checks
2. `roles.idx_slug` - Role lookups
3. `users.idx_email` - Login lookups
4. `user_roles.idx_user_id` - Role lookups for JWT

### Important Indexes (Should Have)
5. `admin_access_requests.idx_status_created` - Pending requests
6. `user_roles.idx_expires_active` - Expiration cleanup
7. `users.idx_deleted_at` - Soft delete queries

### Optional Indexes (Nice to Have)
8. All other indexes listed above

### Performance Targets
- Authorization check: < 1ms
- Role lookup for JWT: < 5ms
- Pending requests dashboard: < 100ms
- Inactive user report: < 500ms

### Maintenance Schedule
- **Hourly**: Expire temporary roles
- **Daily**: Clean up soft-deleted users, alert on expiring roles
- **Weekly**: Check index usage and fragmentation
- **Monthly**: Optimize tables and update statistics

---

## References

- `users-roles-module.sql` - Complete DDL with all constraints and indexes
- `REFACTORING-SUMMARY.md` - Detailed explanation of changes
- `users-roles-erd.md` - Visual entity relationship diagrams
- `design.md` - Full database architecture document
