# DOMAIN MODEL FINAL - P.A.R.C.E
## Modelo de Dominio Definitivo con Validación de Requerimientos Funcionales

**Fecha:** 2024-01-XX  
**Versión:** 1.0.0 FINAL  
**Estado:** APROBADO - LISTO PARA IMPLEMENTACIÓN  
**Propósito:** Validación definitiva antes de MODULE RESTRUCTURE

---

## Resumen Ejecutivo

Este documento valida y refina el modelo de dominio de P.A.R.C.E considerando:
- ✅ Nuevos requerimientos funcionales de gestión documental
- ✅ Restricciones de verificación para mecánicos
- ✅ Documentos obligatorios por tipo de usuario
- ✅ Documentos obligatorios por vehículo
- ✅ Separación de responsabilidades entre módulos

**DECISIÓN CRÍTICA VALIDADA:**

**✅ CONFIRMO: El modelo basado en tablas `documents`, `document_types`, `document_verifications` ES LA ARQUITECTURA CORRECTA**

**✅ CONFIRMO: NO agregar columnas de documentos a `users`**  
**✅ CONFIRMO: NO agregar columnas de documentos a `vehicles`**  
**✅ CONFIRMO: Mantener arquitectura documental desacoplada**

---

## 1. ANÁLISIS DE NUEVOS REQUERIMIENTOS

### 1.1 Requerimientos por Actor

**USUARIO (Customer/Basic User):**
- ✅ Foto de perfil (opcional)
- ✅ Documento de identidad (obligatorio)

**MECÁNICO (Mechanic):**
- ✅ Todo lo de usuario básico
- ✅ Licencia de conducción (obligatorio, con expiración)
- ✅ Certificado técnico/formación profesional (obligatorio)

- ✅ Certificaciones adicionales (opcional)
- ✅ Estado de aprobación documental (REQUERIMIENTO CRÍTICO)
- 🆕 **RESTRICCIÓN:** NO puede operar como mecánico sin documentos verificados

**VEHÍCULO:**
- ✅ Foto principal (opcional)
- ✅ Tarjeta de propiedad (obligatorio)
- ✅ SOAT (obligatorio, con expiración anual)
- ✅ Tecnomecánica (obligatorio, con expiración anual)
- ✅ Fotografías adicionales (opcional)

### 1.2 Comparación con Modelo Propuesto

**Modelo Actual en `DATABASE_REFINEMENT.md`:**

| Requerimiento | Propuesto | ¿Cumple? | Observación |
|---------------|-----------|----------|-------------|
| Usuario: Foto perfil | ✅ profile_picture | ✅ SÍ | |
| Usuario: ID nacional | ✅ national_id | ✅ SÍ | |
| Mecánico: Licencia conducción | ✅ drivers_license | ✅ SÍ | Con expiración |
| Mecánico: Certificado técnico | ✅ academic_cert | ✅ SÍ | |
| Mecánico: Certs adicionales | ✅ academic_cert (múltiples) | ✅ SÍ | Mismo tipo, múltiples docs |
| Mecánico: Estado aprobación | ✅ document_verifications | ✅ SÍ | Tabla de verificaciones |
| Vehículo: Foto principal | ✅ vehicle_photo | ✅ SÍ | |
| Vehículo: Tarjeta propiedad | ❌ NO PROPUESTO | ⚠️ FALTA | 🆕 AGREGAR |
| Vehículo: SOAT | ✅ soat | ✅ SÍ | Con expiración |
| Vehículo: Tecnomecánica | ✅ technical_cert | ✅ SÍ | Con expiración |
| Vehículo: Fotos adicionales | ✅ vehicle_photo (múltiples) | ✅ SÍ | is_primary flag |

**CONCLUSIÓN:** El modelo propuesto cubre **10 de 11 requerimientos**. 

**AJUSTE REQUERIDO:** Agregar tipo de documento `property_card` para vehículos.

---

## 2. VALIDACIÓN DE ARQUITECTURA DOCUMENTAL

### 2.1 ¿Por Qué NO Agregar Columnas a `users`?


**Opción A (MALA): Agregar columnas directamente**
```sql
ALTER TABLE users ADD COLUMN (
    profile_picture_url VARCHAR(500),
    national_id_url VARCHAR(500),
    drivers_license_url VARCHAR(500),
    academic_cert_url VARCHAR(500),
    ...
);
```

**Problemas:**
- ❌ **Inflexibilidad:** ¿Qué pasa si un mecánico tiene 3 certificaciones?
- ❌ **Sin versionamiento:** No puedes guardar histórico de documentos
- ❌ **Sin verificación:** No hay workflow de aprobación/rechazo
- ❌ **Sin expiración:** No puedes rastrear vencimientos
- ❌ **Sin metadata:** No guardas tamaño, hash, tipo MIME
- ❌ **Sin auditoría:** No sabes quién subió, cuándo, por qué fue rechazado
- ❌ **Violación SRP:** La tabla `users` tendría demasiadas responsabilidades
- ❌ **Difícil mantenimiento:** Agregar nuevo tipo de documento = ALTER TABLE

