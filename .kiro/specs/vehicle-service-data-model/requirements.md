# Requirements Document

## Introduction

Esta feature completa el modelo de datos para el MVP de producción de P.A.R.C.E (Fase 13). Se extienden las tablas existentes (`vehicles`, `users`, `service_requests`) con campos de validación documental, timestamps de auditoría y calificaciones detalladas, y se crea la nueva tabla `service_request_evidences` para evidencias fotográficas. Todo debe integrarse sin romper las funcionalidades existentes del backend PHP 8.2 custom MVC.

**Entidades afectadas:**
- `vehicles` — nuevos campos SOAT, Tecnomecánica y timestamps de carga (`*_uploaded_at`)
- `users` — nuevos campos de licencia de conducción para mecánicos con timestamp de carga
- `service_requests` — nuevas calificaciones de puntualidad y calidad (escala 1-5 con CHECK constraint)
- `service_request_evidences` — nueva tabla con metadata de evidencias (`original_filename`, `file_size`)

---

## Glossary

- **SOAT**: Seguro Obligatorio de Accidentes de Tránsito — documento obligatorio colombiano que habilita la circulación de un vehículo.
- **Tecnomecánica**: Revisión técnico-mecánica y de emisiones contaminantes — certificado periódico de idoneidad técnica del vehículo en Colombia.
- **Licencia_de_conduccion**: Documento habilitante para operar un vehículo. Solo aplica a usuarios con rol `mechanic`.
- **Vehicle**: Entidad existente en la tabla `vehicles` con `status` (`active`/`inactive`) y campos de identificación del automotor.
- **ServiceRequest**: Entidad existente en la tabla `service_requests` que gestiona el ciclo completo de una solicitud de asistencia vehicular.
- **ServiceRequestEvidence**: Nueva entidad en la tabla `service_request_evidences` que almacena URLs de imágenes de evidencia fotográfica de un servicio.
- **Mechanic**: Usuario con rol `mechanic` asignado a través de la tabla `user_roles`.
- **Customer**: Usuario con rol `customer` que crea solicitudes de servicio.
- **VehicleService**: Servicio PHP en `app/Infrastructure/Vehicle/VehicleService.php` que gestiona la lógica de negocio de vehículos.
- **VehicleValidator**: Clase PHP en `app/Infrastructure/Vehicle/VehicleValidator.php` que valida los datos de entrada de vehículos.
- **ServiceRequestService**: Servicio PHP en `app/Infrastructure/ServiceRequest/ServiceRequestService.php` que gestiona la lógica de negocio de solicitudes.
- **ServiceRequestEvidenceService**: Nuevo servicio PHP en `app/Infrastructure/ServiceRequest/ServiceRequestEvidenceService.php` para gestionar evidencias fotográficas.
- **soat_uploaded_at / tecnomecanica_uploaded_at / driver_license_uploaded_at**: Timestamps de auditoría que registran cuándo fue cargado cada documento, para trazabilidad y auditoría.
- **original_filename**: Nombre original del archivo de evidencia tal como fue enviado por el cliente, guardado para referencia y auditoría.
- **file_size**: Tamaño en bytes del archivo de evidencia, usado para validación del límite de 5 MB.

---

## Requirements

### Requisito 1: Migración de Esquema de Base de Datos

**User Story:** Como desarrollador, quiero que el esquema de base de datos refleje los nuevos campos documentales y de calificación, para que la capa de persistencia soporte las nuevas funcionalidades sin pérdida de datos existentes.

#### Criterios de Aceptación

