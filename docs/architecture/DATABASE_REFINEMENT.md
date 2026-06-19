# DATABASE REFINEMENT - P.A.R.C.E
## Data Model Enhancement for Document Management

**Date:** 2024-01-XX  
**Version:** 2.0.0  
**Status:** PROPOSAL - NOT IMPLEMENTED

---

## Executive Summary

This document proposes a comprehensive document management system for P.A.R.C.E that supports:
- User profile pictures
- User identity documents (driver's license, national ID)
- Vehicle documents (SOAT, technical certificate)
- Mechanic certifications (academic credentials)
- Document verification workflow
- Approval/rejection system

**Key Design Decisions:**
- ✅ Generic `documents` table for all file types
- ✅ Document type polymorphism (user, vehicle, mechanic)
- ✅ Separate verification workflow table
- ✅ No documents inside `vehicles` table (following requirement)
- ✅ Support for multiple documents per entity
- ✅ File metadata tracking (size, mime type, hash)

---

## 1. CURRENT STATE ANALYSIS

### 1.1 Existing Tables (Relevant to Documents)

**users table:**
- `profile_picture_url` (VARCHAR 500) - Direct URL field
- No document management
- No verification workflow

**vehicles table:**
- `primary_photo_url` (VARCHAR 255) - Direct URL field
- No SOAT tracking
- No technical certificate tracking

**Limitations:**
- ❌ No document storage structure
- ❌ No version control
- ❌ No verification workflow
- ❌ No expiration date tracking
- ❌ No audit trail
- ❌ URLs can break if files move

---

## 2. PROPOSED DATA MODEL

### 2.1 New Tables Overview

We propose **3 new tables**:

1. **`documents`** - Core document storage and metadata
2. **`document_verifications`** - Verification workflow and approval tracking
3. **`document_types`** - Document type configuration (optional, can use ENUM)

### 2.2 Table: `documents`

**Purpose:** Store all document metadata and file information

```sql
CREATE TABLE documents (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    -- Polymorphic Ownership (entity that owns the document)
    documentable_type VARCHAR(50) NOT NULL COMMENT 'user, vehicle, service_request',
    documentable_id BIGINT UNSIGNED NOT NULL COMMENT 'ID of the owning entity',
    
    -- Document Classification
    document_type VARCHAR(50) NOT NULL COMMENT 'profile_picture, drivers_license, national_id, soat, technical_cert, academic_cert',
    document_category VARCHAR(30) NOT NULL COMMENT 'identity, vehicle, certification, photo',
    
    -- File Information
    file_name VARCHAR(255) NOT NULL COMMENT 'Original filename',
    file_path VARCHAR(500) NOT NULL COMMENT 'Storage path or URL',
    file_size INT UNSIGNED NOT NULL COMMENT 'File size in bytes',
    mime_type VARCHAR(100) NOT NULL COMMENT 'image/jpeg, application/pdf, etc.',
    file_hash VARCHAR(64) COMMENT 'SHA-256 hash for integrity verification',
    
    -- Document Metadata
    title VARCHAR(200) COMMENT 'User-friendly document title',
    description TEXT COMMENT 'Additional notes or description',
    
    -- Validity Period (for documents that expire)
    issue_date DATE COMMENT 'Document issue date',
    expiration_date DATE COMMENT 'Document expiration date',
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT 'pending, verified, rejected, expired',
    is_primary BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Is this the primary document of its type?',
    
    -- Uploader Information
    uploaded_by BIGINT UNSIGNED NOT NULL COMMENT 'User who uploaded the document',
    
    -- Audit Trail
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    
    -- Foreign Keys
    CONSTRAINT fk_documents_uploaded_by 
        FOREIGN KEY (uploaded_by) 
        REFERENCES users(id) 
        ON DELETE RESTRICT,
    
    -- Indexes
    INDEX idx_documents_documentable (documentable_type, documentable_id),
    INDEX idx_documents_type (document_type),
    INDEX idx_documents_category (document_category),
    INDEX idx_documents_status (status),
    INDEX idx_documents_uploaded_by (uploaded_by),
    INDEX idx_documents_expiration (expiration_date),
    INDEX idx_documents_created_at (created_at),
    INDEX idx_documents_deleted_at (deleted_at),
    
    -- Composite Indexes
    INDEX idx_documents_owner_type (documentable_type, documentable_id, document_type),
    INDEX idx_documents_status_expiration (status, expiration_date),
    INDEX idx_documents_type_status (document_type, status, expiration_date),
    
    -- Constraints
    CONSTRAINT chk_documents_positive_size CHECK (file_size > 0),
    CONSTRAINT chk_documents_valid_dates CHECK (
        expiration_date IS NULL OR 
        issue_date IS NULL OR 
        expiration_date > issue_date
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Key Features:**
- ✅ Polymorphic ownership (can belong to user, vehicle, or service request)
- ✅ Supports all required document types
- ✅ File integrity via SHA-256 hash
- ✅ Expiration date tracking
- ✅ Soft delete for audit trail
- ✅ Comprehensive indexing

### 2.3 Table: `document_verifications`

**Purpose:** Track document verification workflow and approvals

```sql
CREATE TABLE document_verifications (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    -- Document Reference
    document_id BIGINT UNSIGNED NOT NULL,
    
    -- Verification Details
    status VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT 'pending, approved, rejected, requires_reupload',
    verification_type VARCHAR(50) NOT NULL COMMENT 'manual_review, automated, admin_override',
    
    -- Reviewer Information
    reviewed_by BIGINT UNSIGNED NULL COMMENT 'Admin/reviewer user ID',
    reviewer_notes TEXT COMMENT 'Internal notes from reviewer',
    
    -- Rejection Details
    rejection_reason TEXT COMMENT 'Reason for rejection (shown to user)',
    rejection_category VARCHAR(50) COMMENT 'invalid, expired, illegible, fraud_suspected, other',
    
    -- Approval Details
    approved_at TIMESTAMP NULL,
    approved_until TIMESTAMP NULL COMMENT 'Approval valid until (for temp approvals)',
    
    -- Metadata
    verification_score DECIMAL(5,2) COMMENT 'Automated verification confidence (0-100)',
    verification_metadata JSON COMMENT 'Additional verification data',
    
    -- Audit Trail
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_verifications_document_id 
        FOREIGN KEY (document_id) 
        REFERENCES documents(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_verifications_reviewed_by 
        FOREIGN KEY (reviewed_by) 
        REFERENCES users(id) 
        ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_verifications_document_id (document_id),
    INDEX idx_verifications_status (status),
    INDEX idx_verifications_reviewed_by (reviewed_by),
    INDEX idx_verifications_created_at (created_at),
    INDEX idx_verifications_approved_at (approved_at),
    
    -- Composite Indexes
    INDEX idx_verifications_status_created (status, created_at),
    INDEX idx_verifications_document_status (document_id, status),
    
    -- Constraints
    CONSTRAINT chk_verifications_approval_consistency CHECK (
        (status = 'approved' AND approved_at IS NOT NULL) OR
        (status != 'approved')
    ),
    CONSTRAINT chk_verifications_rejection_reason CHECK (
        (status = 'rejected' AND rejection_reason IS NOT NULL) OR
        (status != 'rejected')
    ),
    CONSTRAINT chk_verifications_score_range CHECK (
        verification_score IS NULL OR 
        (verification_score >= 0 AND verification_score <= 100)
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Key Features:**
- ✅ Full verification workflow tracking
- ✅ Support for multiple verification attempts
- ✅ Rejection reason tracking
- ✅ Automated verification score support
- ✅ Temporal approvals (approved_until)
- ✅ Comprehensive audit trail

### 2.4 Table: `document_types` (Optional Configuration Table)

**Purpose:** Define allowed document types and validation rules

```sql
CREATE TABLE document_types (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    -- Type Definition
    type_code VARCHAR(50) NOT NULL UNIQUE COMMENT 'profile_picture, drivers_license, etc.',
    type_name VARCHAR(100) NOT NULL COMMENT 'Human-readable name',
    category VARCHAR(30) NOT NULL COMMENT 'identity, vehicle, certification, photo',
    
    -- Applicability
    applies_to VARCHAR(50) NOT NULL COMMENT 'user, vehicle, service_request',
    
    -- Validation Rules
    is_required BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Is this document mandatory?',
    requires_verification BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Does it need admin approval?',
    max_file_size_mb INT UNSIGNED NOT NULL DEFAULT 5 COMMENT 'Maximum file size in MB',
    allowed_mime_types JSON COMMENT '["image/jpeg", "image/png", "application/pdf"]',
    has_expiration BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Does this document expire?',
    
    -- Display
    icon VARCHAR(50) COMMENT 'Icon identifier for UI',
    display_order INT UNSIGNED NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Metadata
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_document_types_code (type_code),
    INDEX idx_document_types_category (category),
    INDEX idx_document_types_applies_to (applies_to),
    INDEX idx_document_types_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Initial Data:**
```sql
INSERT INTO document_types (type_code, type_name, category, applies_to, is_required, requires_verification, has_expiration, allowed_mime_types) VALUES
('profile_picture', 'Profile Picture', 'photo', 'user', FALSE, FALSE, FALSE, '["image/jpeg", "image/png", "image/webp"]'),
('drivers_license', 'Driver''s License', 'identity', 'user', TRUE, TRUE, TRUE, '["image/jpeg", "image/png", "application/pdf"]'),
('national_id', 'National ID', 'identity', 'user', TRUE, TRUE, FALSE, '["image/jpeg", "image/png", "application/pdf"]'),
('soat', 'SOAT Certificate', 'vehicle', 'vehicle', TRUE, TRUE, TRUE, '["image/jpeg", "image/png", "application/pdf"]'),
('technical_cert', 'Technical Certificate', 'vehicle', 'vehicle', TRUE, TRUE, TRUE, '["image/jpeg", "image/png", "application/pdf"]'),
('academic_cert', 'Academic Certificate', 'certification', 'user', TRUE, TRUE, FALSE, '["image/jpeg", "image/png", "application/pdf"]');
```

---

## 3. DOCUMENT TYPE DEFINITIONS

### 3.1 User Documents

| Type | Code | Required | Expires | Verification | Notes |
|------|------|----------|---------|--------------|-------|
| Profile Picture | `profile_picture` | No | No | No | Auto-approved |
| Driver's License | `drivers_license` | Yes (drivers) | Yes | Yes | Manual review |
| National ID | `national_id` | Yes | No | Yes | Manual review |

### 3.2 Vehicle Documents

| Type | Code | Required | Expires | Verification | Notes |
|------|------|----------|---------|--------------|-------|
| SOAT Certificate | `soat` | Yes | Yes | Yes | Insurance proof |
| Technical Certificate | `technical_cert` | Yes | Yes | Yes | Safety inspection |

### 3.3 Mechanic Documents

| Type | Code | Required | Expires | Verification | Notes |
|------|------|----------|---------|--------------|-------|
| Academic Certificate | `academic_cert` | Yes | No | Yes | Mandatory for mechanics |

---

## 4. MODIFIED TABLES

### 4.1 Table: `users` (Modifications)

**Changes:**
- Keep `profile_picture_url` for backward compatibility (deprecated)
- Add relationship to `documents` table via polymorphic key

**NO SCHEMA CHANGES NEEDED** - Handle via application logic

**Migration Strategy:**
1. Keep existing `profile_picture_url` column
2. When user uploads new profile picture, create document record
3. Update `profile_picture_url` to point to new document file_path
4. Phase out direct URL usage over time

### 4.2 Table: `vehicles` (Modifications)

**Changes:**
- Keep `primary_photo_url` for backward compatibility (deprecated)
- Add relationship to `documents` table via polymorphic key

**NO SCHEMA CHANGES NEEDED** - Handle via application logic

---

## 5. RELATIONSHIPS

### 5.1 Entity Relationship Diagram

```
users (1) ----< (N) documents [documentable_type='user']
  |                    |
  |                    |
  |                (1) |
  |                    |
  |                    v
  |                (N) document_verifications
  |
  +-- (1) reviewed_by --> (N) document_verifications
  |
  +-- (1) uploaded_by --> (N) documents

vehicles (1) ----< (N) documents [documentable_type='vehicle']

service_requests (1) ----< (N) documents [documentable_type='service_request']
```

### 5.2 Document Ownership Rules

**User Documents:**
- `documentable_type = 'user'`
- `documentable_id = user.id`
- Types: profile_picture, drivers_license, national_id, academic_cert

**Vehicle Documents:**
- `documentable_type = 'vehicle'`
- `documentable_id = vehicle.id`
- Types: soat, technical_cert
- Ownership verified through vehicle.user_id

**Service Request Documents:**
- `documentable_type = 'service_request'`
- `documentable_id = service_request.id`
- Types: incident_photo, completion_photo, receipt
- Optional for future enhancement

---

## 6. INDEXES STRATEGY

### 6.1 Query Patterns Analysis

**Most Common Queries:**
1. Get all documents for a user: `WHERE documentable_type='user' AND documentable_id=?`
2. Get user's driver license: `WHERE documentable_type='user' AND documentable_id=? AND document_type='drivers_license'`
3. Get pending verifications: `WHERE status='pending' ORDER BY created_at`
4. Get expired documents: `WHERE expiration_date < NOW() AND status='verified'`
5. Get all SOAT certificates expiring soon: `WHERE document_type='soat' AND expiration_date BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 30 DAY)`

### 6.2 Recommended Indexes

**Primary Indexes (already in schema):**
- `idx_documents_documentable` - Covers queries 1, 2
- `idx_documents_type` - Covers queries 5
- `idx_documents_owner_type` - Covers query 2 (composite)
- `idx_documents_type_status` - Covers query 5 with status filter

**Verification Indexes:**
- `idx_verifications_status_created` - Covers query 3
- `idx_verifications_document_status` - Join optimization

---

## 7. MIGRATION PLAN

### 7.1 Migration Sequence

**Migration 1:** Create `documents` table
**Migration 2:** Create `document_verifications` table
**Migration 3:** Create `document_types` table (optional)
**Migration 4:** Seed `document_types` with initial data
**Migration 5:** Data migration (migrate existing URLs)

### 7.2 Data Migration Strategy

**Phase 1: Create New Tables**
```sql
-- Execute migrations for documents, document_verifications, document_types
```

**Phase 2: Migrate Existing Data**
```sql
-- Migrate user profile pictures
INSERT INTO documents (documentable_type, documentable_id, document_type, document_category, 
                       file_name, file_path, file_size, mime_type, status, uploaded_by, created_at)
SELECT 'user', id, 'profile_picture', 'photo',
       SUBSTRING_INDEX(profile_picture_url, '/', -1),
       profile_picture_url,
       0, -- Unknown size
       'image/jpeg', -- Assumed
       'verified',
       id,
       created_at
FROM users
WHERE profile_picture_url IS NOT NULL AND profile_picture_url != '';

-- Migrate vehicle photos
INSERT INTO documents (documentable_type, documentable_id, document_type, document_category,
                       file_name, file_path, file_size, mime_type, status, uploaded_by, created_at)
SELECT 'vehicle', v.id, 'vehicle_photo', 'photo',
       SUBSTRING_INDEX(v.primary_photo_url, '/', -1),
       v.primary_photo_url,
       0,
       'image/jpeg',
       'verified',
       v.user_id,
       v.created_at
FROM vehicles v
WHERE v.primary_photo_url IS NOT NULL AND v.primary_photo_url != '';
```

**Phase 3: Update Application Code**
- Modify user profile to read from documents table
- Modify vehicle photo to read from documents table
- Keep backward compatibility during transition

**Phase 4: Deprecate Old Columns (Optional)**
- Mark `profile_picture_url` as deprecated
- Mark `primary_photo_url` as deprecated
- Remove in future major version

### 7.3 Rollback Plan

If migration fails:
1. Drop new tables: `document_verifications`, `documents`, `document_types`
2. Existing `users.profile_picture_url` and `vehicles.primary_photo_url` remain unchanged
3. No data loss (soft delete used)

---

## 8. BACKEND IMPACT

### 8.1 New Services Required

**DocumentService**
```php
app/Infrastructure/Document/DocumentService.php
- uploadDocument()
- getDocument()
- listDocuments()
- deleteDocument()
- updateDocument()
- checkExpiration()
```

**DocumentVerificationService**
```php
app/Infrastructure/Document/DocumentVerificationService.php
- submitForVerification()
- approveDocument()
- rejectDocument()
- getVerificationStatus()
- listPendingVerifications()
```

**DocumentStorageService**
```php
app/Infrastructure/Document/DocumentStorageService.php
- storeFile()
- retrieveFile()
- deleteFile()
- generateFileHash()
- validateFileType()
```

### 8.2 New Validators Required

**DocumentValidator**
```php
app/Infrastructure/Document/DocumentValidator.php
- validateUpload()
- validateFileType()
- validateFileSize()
- validateDocumentType()
- validateExpiration()
```

### 8.3 New Controllers Required

**DocumentController**
```php
app/Controllers/DocumentController.php
- upload()      // POST /api/documents
- show()        // GET /api/documents/{id}
- index()       // GET /api/documents
- destroy()     // DELETE /api/documents/{id}
- download()    // GET /api/documents/{id}/download
```

**DocumentVerificationController**
```php
app/Controllers/Admin/DocumentVerificationController.php
- index()       // GET /api/admin/verifications
- approve()     // POST /api/admin/verifications/{id}/approve
- reject()      // POST /api/admin/verifications/{id}/reject
```

### 8.4 Middleware Requirements

**New Middleware:**
- `DocumentOwnershipMiddleware` - Verify user owns the document
- `AdminVerificationMiddleware` - Verify user has verification permissions

### 8.5 API Endpoints

**Public Endpoints (Authenticated):**
```
POST   /api/documents                    - Upload document
GET    /api/documents                    - List user's documents
GET    /api/documents/{id}               - Get document details
DELETE /api/documents/{id}               - Delete document
GET    /api/documents/{id}/download      - Download document file
GET    /api/users/{id}/documents         - Get user's documents
GET    /api/vehicles/{id}/documents      - Get vehicle's documents
```

**Admin Endpoints:**
```
GET    /api/admin/verifications          - List pending verifications
POST   /api/admin/verifications/{id}/approve  - Approve document
POST   /api/admin/verifications/{id}/reject   - Reject document
GET    /api/admin/documents/expired      - List expired documents
```

### 8.6 Storage Configuration

**Recommended Storage Strategy:**
```php
// config/storage.php
return [
    'driver' => env('STORAGE_DRIVER', 'local'), // local, s3, cloudinary
    'local' => [
        'root' => __DIR__ . '/../storage/documents',
        'url' => env('APP_URL') . '/storage/documents',
    ],
    's3' => [
        'bucket' => env('AWS_BUCKET'),
        'region' => env('AWS_REGION'),
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
    ],
    'max_file_size' => 5 * 1024 * 1024, // 5MB
    'allowed_types' => ['image/jpeg', 'image/png', 'application/pdf'],
];
```

**Directory Structure:**
```
storage/
  documents/
    users/
      {user_id}/
        profile/
        identity/
        certifications/
    vehicles/
      {vehicle_id}/
        soat/
        technical/
    temp/  -- For processing
```

---

## 9. FRONTEND IMPACT

### 9.1 New Components Required

**Document Upload:**
```typescript
// frontend/src/components/documents/DocumentUploader.tsx
// frontend/src/components/documents/DocumentList.tsx
// frontend/src/components/documents/DocumentCard.tsx
// frontend/src/components/documents/DocumentPreview.tsx
// frontend/src/components/documents/DocumentVerificationBadge.tsx
```

**Admin Verification:**
```typescript
// frontend/src/pages/admin/DocumentVerificationPage.tsx
// frontend/src/components/admin/VerificationQueue.tsx
// frontend/src/components/admin/DocumentReviewer.tsx
```

### 9.2 New Services Required

**DocumentService:**
```typescript
// frontend/src/services/documentService.ts
- uploadDocument(file, type, metadata)
- getDocuments(filter)
- getDocument(id)
- deleteDocument(id)
- downloadDocument(id)
```

### 9.3 New Context/State

**DocumentContext:**
```typescript
// frontend/src/contexts/DocumentContext.tsx
- documents[]
- isUploading
- uploadProgress
- uploadDocument()
- refreshDocuments()
- deleteDocument()
```

### 9.4 Type Definitions

**New Types:**
```typescript
// frontend/src/types/document.ts
interface Document {
  id: number;
  documentableType: 'user' | 'vehicle' | 'service_request';
  documentableId: number;
  documentType: string;
  documentCategory: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  fileHash?: string;
  title?: string;
  description?: string;
  issueDate?: string;
  expirationDate?: string;
  status: 'pending' | 'verified' | 'rejected' | 'expired';
  isPrimary: boolean;
  uploadedBy: number;
  createdAt: string;
  updatedAt: string;
}

interface DocumentVerification {
  id: number;
  documentId: number;
  status: 'pending' | 'approved' | 'rejected' | 'requires_reupload';
  verificationType: string;
  reviewedBy?: number;
  reviewerNotes?: string;
  rejectionReason?: string;
  approvedAt?: string;
  createdAt: string;
}
```

### 9.5 UI Flow Changes

**User Profile:**
- Add "Documents" section
- Upload driver's license, national ID
- View verification status
- Download documents

**Mechanic Profile:**
- Add "Certifications" section (mandatory)
- Upload academic certificates
- Verification badge display

**Vehicle Detail:**
- Add "Documents" tab
- Upload SOAT, technical certificate
- Expiration alerts

**Admin Panel (New):**
- Document verification queue
- Approve/reject interface
- Bulk operations

---

## 10. SECURITY CONSIDERATIONS

### 10.1 File Upload Security

**Validation:**
- ✅ File type whitelist (no executable files)
- ✅ File size limits (5MB default, configurable)
- ✅ Filename sanitization
- ✅ Virus scanning (recommended with ClamAV)
- ✅ SHA-256 hash for integrity

**Storage:**
- ✅ Files stored outside web root
- ✅ No direct file access (serve through controller)
- ✅ Signed URLs with expiration (for S3/CDN)
- ✅ Access control (ownership verification)

**Privacy:**
- ✅ Documents accessible only to owner + admins
- ✅ Audit log for document access
- ✅ GDPR compliance (right to deletion)

### 10.2 Access Control Rules

| User Type | Can Upload | Can View | Can Delete | Can Verify |
|-----------|------------|----------|------------|------------|
| Customer | Own docs | Own docs | Own docs | No |
| Mechanic | Own docs | Own docs | Own docs | No |
| Admin | Any docs | All docs | Any docs | Yes |
| Super Admin | Any docs | All docs | Any docs | Yes |

---

## 11. PERFORMANCE CONSIDERATIONS

### 11.1 File Storage Strategy

**Small Scale (MVP):**
- Local filesystem storage
- Direct file serving through PHP
- Simple and fast for < 10k documents

**Medium Scale:**
- S3 or equivalent object storage
- Signed URLs with expiration
- CDN for document delivery
- Lazy loading thumbnails

**Large Scale:**
- Dedicated document microservice
- Image optimization (thumbnails, WebP)
- Distributed storage (multi-region)
- Async processing for large files

### 11.2 Database Performance

**Document Queries:**
- Most queries use indexed fields
- Polymorphic queries efficient with composite index
- Expiration checks can be cached

**Recommended Caching:**
```php
// Cache user's verified documents for 1 hour
Cache::remember("user:{$userId}:documents:verified", 3600, function() {
    return DocumentService::getVerifiedDocuments($userId);
});

// Cache document verification status
Cache::remember("document:{$documentId}:status", 600, function() {
    return DocumentVerificationService::getStatus($documentId);
});
```

### 11.3 Expected Query Performance

**Benchmark Estimates (1000 documents):**
- Get user documents: < 10ms
- Get document by ID: < 5ms
- List pending verifications: < 15ms
- Check expiring documents: < 20ms

---

## 12. ESTIMATED IMPLEMENTATION EFFORT

### 12.1 Backend Development

| Task | Effort | Priority |
|------|--------|----------|
| Create migrations | 2 hours | High |
| DocumentService | 4 hours | High |
| DocumentVerificationService | 3 hours | High |
| DocumentStorageService | 4 hours | High |
| DocumentController | 3 hours | High |
| DocumentVerificationController | 2 hours | Medium |
| Validators | 2 hours | High |
| Middleware | 1 hour | Medium |
| Tests | 4 hours | Medium |
| **Total Backend** | **25 hours** | |

### 12.2 Frontend Development

| Task | Effort | Priority |
|------|--------|----------|
| Document types | 1 hour | High |
| DocumentService | 2 hours | High |
| DocumentContext | 2 hours | High |
| DocumentUploader component | 4 hours | High |
| DocumentList component | 2 hours | High |
| DocumentCard component | 2 hours | High |
| DocumentPreview component | 3 hours | Medium |
| Profile integration | 2 hours | High |
| Vehicle integration | 2 hours | High |
| Admin verification page | 4 hours | Medium |
| Tests | 3 hours | Low |
| **Total Frontend** | **27 hours** | |

### 12.3 Total Effort

**Total Estimated Hours:** 52 hours (6.5 days @ 8 hours/day)

**Recommended Phasing:**
- **Phase 1 (MVP):** Backend + Basic Upload (20 hours)
- **Phase 2:** Frontend Integration (15 hours)
- **Phase 3:** Admin Verification (10 hours)
- **Phase 4:** Polish + Tests (7 hours)

---

## 13. MIGRATION CHECKLIST

**Before Migration:**
- [ ] Backup database
- [ ] Create storage directories
- [ ] Configure file upload limits in php.ini
- [ ] Test on staging environment

**Migration Steps:**
- [ ] Run migration 1: Create `documents` table
- [ ] Run migration 2: Create `document_verifications` table
- [ ] Run migration 3: Create `document_types` table
- [ ] Run migration 4: Seed document types
- [ ] Run migration 5: Migrate existing data
- [ ] Verify data integrity

**Post-Migration:**
- [ ] Test document upload
- [ ] Test document retrieval
- [ ] Test verification workflow
- [ ] Monitor for errors
- [ ] Update API documentation

---

## 14. RISKS & MITIGATION

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Storage space exhaustion | High | Medium | Implement file size limits, cleanup old files |
| Slow file uploads | Medium | High | Use async processing, show progress |
| Invalid file types uploaded | High | Medium | Strict validation, virus scanning |
| Privacy breach | Critical | Low | Access control, audit logging |
| Database performance | Medium | Low | Proper indexing, query optimization |
| Migration failure | High | Low | Rollback plan, staging test |

---

## 15. CONCLUSION

This document management system provides a robust foundation for handling all document types in P.A.R.C.E:

✅ **Flexible:** Polymorphic design supports documents for any entity  
✅ **Secure:** Access control, file validation, audit trail  
✅ **Scalable:** Indexed queries, caching strategy, storage abstraction  
✅ **Maintainable:** Clean separation of concerns, well-documented  
✅ **Feature-Rich:** Verification workflow, expiration tracking, multiple documents per entity  

**Next Steps:**
1. Review and approve this proposal
2. Create migrations
3. Implement backend services
4. Implement frontend components
5. Test thoroughly
6. Deploy to staging
7. Deploy to production

---

**Document Status:** PROPOSED - AWAITING APPROVAL  
**Last Updated:** 2024-01-XX  
**Version:** 2.0.0
