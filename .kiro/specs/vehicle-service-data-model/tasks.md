# Implementation Plan: Vehicle & Service Data Model (Fase 13)

## Overview

This plan implements the database schema extensions, backend service/validator changes, new evidence service, updated controllers, route addition, and frontend type/component changes for Fase 13. All tasks are additive — no existing behavior is removed or broken.

**Files touched:**
- 4 new migration files
- `app/Infrastructure/Vehicle/VehicleValidator.php` (modified)
- `app/Infrastructure/Vehicle/VehicleService.php` (modified)
- `app/Infrastructure/ServiceRequest/ServiceRequestValidator.php` (modified)
- `app/Infrastructure/ServiceRequest/ServiceRequestService.php` (modified)
- `app/Infrastructure/ServiceRequest/ServiceRequestEvidenceService.php` (NEW)
- `app/Controllers/VehicleController.php` (modified)
- `app/Controllers/ServiceRequestController.php` (modified)
- `config/routes.php` (modified)
- `frontend/src/types/vehicle.ts` (modified)
- `frontend/src/types/serviceRequest.ts` (modified)
- `frontend/src/types/auth.ts` (modified)
- `frontend/src/services/serviceRequestService.ts` (modified)
- Frontend vehicle form component (modified)
- Frontend mechanic profile component (modified)
- Frontend service request detail component (modified)

---

## Tasks

- [x] 1. Create database migrations
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

  - [x] 1.1 Migration: add document fields to vehicles table
    - Create `database/migrations/2026_01_01_000005_add_document_fields_to_vehicles.php`
    - Class name: `AddDocumentFieldsToVehicles` extending `App\Core\Migration`
    - `up()`: `ALTER TABLE vehicles ADD COLUMN soat_number VARCHAR(50) NULL, ADD COLUMN soat_expiration_date DATE NULL, ADD COLUMN soat_document_url VARCHAR(500) NULL, ADD COLUMN soat_uploaded_at TIMESTAMP NULL, ADD COLUMN tecnomecanica_number VARCHAR(50) NULL, ADD COLUMN tecnomecanica_expiration_date DATE NULL, ADD COLUMN tecnomecanica_document_url VARCHAR(500) NULL, ADD COLUMN tecnomecanica_uploaded_at TIMESTAMP NULL`
    - `down()`: DROP COLUMN for each of the 8 columns in reverse order
    - Verify: columns are nullable, no existing data is modified
    - _Requirements: 1.1, 1.5, 1.6_

  - [x] 1.2 Migration: add driver license fields to users table
    - Create `database/migrations/2026_01_01_000006_add_driver_license_to_users.php`
    - Class name: `AddDriverLicenseToUsers` extending `App\Core\Migration`
    - `up()`: `ALTER TABLE users ADD COLUMN driver_license_number VARCHAR(50) NULL, ADD COLUMN driver_license_expiration_date DATE NULL, ADD COLUMN driver_license_document_url VARCHAR(500) NULL, ADD COLUMN driver_license_uploaded_at TIMESTAMP NULL`
    - `down()`: DROP COLUMN for each of the 4 columns
    - _Requirements: 1.2, 1.5, 1.6_

  - [x] 1.3 Migration: add detailed rating columns to service_requests table
    - Create `database/migrations/2026_01_01_000007_add_detailed_ratings_to_service_requests.php`
    - Class name: `AddDetailedRatingsToServiceRequests` extending `App\Core\Migration`
    - `up()`: ALTER TABLE adds `punctuality_rating TINYINT UNSIGNED NULL`, `service_quality_rating TINYINT UNSIGNED NULL`, then ADD CONSTRAINT `chk_punctuality_rating` CHECK (`punctuality_rating IS NULL OR (punctuality_rating >= 1 AND punctuality_rating <= 5)`) and `chk_service_quality_rating` CHECK (`service_quality_rating IS NULL OR (service_quality_rating >= 1 AND service_quality_rating <= 5)`)
    - `down()`: DROP CHECK constraints first, then DROP COLUMN for both columns
    - Do NOT touch `customer_rating` or `customer_feedback`
    - _Requirements: 1.3, 1.5, 1.6_

  - [x] 1.4 Migration: create service_request_evidences table
    - Create `database/migrations/2026_01_01_000008_create_service_request_evidences_table.php`
    - Class name: `CreateServiceRequestEvidencesTable` extending `App\Core\Migration`
    - `up()`: CREATE TABLE with columns: `id BIGINT UNSIGNED AUTO_INCREMENT PK`, `service_request_id BIGINT UNSIGNED NOT NULL`, `uploaded_by BIGINT UNSIGNED NOT NULL`, `evidence_type ENUM('before','during','after') NOT NULL`, `image_url VARCHAR(500) NOT NULL`, `original_filename VARCHAR(255) NULL`, `file_size INT UNSIGNED NULL`, `created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`; INDEX `idx_service_request_id(service_request_id)`; FK `fk_evidence_service_request` → `service_requests(id) ON DELETE CASCADE`; FK `fk_evidence_user` → `users(id)`; ENGINE=InnoDB CHARSET=utf8mb4
    - `down()`: DROP TABLE service_request_evidences
    - _Requirements: 1.4, 1.5, 1.6_