1. THE Migration_System SHALL agregar las columnas `soat_number VARCHAR(50) NULL`, `soat_expiration_date DATE NULL`, `soat_document_url VARCHAR(500) NULL` y `soat_uploaded_at TIMESTAMP NULL` a la tabla `vehicles`, junto con `tecnomecanica_number VARCHAR(50) NULL`, `tecnomecanica_expiration_date DATE NULL`, `tecnomecanica_document_url VARCHAR(500) NULL` y `tecnomecanica_uploaded_at TIMESTAMP NULL`, mediante un único archivo de migración con nombre `2026_01_01_000005_add_document_fields_to_vehicles`.
2. THE Migration_System SHALL agregar las columnas `driver_license_number VARCHAR(50) NULL`, `driver_license_expiration_date DATE NULL`, `driver_license_document_url VARCHAR(500) NULL` y `driver_license_uploaded_at TIMESTAMP NULL` a la tabla `users` mediante un archivo de migración con nombre `2026_01_01_000006_add_driver_license_to_users`.
3. THE Migration_System SHALL agregar las columnas `punctuality_rating TINYINT UNSIGNED NULL` y `service_quality_rating TINYINT UNSIGNED NULL` a la tabla `service_requests`, incluyendo los CHECK constraints `CONSTRAINT chk_punctuality_rating CHECK (punctuality_rating IS NULL OR (punctuality_rating >= 1 AND punctuality_rating <= 5))` y `CONSTRAINT chk_service_quality_rating CHECK (service_quality_rating IS NULL OR (service_quality_rating >= 1 AND service_quality_rating <= 5))`, mediante un archivo de migración con nombre `2026_01_01_000007_add_detailed_ratings_to_service_requests`.
4. THE Migration_System SHALL crear la tabla `service_request_evidences` con las columnas `id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY`, `service_request_id BIGINT UNSIGNED NOT NULL`, `uploaded_by BIGINT UNSIGNED NOT NULL`, `evidence_type ENUM('before', 'during', 'after') NOT NULL`, `image_url VARCHAR(500) NOT NULL`, `original_filename VARCHAR(255) NULL`, `file_size INT UNSIGNED NULL` y `created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`, incluyendo `INDEX idx_service_request_id(service_request_id)`, la foreign key `fk_evidence_service_request` (referencia a `service_requests.id` ON DELETE CASCADE) y la foreign key `fk_evidence_user` (referencia a `users.id` sin acción explícita), mediante un archivo de migración con nombre `2026_01_01_000008_create_service_request_evidences_table`.
5. WHEN una migración se ejecuta en una base de datos con datos existentes, THE Migration_System SHALL completar la operación sin eliminar ni modificar los registros preexistentes en `vehicles`, `users` y `service_requests`.
6. WHEN una migración falla, THE Migration_System SHALL proveer un método `down()` que ejecute la operación DDL inversa (DROP COLUMN o DROP TABLE) para permitir revertir el cambio manualmente.

---

### Requisito 2: Validación Documental de Vehículos (SOAT y Tecnomecánica)

**User Story:** Como cliente, quiero registrar y actualizar los datos de SOAT y Tecnomecánica de mi vehículo, para que el sistema pueda verificar que el vehículo está habilitado para circular antes de usarlo en una solicitud de servicio.

#### Criterios de Aceptación

1. WHEN un cliente envía una solicitud de creación o actualización de vehículo con campos documentales, THE VehicleValidator SHALL aceptar `soat_number`, `soat_expiration_date`, `soat_document_url`, `tecnomecanica_number`, `tecnomecanica_expiration_date` y `tecnomecanica_document_url` como campos opcionales.
2. WHEN `soat_expiration_date` o `tecnomecanica_expiration_date` es proporcionado, THE VehicleValidator SHALL rechazar valores que no cumplan el formato `YYYY-MM-DD` mediante `DateTime::createFromFormat('Y-m-d', $value)`.
3. WHEN `soat_document_url` o `tecnomecanica_document_url` es proporcionado, THE VehicleValidator SHALL rechazar valores que excedan 500 caracteres o que no sean URLs válidas según `FILTER_VALIDATE_URL`.
4. WHEN `soat_number` o `tecnomecanica_number` es proporcionado, THE VehicleValidator SHALL rechazar valores que excedan 50 caracteres.
5. WHEN un cliente intenta activar un vehículo con `status = 'active'` y `soat_expiration_date` del vehículo es una fecha anterior a la fecha actual del sistema, THE VehicleService SHALL lanzar una excepción con el mensaje `'El SOAT del vehículo está vencido. No se puede activar el vehículo.'`.
6. WHEN un cliente intenta activar un vehículo con `status = 'active'` y `tecnomecanica_expiration_date` del vehículo es una fecha anterior a la fecha actual del sistema, THE VehicleService SHALL lanzar una excepción con el mensaje `'La Tecnomecánica del vehículo está vencida. No se puede activar el vehículo.'`.
7. IF `soat_expiration_date` o `tecnomecanica_expiration_date` es `NULL` en la tabla `vehicles`, THEN THE VehicleService SHALL permitir la activación del vehículo sin validar el campo correspondiente.
8. THE VehicleService SHALL persistir `soat_number`, `soat_expiration_date`, `soat_document_url`, `soat_uploaded_at` (timestamp actual si `soat_document_url` es provisto), `tecnomecanica_number`, `tecnomecanica_expiration_date`, `tecnomecanica_document_url` y `tecnomecanica_uploaded_at` (timestamp actual si `tecnomecanica_document_url` es provisto) en la tabla `vehicles` al crear o actualizar un vehículo.

