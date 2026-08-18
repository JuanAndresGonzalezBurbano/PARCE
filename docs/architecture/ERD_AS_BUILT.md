# P.A.R.C.E — ERD AS-BUILT (oficial)

> Este es el **ERD oficial actual** de P.A.R.C.E. Construido exclusivamente desde las 17 migraciones en `database/migrations/` — no desde ningún ERD histórico. Cualquier tabla mencionada en documentación anterior que no aparezca aquí **no existe en la base de datos actual**.

---

## 1. ERD completo (Mermaid)

```mermaid
erDiagram
    users ||--o{ user_roles : "tiene"
    roles ||--o{ user_roles : "asignado_a"
    users ||--o{ admin_access_requests : "solicita (tabla sin uso en codigo actual)"
    users ||--o{ vehicles : "posee"
    users ||--o{ service_requests : "customer_id"
    users ||--o{ service_requests : "mechanic_id (nullable)"
    vehicles ||--o{ service_requests : "vehicle_id"
    service_requests ||--o{ service_request_evidences : "tiene"
    service_requests ||--o| surveys : "1:1 (UNIQUE FK)"
    users ||--o{ pqr : "user_id"
    users ||--o{ sessions : "user_id (nullable)"
    users ||--o{ password_reset_tokens : "user_id"

    users {
        bigint id PK
        varchar email UK
        varchar password_hash
        varchar first_name
        varchar last_name
        varchar phone "nullable"
        varchar profile_picture_url "nullable"
        enum account_status "active,suspended,deactivated,pending_verification"
        enum email_verification_status "unverified,verified"
        enum phone_verification_status "unverified,verified"
        varchar driver_license_number "nullable"
        date driver_license_expiration_date "nullable"
        varchar driver_license_document_url "nullable"
        timestamp driver_license_uploaded_at "nullable"
        enum driver_license_status "not_set,valid,expiring_soon,expired"
        timestamp deleted_at "nullable, soft delete"
    }
    roles {
        int id PK
        varchar name UK
        varchar slug UK "customer,mechanic,administrator,super_admin,support"
        boolean is_system_role
        boolean is_active
    }
    user_roles {
        bigint id PK
        bigint user_id FK
        int role_id FK
        bigint assigned_by FK "nullable"
        timestamp expires_at "nullable"
        boolean is_active
    }
    admin_access_requests {
        bigint id PK
        bigint user_id FK
        int requested_role_id FK
        text justification
        enum status "pending,approved,rejected,cancelled"
        bigint reviewed_by FK "nullable"
        bigint approved_by FK "nullable"
    }
    sessions {
        varchar id PK
        bigint user_id FK "nullable"
        varchar ip_address "nullable"
        text user_agent "nullable"
        longtext payload
        int last_activity
    }
    vehicles {
        bigint id PK
        bigint user_id FK
        varchar license_plate "sin UNIQUE desde migracion 16"
        varchar make
        varchar model
        smallint year
        varchar vin "sin UNIQUE desde migracion 16"
        varchar vehicle_type
        varchar fuel_type
        boolean is_primary
        varchar status "active,inactive"
        varchar soat_number "nullable"
        date soat_expiration_date "nullable"
        varchar soat_document_url "nullable"
        timestamp soat_uploaded_at "nullable"
        varchar tecnomecanica_number "nullable"
        date tecnomecanica_expiration_date "nullable"
        varchar tecnomecanica_document_url "nullable"
        timestamp tecnomecanica_uploaded_at "nullable"
        timestamp deleted_at "nullable, soft delete"
    }
    service_requests {
        bigint id PK
        varchar service_code UK
        bigint customer_id FK
        bigint vehicle_id FK
        bigint mechanic_id FK "nullable"
        bigint resolved_by FK "nullable"
        bigint cancelled_by FK "nullable"
        varchar emergency_type "validado en app, no ENUM de BD"
        varchar priority "normal,urgent,critical - VARCHAR"
        decimal latitude
        decimal longitude
        varchar status "pending,assigned,in_progress,completed,cancelled,expired - VARCHAR"
        timestamp requested_at
        timestamp assigned_at "nullable"
        timestamp started_at "nullable"
        timestamp completed_at "nullable"
        timestamp cancelled_at "nullable"
        timestamp expired_at "nullable"
        decimal final_cost "nullable"
        tinyint customer_rating "1-5, nullable"
        tinyint punctuality_rating "1-5, nullable"
        tinyint service_quality_rating "1-5, nullable"
        text customer_feedback "nullable"
        timestamp deleted_at "nullable, soft delete"
    }
    service_request_evidences {
        bigint id PK
        bigint service_request_id FK
        bigint uploaded_by FK
        enum evidence_type "before,during,after"
        varchar image_url
        varchar original_filename "nullable"
        varchar description "nullable"
        int file_size "nullable, bytes"
    }
    pqr {
        bigint id PK
        bigint user_id FK
        varchar ticket_code UK
        enum type "peticion,queja,reclamo,sugerencia"
        varchar subject
        text description
        enum status "pending,in_review,resolved,rejected"
        text admin_response "nullable"
        bigint responded_by FK "nullable"
        timestamp responded_at "nullable"
        timestamp deleted_at "nullable, soft delete"
    }
    surveys {
        bigint id PK
        bigint service_request_id FK UK "relacion 1:1 real"
        bigint customer_id FK
        tinyint overall_satisfaction "1-5"
        boolean would_recommend
        text comments "nullable"
        timestamp deleted_at "nullable, soft delete"
    }
    password_reset_tokens {
        bigint id PK
        bigint user_id FK
        varchar token_hash "SHA-256 hex, 64 chars"
        varchar ip_address "nullable"
        timestamp expires_at
        timestamp used_at "nullable"
    }
```