- [ ] 2. Backend — Vehicle document validation
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 6.2, 6.6_

  - [~] 2.1 Extend VehicleValidator with document field validations
    - File: `app/Infrastructure/Vehicle/VehicleValidator.php`
    - Add validation block to **both** `validateCreateRequest()` and `validateUpdateRequest()`:
      - `soat_number`: optional; if present, reject if `strlen > 50`
      - `soat_expiration_date`: optional; if present, reject if not `YYYY-MM-DD` format (use `DateTime::createFromFormat`)
      - `soat_document_url`: optional; if present, reject if `strlen > 500` or `filter_var(..., FILTER_VALIDATE_URL)` fails
      - `tecnomecanica_number`, `tecnomecanica_expiration_date`, `tecnomecanica_document_url`: same rules as SOAT counterparts
    - Do NOT add `*_uploaded_at` as input fields — these are set server-side only
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [~] 2.2 Extend VehicleService to persist document fields and enforce expiry on activation
    - File: `app/Infrastructure/Vehicle/VehicleService.php`
    - Add private method `validateDocumentExpiry(array $vehicleData): void`:
      - Compare `soat_expiration_date` and `tecnomecanica_expiration_date` against `date('Y-m-d')`
      - Throw `\Exception('El SOAT del vehículo está vencido. No se puede activar el vehículo.')` if SOAT is expired
      - Throw `\Exception('La Tecnomecánica del vehículo está vencida. No se puede activar el vehículo.')` if Tecnomecánica is expired
      - Skip check if the date field is NULL
    - Modify `create()`:
      - Collect the 6 document fields from `$data` into `$insertData` if present
      - Set `soat_uploaded_at = date('Y-m-d H:i:s')` if `soat_document_url` is in `$data`
      - Set `tecnomecanica_uploaded_at = date('Y-m-d H:i:s')` if `tecnomecanica_document_url` is in `$data`
      - Call `$this->validateDocumentExpiry($insertData)` before the INSERT (vehicles default to `status = 'active'`)
    - Modify `update()`:
      - Collect document fields into `$updateData` if present in `$data`
      - Set `*_uploaded_at` timestamps when respective URL is being updated
      - After merging with current vehicle data, call `$this->validateDocumentExpiry(...)` when:
        - `$data['status'] === 'active'` is explicitly set, OR
        - the vehicle's current `status` is `'active'` and a document date field is being changed
    - _Requirements: 2.5, 2.6, 2.7, 2.8, 6.6_

  - [~] 2.3 Extend VehicleController to pass document fields through
    - File: `app/Controllers/VehicleController.php`
    - In `store()`: after the existing optional field extraction block, add extraction for `soat_number`, `soat_expiration_date`, `soat_document_url`, `tecnomecanica_number`, `tecnomecanica_expiration_date`, `tecnomecanica_document_url` — use `RequestValidator::sanitizeString()` for string fields
    - In `update()`: same extraction pattern
    - Do NOT add the `*_uploaded_at` fields to controller input — they are set in the service
    - _Requirements: 2.8, 6.2_

