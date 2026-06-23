# Design Document: Vehicle & Service Data Model (Fase 13)

## Overview

This design extends existing PHP 8.2 MVC backend tables and services to support documentary validation for vehicles (SOAT, Tecnomecánica), driver license validation for mechanics, detailed ratings, and photographic evidence for service requests. All changes are additive — existing behavior is preserved through nullable columns, optional fields, and backward-compatible method signatures.

**Stack:** PHP 8.2 custom MVC, MySQL 8.0+, React/TypeScript/Vite frontend.  
**Affected layers:** Migrations → Services → Validators → Controllers → Frontend types/services/components.

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                  HTTP REQUEST                        │
└──────────────────────┬──────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│  AuthMiddleware + RBACMiddleware (unchanged)         │
└──────────────────────┬──────────────────────────────┘
                       ↓
┌──────────────────────────────────────────────────────────────┐
│  CONTROLLERS (modified/new)                                   │
│  VehicleController        — store(), update()  [modified]    │
│  ServiceRequestController — rate(), addEvidence() [modified] │
└──────────────┬──────────────────────────────────────────────┘
               ↓
┌──────────────────────────────────────────────────────────────┐
│  VALIDATORS (modified/new)                                    │
│  VehicleValidator        — validateCreate/Update  [modified] │
│  ServiceRequestValidator — validateRating         [modified] │
│  (inline in EvidenceService for evidence validation)          │
└──────────────┬──────────────────────────────────────────────┘
               ↓
┌──────────────────────────────────────────────────────────────┐
│  SERVICES (modified/new)                                      │
│  VehicleService             — create(), update()  [modified] │
│  ServiceRequestService      — accept(), rate(),              │
│                               getById()           [modified] │
│  ServiceRequestEvidenceService — addEvidence(),              │
│                                  getEvidences()   [NEW]      │
└──────────────┬──────────────────────────────────────────────┘
               ↓
┌──────────────────────────────────────────────────────────────┐
│  DATABASE (App\Core\Database — unchanged)                     │
│  vehicles              [ALTER — 8 new columns]               │
│  users                 [ALTER — 4 new columns]               │
│  service_requests      [ALTER — 2 new columns + 2 CHECKs]   │
│  service_request_evidences  [CREATE TABLE — new]             │
└──────────────────────────────────────────────────────────────┘
```

---

## Database Schema Changes

### Migration 1: `2026_01_01_000005_add_document_fields_to_vehicles.php`

```sql
ALTER TABLE vehicles
  ADD COLUMN soat_number             VARCHAR(50)  NULL AFTER tecnomecanica_uploaded_at,
  ADD COLUMN soat_expiration_date    DATE         NULL,
  ADD COLUMN soat_document_url       VARCHAR(500) NULL,
  ADD COLUMN soat_uploaded_at        TIMESTAMP    NULL,
  ADD COLUMN tecnomecanica_number    VARCHAR(50)  NULL,
  ADD COLUMN tecnomecanica_expiration_date DATE   NULL,
  ADD COLUMN tecnomecanica_document_url VARCHAR(500) NULL,
  ADD COLUMN tecnomecanica_uploaded_at  TIMESTAMP NULL;
```

**down():** `ALTER TABLE vehicles DROP COLUMN soat_number, DROP COLUMN soat_expiration_date, DROP COLUMN soat_document_url, DROP COLUMN soat_uploaded_at, DROP COLUMN tecnomecanica_number, DROP COLUMN tecnomecanica_expiration_date, DROP COLUMN tecnomecanica_document_url, DROP COLUMN tecnomecanica_uploaded_at`

---

### Migration 2: `2026_01_01_000006_add_driver_license_to_users.php`

```sql
ALTER TABLE users
  ADD COLUMN driver_license_number          VARCHAR(50)  NULL,
  ADD COLUMN driver_license_expiration_date DATE         NULL,
  ADD COLUMN driver_license_document_url    VARCHAR(500) NULL,
  ADD COLUMN driver_license_uploaded_at     TIMESTAMP    NULL;