---

## 2. Lista de tablas (11 reales)

| Tabla | Migración de origen |
|---|---|
| `users` | `2024_01_01_000001_create_users_and_roles_tables.php` |
| `roles` | `2024_01_01_000001_create_users_and_roles_tables.php` |
| `user_roles` | `2024_01_01_000001_create_users_and_roles_tables.php` |
| `admin_access_requests` | `2024_01_01_000001_create_users_and_roles_tables.php` |
| `sessions` | `2024_01_01_000002_create_sessions_table.php` |
| `vehicles` | `2024_01_01_000003_create_vehicles_table.php` |
| `service_requests` | `2024_01_01_000004_create_service_requests_table.php` |
| `service_request_evidences` | `2026_01_01_000008_create_service_request_evidences_table.php` |
| `pqr` | `2026_07_10_000009_create_pqr_table.php` |
| `surveys` | `2026_07_10_000010_create_surveys_table.php` |
| `password_reset_tokens` | `2026_07_25_000017_create_password_reset_tokens_table.php` |

**Migraciones que NO crean tabla nueva** (ALTER o datos): `2026_01_01_000005` (SOAT/Tecnomecánica → `vehicles`), `2026_01_01_000006` (licencia → `users`), `2026_01_01_000007` (ratings detallados → `service_requests`), `2026_07_10_000011` (restaura columnas de rating), `2026_07_10_000012` (solo datos demo), `2026_07_10_000013` (`driver_license_status` → `users`), `2026_07_10_000014` (`description` → `service_request_evidences`), `2026_07_10_000015` (restaura columnas SOAT/Tecnomecánica), `2026_07_16_000016` (elimina UNIQUE de placa/VIN).

---

## 3. Relaciones

| Relación | Cardinalidad | FK | ON DELETE |
|---|---|---|---|
| users → user_roles | 1:N | `user_roles.user_id` | CASCADE |
| roles → user_roles | 1:N | `user_roles.role_id` | CASCADE |
| users → user_roles (assigned_by) | 1:N | `user_roles.assigned_by` | SET NULL |
| users → admin_access_requests | 1:N | `admin_access_requests.user_id` | CASCADE |
| roles → admin_access_requests | 1:N | `admin_access_requests.requested_role_id` | CASCADE |
| users → admin_access_requests (reviewed_by) | 1:N | `admin_access_requests.reviewed_by` | SET NULL |
| users → admin_access_requests (approved_by) | 1:N | `admin_access_requests.approved_by` | SET NULL |
| users → sessions | 1:N | `sessions.user_id` | CASCADE |
| users → vehicles | 1:N | `vehicles.user_id` | RESTRICT |
| users → service_requests (customer) | 1:N | `service_requests.customer_id` | RESTRICT |
| users → service_requests (mechanic) | 1:N | `service_requests.mechanic_id` | RESTRICT |
| users → service_requests (resolved_by) | 1:N | `service_requests.resolved_by` | RESTRICT |
| users → service_requests (cancelled_by) | 1:N | `service_requests.cancelled_by` | RESTRICT |
| vehicles → service_requests | 1:N | `service_requests.vehicle_id` | RESTRICT |
| service_requests → service_request_evidences | 1:N | `service_request_evidences.service_request_id` | CASCADE |
| users → service_request_evidences | 1:N | `service_request_evidences.uploaded_by` | RESTRICT (default, sin cláusula explícita) |
| users → pqr | 1:N | `pqr.user_id` | RESTRICT |
| users → pqr (responded_by) | 1:N | `pqr.responded_by` | SET NULL |
| service_requests → surveys | **1:1** | `surveys.service_request_id` (UNIQUE) | CASCADE |
| users → surveys | 1:N | `surveys.customer_id` | RESTRICT |
| users → password_reset_tokens | 1:N | `password_reset_tokens.user_id` | CASCADE |