- [ ] 3. Backend — Mechanic driver license validation
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 6.5_

  - [~] 3.1 Add driver license validation in ServiceRequestService.accept()
    - File: `app/Infrastructure/ServiceRequest/ServiceRequestService.php`
    - In `accept()`, after verifying the request is `pending` and **before** the status UPDATE, add:
      - `Database::fetchOne('SELECT driver_license_expiration_date FROM users WHERE id = ?', [$mechanicId])`
      - If `driver_license_expiration_date` is not NULL and `< date('Y-m-d')`, throw `\Exception('La licencia de conducción del mecánico está vencida. No puede aceptar solicitudes.')`
      - If `driver_license_expiration_date` is NULL, allow without restriction
    - _Requirements: 3.5, 3.6, 3.7, 6.5_

  - [~] 3.2 Add driver license field support for mechanic profile updates
    - The `users` table now has the 4 license columns; expose them via the Auth/profile update path
    - In `app/Controllers/Auth/AuthController.php` (or the profile update endpoint), accept optional `driver_license_number`, `driver_license_expiration_date`, `driver_license_document_url` and pass to a user update service
    - Validate:
      - `driver_license_number`: max 50 chars
      - `driver_license_expiration_date`: YYYY-MM-DD format
      - `driver_license_document_url`: valid URL, max 500 chars
    - Set `driver_license_uploaded_at = NOW()` when `driver_license_document_url` is provided
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.8_

- [ ] 4. Backend — Detailed ratings
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 6.3, 6.4_

  - [~] 4.1 Extend ServiceRequestValidator.validateRatingRequest()
    - File: `app/Infrastructure/ServiceRequest/ServiceRequestValidator.php`
    - Add optional validation for `punctuality_rating`:
      - If present: must be numeric integer between 1 and 5 inclusive
      - Error field: `'punctuality_rating'`
    - Add optional validation for `service_quality_rating`:
      - Same rules, error field: `'service_quality_rating'`
    - `customer_rating` remains required (existing behavior preserved)
    - _Requirements: 4.1, 4.2_

  - [~] 4.2 Extend ServiceRequestService.rate() to accept and persist new ratings
    - File: `app/Infrastructure/ServiceRequest/ServiceRequestService.php`
    - Add `?int $punctualityRating = null` and `?int $serviceQualityRating = null` parameters to `rate()`
    - In `$updateData`, conditionally add `punctuality_rating` and `service_quality_rating` when not null
    - All rating fields (including new ones) are persisted in a single `Database::update()` call
    - Existing guard checks (status must be `completed`, already-rated check) are preserved unchanged
    - _Requirements: 4.3, 4.4, 4.5, 4.6, 6.4_

  - [~] 4.3 Update ServiceRequestService.getById() to return new rating fields
    - The `SELECT sr.*` in `getById()` already returns all columns; new columns will be included automatically
    - Verify `punctuality_rating` and `service_quality_rating` appear in the returned array
    - _Requirements: 4.7_

  - [~] 4.4 Update ServiceRequestController.rate() to pass new ratings to service
    - File: `app/Controllers/ServiceRequestController.php`
    - After existing `$feedback` extraction, add:
      ```php
      $punctualityRating = $request->input('punctuality_rating') !== null
          ? (int)$request->input('punctuality_rating') : null;
      $serviceQualityRating = $request->input('service_quality_rating') !== null
          ? (int)$request->input('service_quality_rating') : null;
      ```
    - Pass both to `$this->serviceRequestService->rate(..., $punctualityRating, $serviceQualityRating)`
    - _Requirements: 4.3, 4.4, 6.3_