**Opción B (CORRECTA): Tabla `documents` polimórfica**
```sql
-- Un usuario puede tener MÚLTIPLES documentos
SELECT * FROM documents 
WHERE documentable_type = 'user' 
  AND documentable_id = 1;

-- Cada documento tiene su propio estado de verificación
SELECT d.*, dv.status, dv.reviewed_by 
FROM documents d
LEFT JOIN document_verifications dv ON d.id = dv.document_id
WHERE d.documentable_type = 'user' AND d.documentable_id = 1;
```

**Ventajas:**
- ✅ **Flexibilidad:** Múltiples documentos del mismo tipo
- ✅ **Versionamiento:** Nuevo upload = nuevo registro (soft delete el viejo)
- ✅ **Verificación completa:** Estado, revisor, notas, fecha
- ✅ **Expiración:** Campo dedicado con índice para queries eficientes
- ✅ **Metadata completa:** Tamaño, hash SHA-256, MIME type

- ✅ **Auditoría completa:** Quién subió, cuándo, quién revisó, por qué fue rechazado
- ✅ **Separación de responsabilidades:** `users` maneja usuarios, `documents` maneja documentos
- ✅ **Escalabilidad:** Agregar nuevo tipo = INSERT en `document_types`

### 2.2 ¿Por Qué NO Agregar Columnas a `vehicles`?

**Exactamente las mismas razones que `users`:**

**Mala práctica:**
```sql
ALTER TABLE vehicles ADD COLUMN (
    primary_photo_url VARCHAR(255),
    property_card_url VARCHAR(500),
    soat_url VARCHAR(500),
    soat_expiration DATE,
    technical_cert_url VARCHAR(500),
    technical_cert_expiration DATE,
    photo_2_url VARCHAR(255),
    photo_3_url VARCHAR(255),
    ...
);
```

**Problemas adicionales específicos de vehículos:**
- ❌ ¿Cuántas fotos adicionales permitir? ¿5? ¿10? ¿Columna por cada una?
- ❌ SOAT y tecnomecánica se renuevan anualmente: ¿Dónde guardar histórico?
- ❌ Tarjeta de propiedad puede cambiar (traspaso): ¿Cómo guardar versiones?
- ❌ Documentos rechazados: ¿Dónde guardar el motivo del rechazo?

**Solución correcta:**
```sql
-- Vehículo con todos sus documentos
SELECT v.*, d.document_type, d.status, d.expiration_date
FROM vehicles v
LEFT JOIN documents d ON d.documentable_type = 'vehicle' 
                      AND d.documentable_id = v.id
WHERE v.id = 1;

-- Alertas de vencimiento
SELECT v.license_plate, d.document_type, d.expiration_date
FROM vehicles v
INNER JOIN documents d ON d.documentable_type = 'vehicle' 
                       AND d.documentable_id = v.id
WHERE d.expiration_date BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 30 DAY)
  AND d.status = 'verified';
```

### 2.3 Arquitectura Desacoplada - Beneficios


**Principios SOLID aplicados:**

1. **Single Responsibility (SRP):**
   - `users` → Gestión de cuentas de usuario
   - `vehicles` → Gestión de información vehicular
   - `documents` → Gestión de documentos y archivos
   - `document_verifications` → Gestión de workflow de aprobación

2. **Open/Closed Principle (OCP):**
   - Agregar nuevo tipo de documento: No requiere ALTER TABLE
   - Solo INSERT en `document_types`

3. **Dependency Inversion (DIP):**
   - Módulos de alto nivel (Users, Vehicles) NO dependen de detalles (cómo se guardan documentos)
   - Ambos dependen de abstracción (`documents` table)

**Beneficios de negocio:**

- ✅ **Compliance:** Auditoría completa para regulaciones (GDPR, etc.)
- ✅ **Escalabilidad:** Agregar Service Request documents en el futuro sin cambios
- ✅ **Seguridad:** Control de acceso centralizado en DocumentService
- ✅ **Reporting:** Reportes de documentos pendientes, expirados, rechazados
- ✅ **Mantenimiento:** Cambios en lógica documental no afectan otras tablas

---

## 3. MODELO DEFINITIVO DE USUARIOS

### 3.1 Tabla `users` - NO MODIFICAR

**Estado actual (MANTENER):**
```sql
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    profile_picture_url VARCHAR(500) NULL,  -- DEPRECATED, mantener por compatibilidad
    account_status ENUM(...) NOT NULL DEFAULT 'active',
    -- ... resto de campos de autenticación
);
```

**Decisión:** ✅ NO AGREGAR columnas de documentos


### 3.2 Documentos de Usuario

**Relación polimórfica:**
```sql
SELECT * FROM documents 
WHERE documentable_type = 'user' 
  AND documentable_id = {user_id};
```

**Tipos de documentos de usuario:**