---

### Requisito 3: Validación Documental de Mecánicos (Licencia de Conducción)

**User Story:** Como administrador del sistema, quiero que los mecánicos con licencia de conducción vencida no puedan aceptar nuevas solicitudes, para garantizar que solo mecánicos habilitados operen en la plataforma.

#### Criterios de Aceptación

1. WHEN un mecánico envía datos de perfil con campos de licencia de conducción, THE UserValidator SHALL aceptar `driver_license_number`, `driver_license_expiration_date` y `driver_license_document_url` como campos opcionales únicamente para usuarios con rol `mechanic`.
2. WHEN `driver_license_expiration_date` es proporcionado, THE UserValidator SHALL rechazar valores que no cumplan el formato `YYYY-MM-DD`.
3. WHEN `driver_license_document_url` es proporcionado, THE UserValidator SHALL rechazar valores que excedan 500 caracteres o que no sean URLs válidas.
4. WHEN `driver_license_number` es proporcionado, THE UserValidator SHALL rechazar valores que excedan 50 caracteres.
5. WHEN un mecánico intenta aceptar una solicitud de servicio y `driver_license_expiration_date` del mecánico en la tabla `users` es una fecha anterior a la fecha actual del sistema, THE ServiceRequestService SHALL lanzar una excepción con el mensaje `'La licencia de conducción del mecánico está vencida. No puede aceptar solicitudes.'`.
6. IF `driver_license_expiration_date` del mecánico es `NULL`, THEN THE ServiceRequestService SHALL permitir la aceptación de la solicitud sin validar la licencia.
7. THE ServiceRequestService SHALL consultar `driver_license_expiration_date` del mecánico desde la tabla `users` antes de ejecutar la asignación en el método `accept()`.
8. THE VehicleService SHALL persistir `driver_license_number`, `driver_license_expiration_date`, `driver_license_document_url` y `driver_license_uploaded_at` (timestamp actual si `driver_license_document_url` es provisto) en la tabla `users` cuando se actualiza el perfil del mecánico.

---

### Requisito 4: Sistema de Calificaciones Detallado

**User Story:** Como cliente, quiero calificar la puntualidad y la calidad del trabajo del mecánico de forma independiente a la calificación general, para proporcionar retroalimentación más específica que ayude a mejorar el servicio.

#### Criterios de Aceptación

1. WHEN un cliente envía una solicitud de calificación con `punctuality_rating`, THE ServiceRequestValidator SHALL rechazar valores menores a 1 o mayores a 5 con un error de validación en el campo `punctuality_rating`.
2. WHEN un cliente envía una solicitud de calificación con `service_quality_rating`, THE ServiceRequestValidator SHALL rechazar valores menores a 1 o mayores a 5 con un error de validación en el campo `service_quality_rating`.
3. WHEN un cliente califica un servicio, THE ServiceRequestService SHALL permitir que `punctuality_rating` y `service_quality_rating` sean campos opcionales en la misma llamada al endpoint `POST /api/service-requests/{id}/rate`.
4. WHEN un cliente califica un servicio completado, THE ServiceRequestService SHALL persistir `punctuality_rating` y `service_quality_rating` junto con `customer_rating` y `customer_feedback` en un único UPDATE a la tabla `service_requests`.
5. WHEN un cliente intenta calificar una solicitud cuyo `status` no es `completed`, THE ServiceRequestService SHALL lanzar una excepción indicando que solo se pueden calificar solicitudes completadas (comportamiento existente que debe preservarse).
6. WHEN un cliente intenta calificar una solicitud que ya tiene `customer_rating` asignado, THE ServiceRequestService SHALL lanzar una excepción indicando que la solicitud ya fue calificada (comportamiento existente que debe preservarse).
7. THE ServiceRequestService SHALL incluir `punctuality_rating` y `service_quality_rating` en la respuesta del endpoint `GET /api/service-requests/{id}`.

---

### Requisito 5: Evidencias Fotográficas de Servicios

**User Story:** Como mecánico, quiero subir URLs de imágenes como evidencia fotográfica del estado del vehículo antes, durante y después del servicio, para documentar el trabajo realizado y protegerme de posibles reclamaciones.