- [ ] 5. Backend — Evidence service and endpoint
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10, 5.11_

  - [~] 5.1 Create ServiceRequestEvidenceService
    - Create `app/Infrastructure/ServiceRequest/ServiceRequestEvidenceService.php`
    - Namespace: `App\Infrastructure\ServiceRequest`
    - Implement `addEvidence(int $serviceRequestId, int $mechanicId, array $data): array`:
      - Fetch service request; verify mechanic assignment; verify status in `[assigned, in_progress, completed]`
      - Validate `evidence_type` ∈ `{before, during, after}`
      - Validate `image_url`: max 500 chars, valid `http`/`https` URL via `filter_var + FILTER_VALIDATE_URL`
      - Validate URL file extension: extract `pathinfo(strtolower(parse_url($url, PHP_URL_PATH)), PATHINFO_EXTENSION)` must be in `{jpg, jpeg, png, webp}`
      - Validate `file_size` if present: must be ≤ 5242880 (5 MB)
      - INSERT into `service_request_evidences` with `service_request_id`, `uploaded_by`, `evidence_type`, `image_url`, and optionally `original_filename`, `file_size`
      - Return the inserted record fetched by `id`
    - Implement `getEvidences(int $serviceRequestId): array`:
      - SELECT all fields ordered by `created_at ASC`
    - _Requirements: 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9_

  - [~] 5.2 Add addEvidence() method to ServiceRequestController
    - File: `app/Controllers/ServiceRequestController.php`
    - Add `addEvidence(Request $request, int $id): Response` method
    - Validate Content-Type and parse JSON body
    - Instantiate `ServiceRequestEvidenceService`
    - Pass `$id`, `$mechanicId` (from `$request->getAttribute('userId')`), and extracted fields to `addEvidence()`
    - On success: return `ResponseFormatter::success(['evidence' => $evidence], 'Evidence added successfully', 201)`
    - On `\InvalidArgumentException`: return `ResponseFormatter::validationError(['evidence' => $e->getMessage()])`
    - On other `\Exception`: delegate to `ErrorHandler::handleException($e)`
    - _Requirements: 5.1, 5.9, 5.10_

  - [~] 5.3 Register evidence route in routes.php
    - File: `config/routes.php`
    - Add: `$router->post('/api/mechanic/requests/{id}/evidences', [ServiceRequestController::class, 'addEvidence'])->middleware([AuthMiddleware::class, [RBACMiddleware::class, ['mechanic']]])`
    - Add after the existing mechanic routes block
    - _Requirements: 5.1_

  - [~] 5.4 Include evidences in ServiceRequestService.getById()
    - File: `app/Infrastructure/ServiceRequest/ServiceRequestService.php`
    - After the main `Database::fetchOne(...)` query in `getById()`, add a secondary query:
      ```php
      $request['evidences'] = Database::fetchAll(
          'SELECT id, uploaded_by, evidence_type, image_url,
                  original_filename, file_size, created_at
           FROM service_request_evidences
           WHERE service_request_id = ?
           ORDER BY created_at ASC',
          [$requestId]
      );
      ```
    - If request is null, skip (null check already exists)
    - _Requirements: 5.10, 5.11_

- [ ] 6. Frontend — Types and service updates
  - _Requirements: 2.1, 2.8, 3.1, 3.8, 4.1, 4.2, 5.9, 5.10_

  - [~] 6.1 Update frontend vehicle types
    - File: `frontend/src/types/vehicle.ts`
    - Add to `Vehicle` interface: `soatNumber`, `soatExpirationDate`, `soatDocumentUrl`, `soatUploadedAt`, `tecnomecanicaNumber`, `tecnomecanicaExpirationDate`, `tecnomecanicaDocumentUrl`, `tecnomecanicaUploadedAt` — all `string | null | undefined`
    - Add same fields (except `*UploadedAt`) to `VehicleFormData` interface
    - _Requirements: 2.1, 2.8_

  - [~] 6.2 Update frontend service request types
    - File: `frontend/src/types/serviceRequest.ts`
    - Add to `ServiceRequest` interface: `punctualityRating?: number | null`, `serviceQualityRating?: number | null`, `evidences?: ServiceRequestEvidence[]`
    - Add new `ServiceRequestEvidence` interface: `id`, `serviceRequestId`, `uploadedBy`, `evidenceType: 'before' | 'during' | 'after'`, `imageUrl`, `originalFilename?`, `fileSize?`, `createdAt`
    - Add `RatingFormData` type: `customerRating: number`, `customerFeedback?: string`, `punctualityRating?: number`, `serviceQualityRating?: number`
    - _Requirements: 4.1, 4.2, 5.9, 5.10_

  - [~] 6.3 Update frontend user/auth types
    - File: `frontend/src/types/auth.ts`
    - Add to `User` interface: `driverLicenseNumber?: string | null`, `driverLicenseExpirationDate?: string | null`, `driverLicenseDocumentUrl?: string | null`
    - _Requirements: 3.1, 3.8_

  - [~] 6.4 Add addEvidence() to serviceRequestService
    - File: `frontend/src/services/serviceRequestService.ts`
    - Add function `addEvidence(requestId: number, data: { evidenceType, imageUrl, originalFilename?, fileSize? })`:
      - POST to `/mechanic/requests/${requestId}/evidences`
      - Map camelCase fields to snake_case for the request body
    - _Requirements: 5.9_