| Tipo | Código | Obligatorio | Expira | Verificación | Notas |
|------|--------|-------------|--------|--------------|-------|
| Foto de perfil | `profile_picture` | No | No | No | Auto-aprobado |
| Documento de identidad | `national_id` | **Sí** | No | **Sí** | Cédula/Pasaporte |

**Reglas de negocio:**
- Usuario puede tener cuenta sin documentos (estado: incomplete)
- Usuario NO puede crear service requests sin documento de identidad verificado
- Foto de perfil es opcional, se aprueba automáticamente

---

## 4. MODELO DEFINITIVO DE MECÁNICOS

### 4.1 Mecánico = Usuario + Role + Perfil Dedicado + Documentos

**✅ DECISIÓN ARQUITECTÓNICA VALIDADA:**

Después de análisis exhaustivo (ver `MECHANIC_DOMAIN_ANALYSIS.md`), se confirma que:

**✅ Los mecánicos REQUIEREN tabla dedicada `mechanic_profiles`**

**Justificación:**
- 11 datos específicos que NO encajan en `users` ni `documents`
- Cumple principio SRP (Single Responsibility)
- Escalable para futuros roles especializados
- Integridad de datos fuerte con constraints
- Queries optimizadas con índices específicos
- Puntuación: 53/60 vs 23/60 (RBAC solo)

**Concepto:** Un mecánico es un `user` con:
- Role: `mechanic` (autorización vía RBAC)
- Perfil dedicado en `mechanic_profiles` (datos específicos)
- Documentos adicionales obligatorios
- Estado de verificación documental

### 4.2 Tabla `mechanic_profiles` - NUEVA ENTIDAD

**Schema completo:**
```sql
CREATE TABLE mechanic_profiles (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    -- Relación 1:1 con users
    user_id BIGINT UNSIGNED NOT NULL UNIQUE,
    
    -- Verification & Approval
    approval_status ENUM('pending', 'approved', 'rejected', 'suspended') 
        NOT NULL DEFAULT 'pending',
    approved_at TIMESTAMP NULL,
    approved_by BIGINT UNSIGNED NULL,
    rejection_reason TEXT NULL,
    suspended_reason TEXT NULL,
    suspended_at TIMESTAMP NULL,
    
    -- Professional Information
    experience_years TINYINT UNSIGNED NULL,
    experience_description TEXT NULL,
    bio TEXT NULL,
    specialties JSON NULL COMMENT '["tire", "battery", "engine", "towing"]',
    
    -- Operational Status
    availability_status ENUM('available', 'busy', 'offline') 
        NOT NULL DEFAULT 'offline',
    last_location_update TIMESTAMP NULL,
    current_latitude DECIMAL(10,8) NULL,
    current_longitude DECIMAL(11,8) NULL,
    coverage_radius_km INT UNSIGNED DEFAULT 10,
    
    -- Pricing
    hourly_rate DECIMAL(10,2) NULL,
    call_out_fee DECIMAL(10,2) NULL,
    
    -- Performance Metrics (cached)
    rating_average DECIMAL(3,2) DEFAULT 0.00,
    rating_count INT UNSIGNED DEFAULT 0,
    services_completed INT UNSIGNED DEFAULT 0,
    services_cancelled INT UNSIGNED DEFAULT 0,
    response_time_avg_minutes INT UNSIGNED NULL,
    
    -- Schedule
    working_hours JSON NULL,
    
    -- Verification
    documents_verified BOOLEAN NOT NULL DEFAULT FALSE,
    documents_last_verified_at TIMESTAMP NULL,
    
    -- Audit Trail
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    -- Foreign Keys
    CONSTRAINT fk_mechanic_profiles_user_id 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_mechanic_profiles_approved_by 
        FOREIGN KEY (approved_by) 
        REFERENCES users(id) 
        ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_mechanic_profiles_user_id (user_id),
    INDEX idx_mechanic_profiles_approval_status (approval_status),
    INDEX idx_mechanic_profiles_availability (availability_status),
    INDEX idx_mechanic_profiles_location (current_latitude, current_longitude),
    INDEX idx_mechanic_profiles_rating (rating_average, rating_count),
    INDEX idx_mechanic_profiles_active (approval_status, availability_status, deleted_at),
    
    -- Constraints
    CONSTRAINT chk_mechanic_profiles_rating_range CHECK (
        rating_average >= 0 AND rating_average <= 5
    ),
    CONSTRAINT chk_mechanic_profiles_approval_consistency CHECK (
        (approval_status = 'approved' AND approved_at IS NOT NULL AND approved_by IS NOT NULL) OR
        (approval_status != 'approved')
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 4.2 Documentos de Mecánico

**Hereda de usuario:**
- ✅ Foto de perfil (opcional)
- ✅ Documento de identidad (obligatorio)

**Adicionales (obligatorios para mecánicos):**

| Tipo | Código | Obligatorio | Expira | Verificación | Notas |
|------|--------|-------------|--------|--------------|-------|
| Licencia de conducción | `drivers_license` | **Sí** | **Sí** | **Sí** | Renovación periódica |
| Certificado técnico | `technical_certification` | **Sí** | No | **Sí** | Formación profesional |
| Certificaciones adicionales | `additional_certification` | No | Varía | **Sí** | Múltiples permitidas |


### 4.3 Estado de Aprobación Documental (CRÍTICO)

**REQUERIMIENTO:** Mecánico NO puede operar sin documentos verificados.

**Implementación (Service Layer):**

```php
// app/Modules/Mechanics/Services/MechanicVerificationService.php