**Única relación 1:1 real del esquema:** `service_requests` ↔ `surveys`. Todas las demás son 1:N.

---

## 4. PK / FK — resumen

Todas las tablas usan `id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY`, salvo `roles` (`INT UNSIGNED`) y `sessions` (`VARCHAR(255)`, es el identificador de sesión, no autoincremental).

---

## 5. Restricciones importantes

- `users`: CHECK de consistencia entre `email_verification_status`/`email_verified_at` y `phone_verification_status`/`phone_verified_at`.
- `user_roles`: UNIQUE `(user_id, role_id)`; CHECK `expires_at` nulo o posterior a `assigned_at`.
- `admin_access_requests`: CHECK de consistencia aprobación (`status='approved'` requiere `approved_by`/`approved_at`) y rechazo (`status='rejected'` requiere `rejection_reason`).
- `vehicles`: **sin UNIQUE de BD en `license_plate`/`vin`** desde la migración 16 — unicidad aplicada solo en capa de aplicación (locks nombrados de MySQL).
- `service_requests`: CHECK `chk_punctuality_rating`/`chk_service_quality_rating` (NULL o 1-5); `status`/`emergency_type`/`priority` son `VARCHAR` planos, sin ENUM ni FK a tabla de catálogo — validados únicamente por `ServiceRequestValidator` en la capa de aplicación.
- `service_request_evidences`: `evidence_type` **sí** es ENUM real de BD (`before`,`during`,`after`).
- `pqr`: `type` y `status` **sí** son ENUM reales de BD.
- `surveys`: CHECK `overall_satisfaction BETWEEN 1 AND 5`; UNIQUE real en `service_request_id`.
- `password_reset_tokens`: `expires_at` tiene un DEFAULT centinela (`2000-01-01 00:00:00`) siempre sobrescrito en el INSERT — evita el comportamiento legado de MySQL de auto-`ON UPDATE CURRENT_TIMESTAMP` en la primera columna TIMESTAMP de la tabla.

---

## 6. Campos importantes por dominio

- **Documentales de vehículo:** `soat_*` (4 campos), `tecnomecanica_*` (4 campos) en `vehicles` — todos nullable, sin workflow de verificación.
- **Documentales de mecánico:** `driver_license_*` (4 campos + `driver_license_status` calculado) en `users`.
- **Ratings:** `customer_rating`, `punctuality_rating`, `service_quality_rating`, `customer_feedback` — todos en `service_requests`, no en tabla separada.
- **Auditoría de ciclo de vida:** `requested_at`, `assigned_at`, `started_at`, `completed_at`, `cancelled_at`, `expired_at` — todos como columnas planas en `service_requests`, sin tabla de historial.

---

## 7. Notas de divergencias históricas

- **No existen** (verificado, ausentes de las 17 migraciones): `documents`, `document_verifications`, `document_types`, `mechanic_profiles`, `notifications`, `service_assignments`, `service_state_history`, `service_locations`, `service_statuses`.
- `admin_access_requests` **sí existe** en el esquema pero no tiene ningún código que la use actualmente (Controller/Service) — es la única tabla "huérfana" del sistema real.
- El nombre de tabla histórico `services` (del ERD antiguo) nunca existió — la tabla real siempre fue `service_requests` desde la migración original.
- Las migraciones `2026_07_10_000011` y `2026_07_10_000015` son evidencia de una deriva de esquema no documentada: restauran columnas (ratings, SOAT/Tecnomecánica) que en algún punto desaparecieron de una base de datos viva sin que exista una migración registrada en el repositorio que documente la eliminación original.

Ver comparación completa con la documentación histórica en [`AS_DESIGNED_VS_AS_BUILT.md`](AS_DESIGNED_VS_AS_BUILT.md).