- [ ] 7. Frontend — UI components
  - _Requirements: 2.1, 2.8, 3.1, 3.8, 4.1, 4.2, 4.3, 5.1, 5.9, 5.10_

  - [~] 7.1 Update vehicle form with SOAT and Tecnomecánica fields
    - Locate the vehicle creation/edit form component (in `src/components/vehicles/` or `src/pages/customer/`)
    - Add a "Documentos del vehículo" section with 6 fields:
      - SOAT number (text input, optional)
      - SOAT expiration date (date input, optional, format YYYY-MM-DD)
      - SOAT document URL (text/url input, optional)
      - Tecnomecánica number (text input, optional)
      - Tecnomecánica expiration date (date input, optional)
      - Tecnomecánica document URL (text/url input, optional)
    - Wire fields to form state and include in the submit payload
    - _Requirements: 2.1, 2.8_

  - [~] 7.2 Update mechanic profile with driver license fields
    - Locate the mechanic profile edit component
    - Add a "Licencia de conducción" section with 3 fields:
      - License number (text input, optional)
      - License expiration date (date input, optional)
      - License document URL (text/url input, optional)
    - Wire to form state and include in submit payload
    - _Requirements: 3.1, 3.8_

  - [~] 7.3 Update service request detail with evidences section
    - Locate the service request detail component (in `src/pages/customer/` or `src/pages/mechanic/`)
    - Add an "Evidencias" section that:
      - Groups and displays evidences by type: Before / During / After
      - Shows `imageUrl` as an `<img>` tag or link, `evidenceType`, `createdAt`
      - For mechanics: shows an upload form with `evidence_type` selector, `image_url` field, optional `original_filename` and `file_size`
      - On submit, calls `addEvidence()` and refreshes the evidence list
    - _Requirements: 5.1, 5.9, 5.10_

  - [~] 7.4 Update rating form with detailed rating fields
    - Locate the rating/feedback component (used after service completion)
    - Keep existing `customer_rating` star selector (required)
    - Add optional `punctuality_rating` star selector (1-5)
    - Add optional `service_quality_rating` star selector (1-5)
    - Keep optional `customer_feedback` textarea
    - Pass all four fields in the rating API call
    - _Requirements: 4.1, 4.2, 4.3_

- [ ] 8. Verification and compatibility checks
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [~] 8.1 Verify migrations run without data loss
    - Run all 4 migrations on a database with existing data
    - Confirm row counts in `vehicles`, `users`, `service_requests` are unchanged
    - Confirm new columns exist and are NULL in all pre-existing rows
    - Confirm CHECK constraints on `punctuality_rating` and `service_quality_rating` reject values outside 1-5
    - _Requirements: 6.1_

  - [~] 8.2 Verify existing endpoints are unaffected
    - Test `POST /api/vehicles` without document fields → still returns 201
    - Test `PUT /api/vehicles/{id}` without document fields → still returns 200
    - Test `POST /api/service-requests/{id}/rate` with only `customer_rating` → still returns 200
    - Test `POST /api/mechanic/requests/{id}/accept` for mechanic with NULL license date → still returns 200
    - _Requirements: 6.2, 6.3, 6.4, 6.5, 6.6_

  - [~] 8.3 Verify frontend compiles without TypeScript errors
    - Run `npm run build` in `frontend/`
    - Confirm zero TypeScript errors
    - Confirm zero ESLint errors
    - _Requirements: 6.3_

---

## Notes

- Tasks 1.1–1.4 (migrations) must be executed in sequence; each depends on the previous table state.
- Tasks 2.x, 3.x, 4.x, 5.x are independent of each other and can be developed in parallel.
- Tasks 6.x and 7.x (frontend) depend on 2.x–5.x being complete first, but can be started in parallel with backend tasks.
- Task 8.x (verification) must run last after all other tasks complete.
- `*_uploaded_at` fields are **never** accepted from client input — they are always set server-side.
- Existing `customer_rating` and `customer_feedback` columns in `service_requests` are not touched.

## Task Dependency Graph

```json
{
  "waves": [
    {
      "id": 0,
      "tasks": ["1.1", "1.2", "1.3", "1.4"]
    },
    {
      "id": 1,
      "tasks": ["2.1", "3.1", "4.1", "5.1"]
    },
    {
      "id": 2,
      "tasks": ["2.2", "3.2", "4.2", "5.2", "5.4"]
    },
    {
      "id": 3,
      "tasks": ["2.3", "4.3", "4.4", "5.3"]
    },
    {
      "id": 4,
      "tasks": ["6.1", "6.2", "6.3", "6.4"]
    },
    {
      "id": 5,
      "tasks": ["7.1", "7.2", "7.3", "7.4"]
    },
    {
      "id": 6,
      "tasks": ["8.1", "8.2", "8.3"]
    }
  ]
}
```