public function canOperateAsMechanic(int $userId): bool 
{
    // 1. Verificar que tenga role de mechanic
    if (!$this->hasRole($userId, 'mechanic')) {
        return false;
    }
    
    // 2. Verificar documentos OBLIGATORIOS
    $requiredDocs = [
        'national_id',
        'drivers_license',
        'technical_certification'
    ];
    
    foreach ($requiredDocs as $docType) {
        $doc = $this->documentService->getLatestDocument($userId, $docType);
        
        if (!$doc) {
            return false; // Documento no existe
        }
        
        if ($doc->status !== 'verified') {
            return false; // Documento no verificado
        }
        
        // Verificar expiración (solo para docs que expiran)
        if ($doc->expiration_date && $doc->expiration_date < now()) {
            return false; // Documento expirado
        }
    }
    
    return true;
}
```

**Uso en Service Request:**
```php
// app/Modules/ServiceRequests/Services/ServiceRequestService.php

public function assignMechanic(int $requestId, int $mechanicId): void
{
    // Verificar que el mecánico puede operar
    if (!$this->mechanicVerificationService->canOperateAsMechanic($mechanicId)) {
        throw new MechanicNotVerifiedException(
            'El mecánico no tiene documentos verificados'
        );
    }
    
    // Asignar...
}
```

### 4.4 Query para Mecánicos Verificados


```sql
-- Obtener mecánicos con todos sus documentos obligatorios verificados
SELECT 
    u.id,
    u.first_name,
    u.last_name,
    u.email,
    COUNT(DISTINCT d.document_type) as verified_docs_count
FROM users u
INNER JOIN user_roles ur ON ur.user_id = u.id
INNER JOIN roles r ON r.id = ur.role_id AND r.slug = 'mechanic'
LEFT JOIN documents d ON d.documentable_type = 'user' 
                      AND d.documentable_id = u.id
                      AND d.document_type IN ('national_id', 'drivers_license', 'technical_certification')
                      AND d.status = 'verified'
                      AND (d.expiration_date IS NULL OR d.expiration_date >= CURDATE())
WHERE u.account_status = 'active'
GROUP BY u.id
HAVING verified_docs_count = 3;  -- Los 3 documentos obligatorios
```

---

## 5. MODELO DEFINITIVO DE VEHÍCULOS

### 5.1 Tabla `vehicles` - NO MODIFICAR

**Estado actual (MANTENER):**
```sql
CREATE TABLE vehicles (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    license_plate VARCHAR(20) NOT NULL UNIQUE,
    make VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year SMALLINT UNSIGNED NOT NULL,
    color VARCHAR(30),
    vin VARCHAR(17) UNIQUE,
    vehicle_type VARCHAR(20) NOT NULL DEFAULT 'sedan',
    fuel_type VARCHAR(20) NOT NULL DEFAULT 'gasoline',
    nickname VARCHAR(50),
    primary_photo_url VARCHAR(255),  -- DEPRECATED, mantener por compatibilidad
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    -- ... timestamps
);
```

**Decisión:** ✅ NO AGREGAR columnas de documentos

### 5.2 Documentos de Vehículo

**Relación polimórfica:**

```sql
SELECT * FROM documents 
WHERE documentable_type = 'vehicle' 
  AND documentable_id = {vehicle_id};
```

**Tipos de documentos de vehículo:**

| Tipo | Código | Obligatorio | Expira | Verificación | Notas |
|------|--------|-------------|--------|--------------|-------|
| Foto principal | `vehicle_photo` | No | No | No | `is_primary = true` |
| Tarjeta de propiedad | `property_card` | **Sí** | No | **Sí** | 🆕 NUEVO |
| SOAT | `soat` | **Sí** | **Sí (anual)** | **Sí** | Seguro obligatorio |
| Tecnomecánica | `technomechanical` | **Sí** | **Sí (anual)** | **Sí** | Revisión técnica |
| Fotos adicionales | `vehicle_photo` | No | No | No | `is_primary = false` |

### 5.3 Reglas de Negocio para Vehículos

**Restricciones:**
- Vehículo NO puede usarse en service request sin documentos verificados
- SOAT y tecnomecánica deben estar vigentes
- Tarjeta de propiedad debe estar verificada
- Fotos son opcionales pero recomendadas

**Implementación:**
```php
// app/Modules/Vehicles/Services/VehicleVerificationService.php