#### Criterios de Aceptación

1. WHEN un mecánico envía una solicitud al endpoint `POST /api/mechanic/requests/{id}/evidences`, THE ServiceRequestController SHALL validar que el usuario autenticado tenga rol `mechanic` antes de procesar la solicitud.
2. WHEN un mecánico envía una evidencia para una solicitud de servicio, THE ServiceRequestEvidenceService SHALL verificar que el mecánico autenticado es el `mechanic_id` asignado a esa solicitud.
3. IF el mecánico no es el asignado a la solicitud, THEN THE ServiceRequestEvidenceService SHALL lanzar una excepción con el mensaje `'No está asignado a esta solicitud de servicio.'`.
4. WHEN un mecánico envía una evidencia, THE ServiceRequestEvidenceService SHALL rechazar la operación si el `status` de la solicitud no es `assigned`, `in_progress` ni `completed`, retornando un error con mensaje `'Solo se pueden agregar evidencias a solicitudes en estado assigned, in_progress o completed.'`.
5. WHEN se valida la carga de una evidencia, THE ServiceRequestEvidenceService SHALL rechazar `evidence_type` que no sea `before`, `during` ni `after`.
6. WHEN se valida la URL de imagen de una evidencia, THE ServiceRequestEvidenceService SHALL rechazar valores que excedan 500 caracteres o que no sean URLs válidas con esquema `http` o `https`.
7. WHEN se valida la extensión de la URL de imagen, THE ServiceRequestEvidenceService SHALL rechazar URLs cuyo path no termine en `.jpg`, `.jpeg`, `.png` ni `.webp` (case-insensitive).
8. WHEN se proporciona `file_size` en la solicitud, THE ServiceRequestEvidenceService SHALL rechazar valores superiores a 5242880 bytes (5 MB).
9. WHEN una evidencia es válida, THE ServiceRequestEvidenceService SHALL insertar un registro en `service_request_evidences` con `service_request_id`, `uploaded_by` (ID del mecánico), `evidence_type`, `image_url`, `original_filename` (si se provee) y `file_size` (si se provee).
10. THE ServiceRequestController SHALL retornar la evidencia creada con HTTP 201 incluyendo los campos `id`, `service_request_id`, `uploaded_by`, `evidence_type`, `image_url`, `original_filename`, `file_size` y `created_at`.
11. WHEN un cliente o mecánico consulta el detalle de una solicitud de servicio, THE ServiceRequestService SHALL incluir la lista de evidencias (`service_request_evidences`) asociadas a esa solicitud en la respuesta con los campos `id`, `uploaded_by`, `evidence_type`, `image_url`, `original_filename`, `file_size` y `created_at`.

---

### Requisito 6: Integridad y Compatibilidad con Funcionalidades Existentes

**User Story:** Como desarrollador, quiero que todos los cambios se integren sin romper los endpoints y la lógica de negocio ya existentes, para no introducir regresiones en un MVP en uso activo.

#### Criterios de Aceptación

1. WHEN se ejecutan las nuevas migraciones (ALTER TABLE y CREATE TABLE), THE Migration_System SHALL no modificar ningún índice, constraint ni columna existente en las tablas `vehicles`, `users` y `service_requests`.
2. THE VehicleController SHALL continuar aceptando solicitudes de creación y actualización de vehículos sin los nuevos campos de SOAT y Tecnomecánica, manteniendo el comportamiento actual.
3. THE ServiceRequestController SHALL continuar procesando los endpoints existentes (`index`, `store`, `show`, `update`, `cancel`, `rate`, `accept`, `start`, `complete`, `availableForMechanic`, `mechanicIndex`) sin cambios en su interfaz HTTP ni en sus respuestas para los campos preexistentes.
4. WHEN el método `rate()` del `ServiceRequestService` es invocado con solo `customer_rating` (sin `punctuality_rating` ni `service_quality_rating`), THE ServiceRequestService SHALL completar la operación exitosamente sin error.
5. WHEN el método `accept()` del `ServiceRequestService` es invocado para un mecánico cuyo `driver_license_expiration_date` es `NULL`, THE ServiceRequestService SHALL completar la operación exitosamente sin error.
6. THE VehicleService SHALL continuar permitiendo la creación de vehículos sin los campos `soat_expiration_date` y `tecnomecanica_expiration_date`, y dichos vehículos podrán ser activados sin restricciones documentales.