```

**down():** `ALTER TABLE users DROP COLUMN driver_license_number, DROP COLUMN driver_license_expiration_date, DROP COLUMN driver_license_document_url, DROP COLUMN driver_license_uploaded_at`

---

### Migration 3: `2026_01_01_000007_add_detailed_ratings_to_service_requests.php`

```sql
ALTER TABLE service_requests
  ADD COLUMN punctuality_rating    TINYINT UNSIGNED NULL,
  ADD COLUMN service_quality_rating TINYINT UNSIGNED NULL,
  ADD CONSTRAINT chk_punctuality_rating
    CHECK (punctuality_rating IS NULL OR (punctuality_rating >= 1 AND punctuality_rating <= 5)),
  ADD CONSTRAINT chk_service_quality_rating
    CHECK (service_quality_rating IS NULL OR (service_quality_rating >= 1 AND service_quality_rating <= 5));
```

**down():**
```sql
ALTER TABLE service_requests
  DROP CHECK chk_punctuality_rating,
  DROP CHECK chk_service_quality_rating,
  DROP COLUMN punctuality_rating,
  DROP COLUMN service_quality_rating;
```

---

### Migration 4: `2026_01_01_000008_create_service_request_evidences_table.php`

```sql
CREATE TABLE service_request_evidences (
  id                 BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  service_request_id BIGINT UNSIGNED NOT NULL,
  uploaded_by        BIGINT UNSIGNED NOT NULL,
  evidence_type      ENUM('before', 'during', 'after') NOT NULL,
  image_url          VARCHAR(500) NOT NULL,
  original_filename  VARCHAR(255) NULL,
  file_size          INT UNSIGNED NULL,
  created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_service_request_id (service_request_id),

  CONSTRAINT fk_evidence_service_request
    FOREIGN KEY (service_request_id)
    REFERENCES service_requests(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_evidence_user
    FOREIGN KEY (uploaded_by)
    REFERENCES users(id)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**down():** `DROP TABLE service_request_evidences`

---

## Components and Interfaces

### Component 1: VehicleValidator (modified)

**File:** `app/Infrastructure/Vehicle/VehicleValidator.php`  
**Change:** Add validation for 6 new optional documentary fields in both `validateCreateRequest()` and `validateUpdateRequest()`.

```php
// New validation rules added to both methods:

// soat_number (optional, max 50)
$soatNumber = $request->input('soat_number');
if ($soatNumber !== null && strlen($soatNumber) > 50) {
    $errors['soat_number'] = 'SOAT number must not exceed 50 characters';
}

// soat_expiration_date (optional, YYYY-MM-DD)
$soatDate = $request->input('soat_expiration_date');
if ($soatDate !== null) {
    $parsed = \DateTime::createFromFormat('Y-m-d', $soatDate);
    if (!$parsed || $parsed->format('Y-m-d') !== $soatDate) {
        $errors['soat_expiration_date'] = 'SOAT expiration date must be in YYYY-MM-DD format';
    }
}

// soat_document_url (optional, valid URL, max 500)
$soatUrl = $request->input('soat_document_url');
if ($soatUrl !== null) {
    if (strlen($soatUrl) > 500 || !filter_var($soatUrl, FILTER_VALIDATE_URL)) {
        $errors['soat_document_url'] = 'SOAT document URL must be a valid URL not exceeding 500 characters';
    }
}

// Same pattern for tecnomecanica_number, tecnomecanica_expiration_date, tecnomecanica_document_url
```

---

### Component 2: VehicleService (modified)

**File:** `app/Infrastructure/Vehicle/VehicleService.php`  
**Changes:**
1. Accept and persist documentary fields in `create()` and `update()`.
2. Auto-set `*_uploaded_at` timestamps when corresponding URL is provided.
3. Call `validateDocumentExpiry()` when `status = 'active'` is set.

```php
// New private helper:
private function validateDocumentExpiry(array $vehicleRow): void
{
    $today = date('Y-m-d');

    if (!empty($vehicleRow['soat_expiration_date'])
        && $vehicleRow['soat_expiration_date'] < $today) {
        throw new \Exception(
            'El SOAT del vehículo está vencido. No se puede activar el vehículo.'
        );
    }

    if (!empty($vehicleRow['tecnomecanica_expiration_date'])
        && $vehicleRow['tecnomecanica_expiration_date'] < $today) {
        throw new \Exception(
            'La Tecnomecánica del vehículo está vencida. No se puede activar el vehículo.'
        );
    }
}

// In create(): collect optional doc fields before insert
$docFields = [
    'soat_number', 'soat_expiration_date', 'soat_document_url',
    'tecnomecanica_number', 'tecnomecanica_expiration_date', 'tecnomecanica_document_url',
];
foreach ($docFields as $field) {
    if (isset($data[$field])) {
        $insertData[$field] = $data[$field];
    }
}
if (!empty($insertData['soat_document_url'])) {
    $insertData['soat_uploaded_at'] = date('Y-m-d H:i:s');
}
if (!empty($insertData['tecnomecanica_document_url'])) {
    $insertData['tecnomecanica_uploaded_at'] = date('Y-m-d H:i:s');
}
// validateDocumentExpiry before insert when status defaults to active
$this->validateDocumentExpiry($insertData);

// In update(): same doc field collection + call validateDocumentExpiry
// when $data['status'] === 'active' or current vehicle status is active and doc dates change
```

**Expiry check trigger rules:**
- `create()`: always check — new vehicles default to `status = 'active'`
- `update()`: check only when `status = 'active'` is present in `$data`, OR when updating a document date on a vehicle that is already `active`

---

### Component 3: ServiceRequestService (modified)

**File:** `app/Infrastructure/ServiceRequest/ServiceRequestService.php`

**Change A — `accept()`: driver license validation**
```php
// Add before the status update:
$mechanic = Database::fetchOne(
    'SELECT driver_license_expiration_date FROM users WHERE id = ?',
    [$mechanicId]
);

if ($mechanic !== null
    && !empty($mechanic['driver_license_expiration_date'])
    && $mechanic['driver_license_expiration_date'] < date('Y-m-d')) {
    throw new \Exception(
        'La licencia de conducción del mecánico está vencida. No puede aceptar solicitudes.'
    );
}
```

**Change B — `rate()`: accept optional detailed ratings**
```php
// Extend method signature:
public function rate(
    int $requestId,
    int $customerId,
    int $rating,
    ?string $feedback = null,
    ?int $punctualityRating = null,
    ?int $serviceQualityRating = null
): bool

// Extend updateData:
if ($punctualityRating !== null) {
    $updateData['punctuality_rating'] = $punctualityRating;
}
if ($serviceQualityRating !== null) {
    $updateData['service_quality_rating'] = $serviceQualityRating;
}
```

**Change C — `getById()`: include evidences**
```php
// After fetching the service request, load evidences:
$evidences = Database::fetchAll(
    'SELECT id, uploaded_by, evidence_type, image_url,
            original_filename, file_size, created_at
     FROM service_request_evidences
     WHERE service_request_id = ?
     ORDER BY created_at ASC',
    [$requestId]
);
$request['evidences'] = $evidences;
```

---

### Component 4: ServiceRequestValidator (modified)

**File:** `app/Infrastructure/ServiceRequest/ServiceRequestValidator.php`

**Change — `validateRatingRequest()`: add optional rating fields**
```php
// Add after existing customer_rating validation:

$punctualityRating = $request->input('punctuality_rating');
if ($punctualityRating !== null) {
    if (!is_numeric($punctualityRating)
        || (int)$punctualityRating < 1
        || (int)$punctualityRating > 5) {
        $errors['punctuality_rating'] = 'Punctuality rating must be an integer between 1 and 5';
    }
}

$serviceQualityRating = $request->input('service_quality_rating');
if ($serviceQualityRating !== null) {
    if (!is_numeric($serviceQualityRating)
        || (int)$serviceQualityRating < 1
        || (int)$serviceQualityRating > 5) {
        $errors['service_quality_rating'] = 'Service quality rating must be an integer between 1 and 5';
    }
}
```

---

### Component 5: ServiceRequestEvidenceService (NEW)

**File:** `app/Infrastructure/ServiceRequest/ServiceRequestEvidenceService.php`  
**Namespace:** `App\Infrastructure\ServiceRequest`

```php
namespace App\Infrastructure\ServiceRequest;

use App\Core\Database;

class ServiceRequestEvidenceService
{
    private const MAX_FILE_SIZE = 5242880; // 5 MB
    private const VALID_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];
    private const VALID_EVIDENCE_TYPES = ['before', 'during', 'after'];
    private const VALID_STATUSES = ['assigned', 'in_progress', 'completed'];

    /**
     * Add a photographic evidence record to a service request.
     *
     * @param int   $serviceRequestId
     * @param int   $mechanicId
     * @param array $data  Keys: evidence_type, image_url, original_filename?, file_size?
     * @return array Inserted evidence record
     * @throws \Exception On validation or access failure
     */
    public function addEvidence(
        int $serviceRequestId,
        int $mechanicId,
        array $data
    ): array {
        // 1. Fetch request and verify mechanic assignment + valid status
        $serviceRequest = Database::fetchOne(
            'SELECT id, mechanic_id, status FROM service_requests WHERE id = ? AND deleted_at IS NULL',
            [$serviceRequestId]
        );

        if ($serviceRequest === null) {
            throw new \Exception('Service request not found.');
        }

        if ((int)$serviceRequest['mechanic_id'] !== $mechanicId) {
            throw new \Exception('No está asignado a esta solicitud de servicio.');
        }

        if (!in_array($serviceRequest['status'], self::VALID_STATUSES, true)) {
            throw new \Exception(
                'Solo se pueden agregar evidencias a solicitudes en estado assigned, in_progress o completed.'
            );
        }

        // 2. Validate evidence_type
        if (!in_array($data['evidence_type'] ?? '', self::VALID_EVIDENCE_TYPES, true)) {
            throw new \InvalidArgumentException(
                'evidence_type must be one of: before, during, after.'
            );
        }

        // 3. Validate image_url
        $imageUrl = $data['image_url'] ?? '';
        if (strlen($imageUrl) > 500
            || !filter_var($imageUrl, FILTER_VALIDATE_URL)
            || !preg_match('/^https?:\/\//i', $imageUrl)) {
            throw new \InvalidArgumentException(
                'image_url must be a valid http/https URL not exceeding 500 characters.'
            );
        }

        // 4. Validate file extension
        $path = strtolower(parse_url($imageUrl, PHP_URL_PATH) ?? '');
        $ext  = pathinfo($path, PATHINFO_EXTENSION);
        if (!in_array($ext, self::VALID_EXTENSIONS, true)) {
            throw new \InvalidArgumentException(
                'Image URL must point to a file with extension: jpg, jpeg, png, or webp.'
            );
        }

        // 5. Validate file_size if provided
        if (isset($data['file_size']) && (int)$data['file_size'] > self::MAX_FILE_SIZE) {
            throw new \InvalidArgumentException(
                'file_size must not exceed 5242880 bytes (5 MB).'
            );
        }

        // 6. Insert
        $insertData = [
            'service_request_id' => $serviceRequestId,
            'uploaded_by'        => $mechanicId,
            'evidence_type'      => $data['evidence_type'],
            'image_url'          => $imageUrl,
        ];

        if (!empty($data['original_filename'])) {
            $insertData['original_filename'] = $data['original_filename'];
        }

        if (isset($data['file_size'])) {
            $insertData['file_size'] = (int)$data['file_size'];
        }

        $evidenceId = Database::insert('service_request_evidences', $insertData);

        return Database::fetchOne(
            'SELECT id, service_request_id, uploaded_by, evidence_type,
                    image_url, original_filename, file_size, created_at
             FROM service_request_evidences WHERE id = ?',
            [$evidenceId]
        );
    }

    /**
     * Get all evidences for a service request ordered by creation time.
     *
     * @param int $serviceRequestId
     * @return array
     */
    public function getEvidences(int $serviceRequestId): array
    {
        return Database::fetchAll(
            'SELECT id, uploaded_by, evidence_type, image_url,
                    original_filename, file_size, created_at
             FROM service_request_evidences
             WHERE service_request_id = ?
             ORDER BY created_at ASC',
            [$serviceRequestId]
        );
    }
}
```

---

### Component 6: ServiceRequestController (modified)

**File:** `app/Controllers/ServiceRequestController.php`

**Change A — `rate()`: extract and pass new rating fields**
```php
// Add inside rate() after existing $feedback extraction:
$punctualityRating = $request->input('punctuality_rating') !== null
    ? (int)$request->input('punctuality_rating')
    : null;

$serviceQualityRating = $request->input('service_quality_rating') !== null
    ? (int)$request->input('service_quality_rating')
    : null;

// Update call:
$this->serviceRequestService->rate(
    $id, $userId, $rating, $feedback,
    $punctualityRating, $serviceQualityRating
);
```

**Change B — `addEvidence()`: new method**
```php
/**
 * Add photographic evidence to a service request
 * POST /api/mechanic/requests/{id}/evidences
 */
public function addEvidence(Request $request, int $id): Response
{
    try {
        $contentTypeResult = RequestValidator::validateContentType($request, 'POST');
        if (!$contentTypeResult['valid']) {
            return ResponseFormatter::error(
                $contentTypeResult['error'], null, $contentTypeResult['statusCode']
            );
        }

        $jsonResult = RequestValidator::parseJsonBody($request);
        if (!$jsonResult['valid']) {
            return ResponseFormatter::error(
                $jsonResult['error'], null, $jsonResult['statusCode']
            );
        }

        $mechanicId    = $request->getAttribute('userId');
        $evidenceService = new \App\Infrastructure\ServiceRequest\ServiceRequestEvidenceService();

        $data = [
            'evidence_type'     => $request->input('evidence_type'),
            'image_url'         => $request->input('image_url'),
            'original_filename' => $request->input('original_filename'),
            'file_size'         => $request->input('file_size'),
        ];

        $evidence = $evidenceService->addEvidence($id, $mechanicId, $data);

        return ResponseFormatter::success(['evidence' => $evidence], 'Evidence added successfully', 201);

    } catch (\InvalidArgumentException $e) {
        return ResponseFormatter::validationError(['evidence' => $e->getMessage()]);
    } catch (\Exception $e) {
        return ErrorHandler::handleException($e);
    }
}
```

---

### Component 7: VehicleController (modified)

**File:** `app/Controllers/VehicleController.php`

**Change — `store()` and `update()`: extract new document fields**
```php
// Additional optional fields to extract in store() and update():
$docFields = [
    'soat_number', 'soat_expiration_date', 'soat_document_url',
    'tecnomecanica_number', 'tecnomecanica_expiration_date', 'tecnomecanica_document_url',
];

foreach ($docFields as $field) {
    $value = $request->input($field);
    if ($value !== null) {
        $data[$field] = RequestValidator::sanitizeString((string)$value);
    }
}
```

---

### Component 8: New Route

**File:** `config/routes.php`

```php
// Add inside the mechanic routes section:
$router->post(
    '/api/mechanic/requests/{id}/evidences',
    [\App\Controllers\ServiceRequestController::class, 'addEvidence']
)->middleware([
    \App\Middleware\AuthMiddleware::class,
    [\App\Middleware\RBACMiddleware::class, ['mechanic']]
]);
```

---

## Frontend Changes

### Types

**`frontend/src/types/vehicle.ts`** — Add optional documentary fields:
```typescript
export interface Vehicle {
  // ... existing fields ...
  soatNumber?: string | null
  soatExpirationDate?: string | null       // 'YYYY-MM-DD'
  soatDocumentUrl?: string | null
  soatUploadedAt?: string | null
  tecnomecanicaNumber?: string | null
  tecnomecanicaExpirationDate?: string | null
  tecnomecanicaDocumentUrl?: string | null
  tecnomecanicaUploadedAt?: string | null
}

export interface VehicleFormData {
  // ... existing fields ...
  soatNumber?: string
  soatExpirationDate?: string
  soatDocumentUrl?: string
  tecnomecanicaNumber?: string
  tecnomecanicaExpirationDate?: string
  tecnomecanicaDocumentUrl?: string
}
```

**`frontend/src/types/serviceRequest.ts`** — Add ratings and evidences:
```typescript
export interface ServiceRequestEvidence {
  id: number
  serviceRequestId: number
  uploadedBy: number
  evidenceType: 'before' | 'during' | 'after'
  imageUrl: string
  originalFilename?: string | null
  fileSize?: number | null
  createdAt: string
}

export interface ServiceRequest {
  // ... existing fields ...
  punctualityRating?: number | null
  serviceQualityRating?: number | null
  evidences?: ServiceRequestEvidence[]
}

export interface RatingFormData {
  customerRating: number              // required (1-5)
  customerFeedback?: string           // optional
  punctualityRating?: number          // optional (1-5)
  serviceQualityRating?: number       // optional (1-5)
}
```

**`frontend/src/types/auth.ts`** — Add mechanic license fields to user type:
```typescript
export interface User {
  // ... existing fields ...
  driverLicenseNumber?: string | null
  driverLicenseExpirationDate?: string | null
  driverLicenseDocumentUrl?: string | null
}
```

---

### Services

**`frontend/src/services/vehicleService.ts`** — existing `create`/`update` calls already pass the full form object; no structural change needed — just ensure the new fields flow through.

**`frontend/src/services/serviceRequestService.ts`** — Add evidence endpoint:
```typescript
export async function addEvidence(
  requestId: number,
  data: {
    evidenceType: 'before' | 'during' | 'after'
    imageUrl: string
    originalFilename?: string
    fileSize?: number
  }
): Promise<ApiResponse<{ evidence: ServiceRequestEvidence }>> {
  return apiClient.post(`/mechanic/requests/${requestId}/evidences`, {
    evidence_type: data.evidenceType,
    image_url: data.imageUrl,
    original_filename: data.originalFilename,
    file_size: data.fileSize,
  })
}
```

---

### Components

**Vehicle Form (`src/components/vehicles/` or `src/pages/customer/`):**
- Add 6 new optional fields grouped in a "Documentos del vehículo" section:
  - SOAT: number input, date picker, URL input
  - Tecnomecánica: number input, date picker, URL input

**Mechanic Profile:**
- Add 3 new optional fields in a "Licencia de conducción" section:
  - License number input, expiration date picker, document URL input

**Service Request Detail:**
- Add "Evidencias" section displaying evidence cards grouped by type (before/during/after)
- Mechanic view: show upload form with `evidence_type`, `image_url`, `original_filename`, `file_size`

**Rating Form (customer, after service completion):**
- Keep existing `customer_rating` (star selector, required)
- Add optional `punctuality_rating` (star selector)
- Add optional `service_quality_rating` (star selector)
- Keep optional `customer_feedback` textarea

---

## Algorithmic Pseudocode

### Document Expiry Validation (VehicleService)

```
function validateDocumentExpiry(vehicleData):
    today = date('Y-m-d')

    if vehicleData.soat_expiration_date is NOT NULL:
        if vehicleData.soat_expiration_date < today:
            THROW Exception('El SOAT del vehículo está vencido. No se puede activar el vehículo.')

    if vehicleData.tecnomecanica_expiration_date is NOT NULL:
        if vehicleData.tecnomecanica_expiration_date < today:
            THROW Exception('La Tecnomecánica del vehículo está vencida. No se puede activar el vehículo.')
```

**Preconditions:** `vehicleData` contains current values including any pending updates.  
**Postconditions:** If no exception is thrown, all document dates are valid or NULL.

---

### Driver License Check (ServiceRequestService.accept)

```
function accept(requestId, mechanicId):
    request = DB.fetchOne('SELECT id, status FROM service_requests WHERE id = ?')
    IF request is NULL OR status != 'pending':
        THROW 'Only pending requests can be accepted'

    mechanic = DB.fetchOne('SELECT driver_license_expiration_date FROM users WHERE id = ?')
    IF mechanic.driver_license_expiration_date is NOT NULL:
        IF mechanic.driver_license_expiration_date < date('Y-m-d'):
            THROW 'La licencia de conducción del mecánico está vencida. No puede aceptar solicitudes.'

    DB.update('service_requests', {status: assigned, mechanic_id, assigned_at})
    RETURN true
```

**Postconditions:** If no exception, mechanic has a valid (or unset) license and the request is now `assigned`.

---

### Evidence Validation (ServiceRequestEvidenceService.addEvidence)

```
function addEvidence(serviceRequestId, mechanicId, data):
    request = DB.fetchOne(...)
    ASSERT request.mechanic_id == mechanicId           // else 'No está asignado...'
    ASSERT request.status IN [assigned, in_progress, completed]
    ASSERT data.evidence_type IN [before, during, after]
    ASSERT len(data.image_url) <= 500 AND is_valid_url(data.image_url)
    ASSERT extension(data.image_url) IN [jpg, jpeg, png, webp]
    IF data.file_size PROVIDED:
        ASSERT data.file_size <= 5242880

    DB.insert('service_request_evidences', {...})
    RETURN inserted record
```

---

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| All new columns are `NULL` | Ensures full backward compatibility — existing rows and requests without documents are unaffected |
| `*_uploaded_at` set server-side | Client cannot forge audit timestamps; set automatically when URL is provided |
| CHECK constraints in DB for ratings | Defense-in-depth — DB enforces 1-5 range even if application validation is bypassed |
| Evidence validation entirely in service layer | Keeps controller thin; validation logic testable independently |
| Mechanic license check only in `accept()` | Scope-limited to spec requirements; `start()` and `complete()` not in scope per requirements |
| Evidences loaded via secondary query in `getById()` | Avoids complex JOIN with repeated parent columns; clean array structure in response |
| No file upload infrastructure | MVP scope: system receives URLs only; file storage is out of scope |

## Data Models

### vehicles (extended)

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| soat_number | VARCHAR(50) | YES | SOAT certificate number |
| soat_expiration_date | DATE | YES | Expiry; if past today, blocks `status='active'` |
| soat_document_url | VARCHAR(500) | YES | URL to SOAT image |
| soat_uploaded_at | TIMESTAMP | YES | Set server-side when URL is provided |
| tecnomecanica_number | VARCHAR(50) | YES | Tecnomecánica certificate number |
| tecnomecanica_expiration_date | DATE | YES | Expiry; if past today, blocks `status='active'` |
| tecnomecanica_document_url | VARCHAR(500) | YES | URL to Tecnomecánica image |
| tecnomecanica_uploaded_at | TIMESTAMP | YES | Set server-side when URL is provided |

All existing columns remain unchanged.

---

### users (extended)

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| driver_license_number | VARCHAR(50) | YES | Mechanic's license number |
| driver_license_expiration_date | DATE | YES | Expiry; if past today, blocks `accept()` |
| driver_license_document_url | VARCHAR(500) | YES | URL to license image |
| driver_license_uploaded_at | TIMESTAMP | YES | Set server-side when URL is provided |

All existing columns remain unchanged.

---

### service_requests (extended)

| Column | Type | Nullable | Constraint | Notes |
|--------|------|----------|------------|-------|
| punctuality_rating | TINYINT UNSIGNED | YES | CHECK: NULL OR 1-5 | Optional punctuality rating |
| service_quality_rating | TINYINT UNSIGNED | YES | CHECK: NULL OR 1-5 | Optional work quality rating |

Existing `customer_rating TINYINT UNSIGNED NULL` and `customer_feedback TEXT NULL` are unchanged.

---

### service_request_evidences (new table)

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| id | BIGINT UNSIGNED | NO | Auto-increment PK |
| service_request_id | BIGINT UNSIGNED | NO | FK → service_requests.id ON DELETE CASCADE |
| uploaded_by | BIGINT UNSIGNED | NO | FK → users.id (mechanic) |
| evidence_type | ENUM('before','during','after') | NO | Phase of service |
| image_url | VARCHAR(500) | NO | Must be http/https URL ending in .jpg/.jpeg/.png/.webp |
| original_filename | VARCHAR(255) | YES | Original file name for audit |
| file_size | INT UNSIGNED | YES | File size in bytes; max 5242880 |
| created_at | TIMESTAMP | NO | DEFAULT CURRENT_TIMESTAMP |

---

## Correctness Properties

### Property 1: SOAT Expiry Blocks Activation

**Validates: Requirements 2.5, 2.7**

For all vehicles V: if `V.soat_expiration_date < today()` then calling `VehicleService.create()` or `VehicleService.update()` with `status='active'` SHALL throw an exception and the vehicle status SHALL NOT be set to `'active'`.

### Property 2: Tecnomecánica Expiry Blocks Activation

**Validates: Requirements 2.6, 2.7**

For all vehicles V: if `V.tecnomecanica_expiration_date < today()` then calling `VehicleService.create()` or `VehicleService.update()` with `status='active'` SHALL throw an exception and the vehicle status SHALL NOT be set to `'active'`.

### Property 3: NULL Document Dates Never Block Activation

**Validates: Requirements 2.7, 6.6**

For all vehicles V: if `V.soat_expiration_date IS NULL` AND `V.tecnomecanica_expiration_date IS NULL`, then `VehicleService.update({status: 'active'})` SHALL succeed without document expiry errors.

### Property 4: Expired License Blocks Accept

**Validates: Requirements 3.5, 3.7**

For all mechanics M: if `M.driver_license_expiration_date < today()` then `ServiceRequestService.accept()` SHALL throw an exception and the service request status SHALL remain `'pending'`.

### Property 5: NULL License Never Blocks Accept

**Validates: Requirements 3.6, 6.5**

For all mechanics M: if `M.driver_license_expiration_date IS NULL`, then `ServiceRequestService.accept()` SHALL proceed and transition the request to `'assigned'` status.

### Property 6: Rating Bounds Enforced

**Validates: Requirements 4.1, 4.2, 1.3**

For all service requests R: `R.punctuality_rating ∈ {NULL} ∪ {1,2,3,4,5}` and `R.service_quality_rating ∈ {NULL} ∪ {1,2,3,4,5}` at all times, enforced by both application validation and DB CHECK constraints.

### Property 7: Evidence Assignment Integrity

**Validates: Requirements 5.2, 5.3**

For all evidences E in `service_request_evidences`: `E.uploaded_by = SR.mechanic_id` where SR is the referenced service request at the time of insertion.

### Property 8: Evidence Only for Active Requests

**Validates: Requirements 5.4**

No evidence SHALL be inserted for a service request with `status ∈ {'pending', 'cancelled', 'expired'}`.

### Property 9: Backward Compatibility of rate()

**Validates: Requirements 6.3, 6.4**

Calling `ServiceRequestService.rate(id, customerId, rating)` without the new optional `$punctualityRating` and `$serviceQualityRating` parameters SHALL produce the same observable result as before this feature was implemented.

---

## Error Handling

| Scenario | Layer | Response |
|----------|-------|----------|
| SOAT expired, activating vehicle | VehicleService | `\Exception` → `ErrorHandler::handleException()` → HTTP 500 (mapped generically) — controller should catch and return HTTP 422 |
| Tecnomecánica expired, activating vehicle | VehicleService | Same as above |
| Mechanic license expired | ServiceRequestService | `\Exception` → HTTP 500 generic; callers should catch specifically |
| Evidence: mechanic not assigned | ServiceRequestEvidenceService | `\Exception('No está asignado...')` → controller catches → HTTP 403 via `ErrorHandler` |
| Evidence: wrong request status | ServiceRequestEvidenceService | `\Exception` → HTTP 400 |
| Evidence: invalid `evidence_type` | ServiceRequestEvidenceService | `\InvalidArgumentException` → controller catches → `ResponseFormatter::validationError()` → HTTP 400 |
| Evidence: invalid URL or extension | ServiceRequestEvidenceService | `\InvalidArgumentException` → HTTP 400 |
| Evidence: file_size > 5 MB | ServiceRequestEvidenceService | `\InvalidArgumentException` → HTTP 400 |
| Rating out of range (1-5) | ServiceRequestValidator | Returns `['valid' => false, 'errors' => [...]]` → controller returns HTTP 422 |
| Invalid date format | VehicleValidator | Returns `['valid' => false, 'errors' => [...]]` → controller returns HTTP 422 |
| Migration failure | MigrationRunner | Log + `down()` available for manual rollback |

---

## Testing Strategy

**Unit tests (per component):**
- `VehicleValidator`: test each document field — valid values pass, invalid format/length/URL rejects
- `VehicleService.validateDocumentExpiry()`: expired date → exception; future date → no exception; NULL → no exception
- `ServiceRequestService.accept()`: expired license → exception; NULL license → success; valid license → success
- `ServiceRequestService.rate()`: with new optional params → persists; without new params → same behavior as before
- `ServiceRequestEvidenceService.addEvidence()`: each validation rule independently; valid evidence → insert + return

**Integration tests:**
- Full flow: create vehicle with SOAT → attempt activate with expired SOAT → 422; update to future date → activate → 200
- Full flow: mechanic with expired license tries `accept()` → exception; mechanic with valid license → success
- Full flow: mechanic adds evidence (before/during/after) → `getById()` returns evidence list
- Full flow: customer rates with all three rating fields → DB values match; customer rates with only `customer_rating` → no error

**Migration tests:**
- Run all 4 migrations on clean DB → all tables/columns exist
- Run `down()` on each migration → columns/table dropped; re-run `up()` → same result
- Run migrations with existing seed data → row counts unchanged, new columns are NULL