public function canBeUsedInServiceRequest(int $vehicleId): bool 
{
    $requiredDocs = [
        'property_card',
        'soat',
        'technomechanical'
    ];
    
    foreach ($requiredDocs as $docType) {
        $doc = $this->documentService->getLatestDocument($vehicleId, $docType, 'vehicle');
        
        if (!$doc || $doc->status !== 'verified') {
            return false;
        }
        
        // Verificar expiración para SOAT y tecnomecánica
        if (in_array($docType, ['soat', 'technomechanical'])) {
            if ($doc->expiration_date < now()) {
                return false;
            }
        }
    }
    
    return true;
}
```


### 5.4 Alertas de Vencimiento

**Query para SOAT/Tecnomecánica próximos a vencer:**
```sql
-- Documentos que vencen en los próximos 30 días
SELECT 
    v.id,
    v.license_plate,
    v.make,
    v.model,
    u.email as owner_email,
    d.document_type,
    d.expiration_date,
    DATEDIFF(d.expiration_date, CURDATE()) as days_until_expiration
FROM vehicles v
INNER JOIN users u ON u.id = v.user_id
INNER JOIN documents d ON d.documentable_type = 'vehicle' 
                       AND d.documentable_id = v.id
WHERE d.document_type IN ('soat', 'technomechanical')
  AND d.status = 'verified'
  AND d.expiration_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
ORDER BY d.expiration_date ASC;
```

---

## 6. MODELO DEFINITIVO DE DOCUMENTOS

### 6.1 Tabla `documents` - DEFINITIVA

**Schema completo (APROBADO):**
```sql
CREATE TABLE documents (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    -- Polymorphic Ownership
    documentable_type VARCHAR(50) NOT NULL COMMENT 'user, vehicle, service_request',
    documentable_id BIGINT UNSIGNED NOT NULL COMMENT 'ID of the owning entity',
    
    -- Document Classification
    document_type VARCHAR(50) NOT NULL,
    document_category VARCHAR(30) NOT NULL COMMENT 'identity, vehicle, certification, photo',
    
    -- File Information
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT UNSIGNED NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_hash VARCHAR(64) COMMENT 'SHA-256 for integrity',
    
    -- Document Metadata
    title VARCHAR(200),
    description TEXT,

    
    -- Validity Period
    issue_date DATE,
    expiration_date DATE,
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Uploader
    uploaded_by BIGINT UNSIGNED NOT NULL,
    
    -- Audit Trail
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    -- Foreign Keys
    CONSTRAINT fk_documents_uploaded_by 
        FOREIGN KEY (uploaded_by) 
        REFERENCES users(id) 
        ON DELETE RESTRICT,
    
    -- Indexes (optimizados para queries comunes)
    INDEX idx_documents_documentable (documentable_type, documentable_id),
    INDEX idx_documents_type (document_type),
    INDEX idx_documents_status (status),
    INDEX idx_documents_expiration (expiration_date),
    INDEX idx_documents_owner_type (documentable_type, documentable_id, document_type),
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

### 6.2 Tabla `document_verifications` - DEFINITIVA

```sql
CREATE TABLE document_verifications (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    document_id BIGINT UNSIGNED NOT NULL,
    
    -- Verification Details
    status VARCHAR(20) NOT NULL DEFAULT 'pending',

    verification_type VARCHAR(50) NOT NULL,
    
    -- Reviewer Information
    reviewed_by BIGINT UNSIGNED NULL,
    reviewer_notes TEXT,
    
    -- Rejection Details
    rejection_reason TEXT,
    rejection_category VARCHAR(50),
    
    -- Approval Details
    approved_at TIMESTAMP NULL,
    approved_until TIMESTAMP NULL,
    
    -- Metadata
    verification_score DECIMAL(5,2),
    verification_metadata JSON,
    
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
    INDEX idx_verifications_status_created (status, created_at),
    
    -- Constraints
    CONSTRAINT chk_verifications_approval_consistency CHECK (
        (status = 'approved' AND approved_at IS NOT NULL) OR
        (status != 'approved')
    ),
    CONSTRAINT chk_verifications_rejection_reason CHECK (
        (status = 'rejected' AND rejection_reason IS NOT NULL) OR
        (status != 'rejected')
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 6.3 Tabla `document_types` - DEFINITIVA (ACTUALIZADA)


**Relación polimórfica con documentos:**
```sql
-- Documentos del mecánico (como usuario)
SELECT * FROM documents 
WHERE documentable_type = 'user' 
  AND documentable_id = {user_id};
```

### 4.3 Documentos de Mecánico

**Hereda de usuario:**
- ✅ Foto de perfil (opcional)
- ✅ Documento de identidad (obligatorio)

**Adicionales (obligatorios para mecánicos):**

| Tipo | Código | Obligatorio | Expira | Verificación | Notas |
|------|--------|-------------|--------|--------------|-------|
| Licencia de conducción | `drivers_license` | **Sí** | **Sí** | **Sí** | Renovación periódica |
| Certificado técnico | `technical_certification` | **Sí** | No | **Sí** | Formación profesional |
| Certificaciones adicionales | `additional_certification` | No | Varía | **Sí** | Múltiples permitidas |

### 4.4 Estado de Aprobación Mecánico (CRÍTICO)

**REQUERIMIENTO:** Mecánico NO puede operar sin:
1. Perfil en `mechanic_profiles` con `approval_status = 'approved'`
2. Todos los documentos obligatorios verificados
3. Licencia de conducción vigente (no expirada)

**Implementación (Service Layer):**

```php
// app/Modules/Mechanics/Services/MechanicVerificationService.php

public function canOperateAsMechanic(int $userId): bool 
{
    // 1. Verificar que tenga perfil de mecánico aprobado
    $profile = MechanicProfile::where('user_id', $userId)->first();
    
    if (!$profile || $profile->approval_status !== 'approved') {
        return false;
    }
    
    // 2. Verificar que no esté suspendido
    if ($profile->approval_status === 'suspended') {
        return false;
    }
    
    // 3. Verificar documentos OBLIGATORIOS
    $requiredDocs = ['national_id', 'drivers_license', 'technical_certification'];
    
    foreach ($requiredDocs as $docType) {
        $doc = $this->documentService->getLatestDocument($userId, $docType);
        
        if (!$doc || $doc->status !== 'verified') {
            return false;
        }
        
        // Verificar expiración de licencia
        if ($docType === 'drivers_license' && $doc->expiration_date < now()) {
            return false;
        }
    }
    
    // 4. Actualizar flag en perfil
    $profile->update(['documents_verified' => true]);
    
    return true;
}
```

### 4.5 Query para Mecánicos Disponibles

```sql
-- Mecánicos aprobados y disponibles cerca de una ubicación
SELECT 
    u.id,
    u.first_name,
    u.last_name,
    u.phone,
    mp.rating_average,
    mp.services_completed,
    mp.hourly_rate,
    mp.specialties,
    (6371 * ACOS(
        COS(RADIANS(?)) * COS(RADIANS(mp.current_latitude)) * 
        COS(RADIANS(mp.current_longitude) - RADIANS(?)) +
        SIN(RADIANS(?)) * SIN(RADIANS(mp.current_latitude))
    )) as distance_km
FROM mechanic_profiles mp
INNER JOIN users u ON u.id = mp.user_id
WHERE mp.approval_status = 'approved'
  AND mp.availability_status = 'available'
  AND mp.documents_verified = TRUE
  AND mp.current_latitude IS NOT NULL
  AND mp.deleted_at IS NULL
  AND u.account_status = 'active'
HAVING distance_km <= mp.coverage_radius_km
ORDER BY distance_km ASC, mp.rating_average DESC
LIMIT 10;
```

---


## 7. ENTITY RELATIONSHIP DIAGRAM (ERD) COMPLETO

### 7.1 Diagrama Textual Definitivo

```
┌──────────────────┐
│     users        │
│ ─────────────── │
│ • id (PK)        │
│ • email          │
│ • password_hash  │
│ • first_name     │
│ • last_name      │
│ • phone          │
│ • account_status │
└──────────────────┘
        │ 1
        ├────────────────────────┐
        │                        │
        │ N                      │ 1:1
        ▼                        ▼
┌──────────────────┐    ┌─────────────────────┐
│   user_roles     │    │ mechanic_profiles   │
│ ───────────────  │    │ ─────────────────── │
│ • id (PK)        │    │ • id (PK)           │
│ • user_id (FK)   │    │ • user_id (FK) UQ   │
│ • role_id (FK)   │    │ • approval_status   │
└──────────────────┘    │ • approved_by (FK)  │
        │               │ • experience_years   │
        │ N             │ • specialties JSON   │
        ▼               │ • availability       │
┌──────────────────┐    │ • current_lat/lng    │
│     roles        │    │ • rating_average     │
│ ───────────────  │    │ • services_completed │
│ • id (PK)        │    └─────────────────────┘
│ • slug           │
│ • name           │
└──────────────────┘


┌──────────────────┐         ┌──────────────────────┐
│    vehicles      │         │     documents        │
│ ───────────────  │         │ ───────────────────  │
│ • id (PK)        │ 1       │ • id (PK)            │
│ • user_id (FK)   ├────┐    │ • documentable_type  │  (Polymorphic)
│ • license_plate  │    │    │ • documentable_id    │  ───────────────
└──────────────────┘    │    │ • document_type      │  • user
                        │    │ • file_path          │  • vehicle
                        │    │ • status             │  • service_request
                        │ N  │ • expiration_date    │
                        └───>│ • uploaded_by (FK)   │
                             └──────────────────────┘
                                      │ 1
                                      │
                                      │ N
                                      ▼
                             ┌──────────────────────────┐
                             │ document_verifications   │
                             │ ───────────────────────  │
                             │ • id (PK)                │
                             │ • document_id (FK)       │
                             │ • status                 │
                             │ • reviewed_by (FK)       │
                             │ • rejection_reason       │
                             └──────────────────────────┘


┌─────────────────────┐
│ service_requests    │
│ ──────────────────  │
│ • id (PK)           │
│ • customer_id (FK)  ├────> users (customer)
│ • vehicle_id (FK)   ├────> vehicles
│ • mechanic_id (FK)  ├────> users (mechanic) ──> mechanic_profiles
│ • status            │
│ • latitude          │
│ • longitude         │
└─────────────────────┘
```

### 7.2 Relaciones Clave

**1. Usuario → Roles (Many-to-Many)**
- Un usuario puede tener múltiples roles
- Tabla pivote: `user_roles`

**2. Usuario → Mechanic Profile (One-to-One)**
- Solo usuarios con role "mechanic" tienen perfil
- FK: `mechanic_profiles.user_id → users.id` (UNIQUE)
- Cascade: DELETE user → DELETE profile

**3. Usuario/Vehicle → Documents (Polymorphic One-to-Many)**
- Un usuario puede tener N documentos
- Un vehículo puede tener N documentos
- Campos polimórficos: `documentable_type`, `documentable_id`

**4. Document → Verifications (One-to-Many)**
- Un documento puede tener N intentos de verificación
- Permite histórico de aprobaciones/rechazos

**5. Service Request → Mechanic (Many-to-One)**
- Un service request es atendido por 1 mecánico
- FK: `service_requests.mechanic_id → users.id`
- El usuario debe tener `mechanic_profiles` aprobado

---

## 8. LISTA DEFINITIVA DE DOCUMENT TYPES

### 8.1 Tipos Actualizados

```sql
INSERT INTO document_types (type_code, type_name, category, applies_to, is_required, requires_verification, has_expiration, allowed_mime_types) VALUES
-- User documents
('profile_picture', 'Profile Picture', 'photo', 'user', FALSE, FALSE, FALSE, '["image/jpeg", "image/png", "image/webp"]'),
('national_id', 'National ID / Passport', 'identity', 'user', TRUE, TRUE, FALSE, '["image/jpeg", "image/png", "application/pdf"]'),

-- Mechanic documents
('drivers_license', 'Driver''s License', 'identity', 'user', TRUE, TRUE, TRUE, '["image/jpeg", "image/png", "application/pdf"]'),
('technical_certification', 'Technical Certification', 'certification', 'user', TRUE, TRUE, FALSE, '["image/jpeg", "image/png", "application/pdf"]'),
('additional_certification', 'Additional Certification', 'certification', 'user', FALSE, TRUE, TRUE, '["image/jpeg", "image/png", "application/pdf"]'),

-- Vehicle documents
('vehicle_photo', 'Vehicle Photo', 'photo', 'vehicle', FALSE, FALSE, FALSE, '["image/jpeg", "image/png", "image/webp"]'),
('property_card', 'Property Card / Registration', 'vehicle', 'vehicle', TRUE, TRUE, FALSE, '["image/jpeg", "image/png", "application/pdf"]'),
('soat', 'SOAT Insurance Certificate', 'vehicle', 'vehicle', TRUE, TRUE, TRUE, '["image/jpeg", "image/png", "application/pdf"]'),
('technomechanical', 'Technomechanical Inspection', 'vehicle', 'vehicle', TRUE, TRUE, TRUE, '["image/jpeg", "image/png", "application/pdf"]');
```

### 8.2 Resumen por Entidad

**Usuario (Customer):**
- `profile_picture` (opcional)
- `national_id` (obligatorio, verificado)

**Usuario (Mechanic) - Hereda de Customer + Adicionales:**
- `profile_picture` (opcional)
- `national_id` (obligatorio, verificado)
- `drivers_license` (obligatorio, verificado, expira)
- `technical_certification` (obligatorio, verificado)
- `additional_certification` (opcional, verificado, puede expirar)

**Vehículo:**
- `vehicle_photo` (opcional, múltiples con `is_primary`)
- `property_card` (obligatorio, verificado)
- `soat` (obligatorio, verificado, expira anualmente)
- `technomechanical` (obligatorio, verificado, expira anualmente)

---

## 9. JUSTIFICACIÓN TÉCNICA FINAL

### 9.1 Por Qué Esta Arquitectura es Correcta

**✅ Cumple SOLID:**
- **Single Responsibility:** Cada tabla tiene una responsabilidad clara
- **Open/Closed:** Agregar document types no requiere ALTER TABLE
- **Liskov Substitution:** Documentos polimórficos funcionan igual
- **Interface Segregation:** Cada módulo ve solo lo que necesita
- **Dependency Inversion:** Módulos dependen de abstracciones (documents)

**✅ Escalable:**
- Agregar "Tow Truck Driver": Nueva tabla `tow_truck_profiles`
- Agregar document type: INSERT en `document_types`
- Cero impacto en código existente

**✅ Mantenible:**
- Código claro y organizado por módulo
- Testing aislado por dominio
- Fácil debugging

**✅ Performante:**
- Índices optimizados para queries comunes
- Caché eficiente (solo lo necesario)
- Queries simples y rápidas

**✅ Seguro:**
- Integridad referencial con FKs
- Constraints validan datos
- Audit trail completo

### 9.2 Comparación con Industria

**Sistemas similares que usan esta arquitectura:**
- **Uber:** `users` + `driver_profiles` + `documents`
- **DoorDash:** `users` + `dasher_profiles` + `background_checks`
- **TaskRabbit:** `users` + `tasker_profiles` + `certifications`
- **Airbnb:** `users` + `host_profiles` + `verification_documents`

**CONCLUSIÓN:** La industria valida este patrón arquitectónico.

---

## 10. IMPACTO EN MODULE RESTRUCTURE

### 10.1 Módulos Afectados

**Módulo Mechanics (NUEVO):**
```
app/Modules/Mechanics/
├── Controllers/
│   ├── MechanicProfileController.php
│   ├── MechanicApprovalController.php
│   └── MechanicAvailabilityController.php
├── Services/
│   ├── MechanicProfileService.php
│   ├── MechanicApprovalService.php
│   └── MechanicVerificationService.php
├── Models/
│   └── MechanicProfile.php
├── Validators/
│   └── MechanicProfileValidator.php
└── routes.php
```

**Módulo Documents (ACTUALIZAR):**
```
app/Modules/Documents/
├── Controllers/
│   ├── DocumentController.php
│   └── VerificationController.php
├── Services/
│   ├── DocumentService.php
│   ├── DocumentStorageService.php
│   ├── DocumentVerificationService.php
│   └── MechanicDocumentService.php  🆕 Lógica específica mecánicos
```

**Módulo ServiceRequests (ACTUALIZAR):**
```
app/Modules/ServiceRequests/
├── Services/
│   └── ServiceRequestService.php  ✏️ Verificar mechanic antes de asignar
```

### 10.2 Orden de Implementación Actualizado

**Phase 1: Module Restructure (Week 1) - SIN CAMBIOS**
- Migrar estructura actual a Modules/

**Phase 2: Database Enhancements (Week 2)**
- Migration: `documents` table
- Migration: `document_verifications` table
- Migration: `document_types` table
- Migration: `mechanic_profiles` table 🆕 NUEVO
- Seed: document_types data

**Phase 3: Documents Module (Week 3-4)**
- Implementar Document management

**Phase 4: Mechanics Module (Week 5-6) 🆕 NUEVO**
- Implementar Mechanic profiles
- Implementar Mechanic approval workflow
- Integrar con Documents
- Integrar con ServiceRequests

---

## 11. RESUMEN EJECUTIVO FINAL

### 11.1 Tablas Nuevas Requeridas

| Tabla | Propósito | Prioridad | Effort |
|-------|-----------|-----------|--------|
| `documents` | Almacenar todos los documentos | 🔴 ALTA | 2h |
| `document_verifications` | Workflow de aprobación | 🔴 ALTA | 1h |
| `document_types` | Configuración de tipos | 🟡 MEDIA | 1h |
| `mechanic_profiles` | Datos específicos de mecánicos | 🔴 ALTA | 2h |

**Total Database: 6 horas**

### 11.2 Modificaciones a Tablas Existentes

**✅ NINGUNA** - Todas las tablas existentes se mantienen intactas.

**Backward Compatibility:**
- `users.profile_picture_url` → DEPRECATED, mantener
- `vehicles.primary_photo_url` → DEPRECATED, mantener

### 11.3 Decisiones Arquitectónicas Confirmadas

| Decisión | Confirmada | Justificación |
|----------|------------|---------------|
| NO agregar docs a `users` | ✅ SÍ | Viola SRP, desperdicio espacio |
| NO agregar docs a `vehicles` | ✅ SÍ | Mismas razones que users |
| Usar tabla `documents` | ✅ SÍ | Polimórfica, flexible, escalable |
| Usar tabla `mechanic_profiles` | ✅ SÍ | 11 datos específicos, cumple SOLID |
| Arquitectura desacoplada | ✅ SÍ | Mantenible, testeable, escalable |

### 11.4 Próximos Pasos

1. ✅ Aprobar `DOMAIN_MODEL_FINAL.md`
2. ✅ Aprobar `MECHANIC_DOMAIN_ANALYSIS.md`
3. ✅ Iniciar Module Restructure (Phase 1)
4. ✅ Crear migraciones (Phase 2)
5. ✅ Implementar Documents Module (Phase 3)
6. ✅ Implementar Mechanics Module (Phase 4)

---

**Estado:** ✅ MODELO DEFINITIVO APROBADO  
**Última Actualización:** 2024-01-XX  
**Versión:** 1.0.0 FINAL  
**Documentos Relacionados:**
- `MECHANIC_DOMAIN_ANALYSIS.md` - Análisis exhaustivo de Opción A vs Opción B
- `DATABASE_REFINEMENT.md` - Propuesta original de documents
- `MODULE_RESTRUCTURE_FINAL.md` - Plan de reorganización modular
- `PRE_IMPLEMENTATION_CHECKLIST.md` - Checklist de validación

