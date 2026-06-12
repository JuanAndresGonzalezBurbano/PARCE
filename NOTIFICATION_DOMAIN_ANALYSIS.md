# NOTIFICATION DOMAIN ANALYSIS - P.A.R.C.E
## Validación Final: ¿Módulo Notifications en Arquitectura Base?

**Fecha:** 2024-01-XX  
**Versión:** 1.0.0 FINAL  
**Estado:** VALIDACIÓN EN PROGRESO  
**Propósito:** Determinar si Notifications debe ser parte de la arquitectura base

---

## 1. ANÁLISIS DE EVENTOS DEL SISTEMA

### 1.1 Eventos Identificados

**Eventos de Service Request (8 eventos):**
1. ✅ Solicitud creada → Notificar mecánicos cercanos disponibles
2. ✅ Solicitud aceptada → Notificar customer (mecánico asignado)
3. ✅ Solicitud iniciada → Notificar customer (mecánico en camino)
4. ✅ Solicitud completada → Notificar customer (pedir calificación)
5. ⚠️ Solicitud cancelada → Notificar mecánico si estaba asignada
6. ⚠️ Solicitud expirada → Notificar customer (timeout)
7. ⚠️ Mecánico rechazó → Notificar customer (buscar otro mecánico)
8. ⚠️ Mecánico llegó → Notificar customer (mecánico en el lugar)

**Eventos de Documentos (4 eventos):**
1. ✅ Documento aprobado → Notificar user (documento verificado)
2. ✅ Documento rechazado → Notificar user (motivo de rechazo)
3. ⚠️ Documento pendiente verificación → Notificar admins
4. ⚠️ Documento subido → Notificar admins (cola de revisión)

**Eventos de Mecánico (3 eventos):**
1. ✅ Mecánico aprobado → Notificar mechanic (puede operar)
2. ✅ Mecánico rechazado → Notificar mechanic (motivo)
3. ⚠️ Mecánico suspendido → Notificar mechanic (cuenta suspendida)

**Eventos de Expiración (3 eventos):**
1. ✅ SOAT próximo a vencer → Notificar vehicle owner (30, 15, 7 días antes)
2. ✅ Tecnomecánica próxima a vencer → Notificar vehicle owner
3. ✅ Licencia próxima a vencer → Notificar mechanic

**Total: 18 eventos identificados**

### 1.2 Clasificación por Criticidad

| Evento | Criticidad | ¿MVP? | Razón |
|--------|------------|-------|-------|
| Solicitud creada | 🔴 ALTA | ✅ SÍ | Core business - asignación mecánico |
| Solicitud aceptada | 🔴 ALTA | ✅ SÍ | Customer debe saber quién viene |
| Solicitud iniciada | 🔴 ALTA | ✅ SÍ | Customer tracking |
| Solicitud completada | 🔴 ALTA | ✅ SÍ | Pedir rating |
| Documento aprobado | 🟡 MEDIA | ⚠️ MAYBE | UX improvement |
| Documento rechazado | 🟡 MEDIA | ⚠️ MAYBE | UX improvement |
| Mecánico aprobado | 🟡 MEDIA | ⚠️ MAYBE | Puede ver en dashboard |
| Mecánico rechazado | 🟡 MEDIA | ⚠️ MAYBE | Puede ver en dashboard |
| SOAT vence | 🟡 MEDIA | ❌ NO | Nice to have, no bloqueante |
| Tecnomecánica vence | 🟡 MEDIA | ❌ NO | Nice to have, no bloqueante |
| Licencia vence | 🟡 MEDIA | ❌ NO | Nice to have, no bloqueante |

**Conclusión:**
- **4 eventos CRÍTICOS** para MVP (service request lifecycle)
- **4 eventos MEDIOS** útiles pero no bloqueantes
- **3 eventos BAJOS** (expiración) pueden esperar

### 1.3 Canales de Notificación

**Canales posibles:**

| Canal | Complejidad | Costo | Tiempo Real | MVP? |
|-------|-------------|-------|-------------|------|
| **In-App (Frontend)** | BAJA | $0 | ✅ Sí | ✅ SÍ |
| **Email (SMTP)** | MEDIA | $0 | ❌ No | ✅ SÍ |
| **SMS (Twilio)** | MEDIA | $$ | ✅ Sí | ⚠️ MAYBE |
| **Push (Web Push)** | ALTA | $0 | ✅ Sí | ❌ NO |
| **WhatsApp** | ALTA | $$$ | ✅ Sí | ❌ NO |

**Recomendación MVP:**
- ✅ **In-App:** Obligatorio (badge, lista de notificaciones)
- ✅ **Email:** Obligatorio (eventos importantes)
- ⚠️ **SMS:** Opcional (solo solicitud aceptada/iniciada)
- ❌ **Push/WhatsApp:** Phase 7+

---

## 2. ARQUITECTURA PROPUESTA

### 2.1 ¿Necesita Tabla `notifications`?

**SÍ, definitivamente necesita tabla dedicada.**

**Razones:**

1. **Histórico persistente:**
   - Usuario debe poder ver notificaciones antiguas
   - "Hace 2 horas: Tu solicitud fue aceptada"
   
2. **Estado de lectura:**
   - Marcar como leída/no leída
   - Badge con contador de no leídas

3. **Múltiples canales:**
   - In-app: Siempre se guarda
   - Email: Log de envíos
   - SMS: Log de envíos con costo

4. **Auditoría:**
   - ¿Se notificó al usuario?
   - ¿Cuándo se leyó?
   - ¿Qué canal falló?

5. **Retry logic:**
   - Si email falla, reintentar
   - Si SMS falla, intentar email

### 2.2 Schema Propuesto

```sql
CREATE TABLE notifications (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    -- Recipient
    user_id BIGINT UNSIGNED NOT NULL COMMENT 'Who receives this notification',
    
    -- Notification Type
    type VARCHAR(50) NOT NULL COMMENT 'service_request_accepted, document_approved, etc.',
    title VARCHAR(200) NOT NULL COMMENT 'Notification title',
    message TEXT NOT NULL COMMENT 'Notification body',
    
    -- Related Entity (polymorphic)
    notifiable_type VARCHAR(50) NULL COMMENT 'service_request, document, mechanic_profile',
    notifiable_id BIGINT UNSIGNED NULL COMMENT 'ID of related entity',
    
    -- Metadata
    data JSON NULL COMMENT 'Additional data (request_id, mechanic_name, etc.)',
    action_url VARCHAR(500) NULL COMMENT 'Deep link to related resource',
    
    -- Delivery Status
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    
    -- Multi-channel Delivery
    channels JSON NOT NULL COMMENT '["in_app", "email", "sms"]',
    email_sent_at TIMESTAMP NULL,
    email_delivered BOOLEAN DEFAULT FALSE,
    sms_sent_at TIMESTAMP NULL,
    sms_delivered BOOLEAN DEFAULT FALSE,
    push_sent_at TIMESTAMP NULL,
    push_delivered BOOLEAN DEFAULT FALSE,
    
    -- Priority
    priority ENUM('low', 'normal', 'high', 'urgent') NOT NULL DEFAULT 'normal',
    
    -- Expiration
    expires_at TIMESTAMP NULL COMMENT 'Auto-hide after this date',
    
    -- Audit Trail
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL COMMENT 'Soft delete',
    
    -- Foreign Keys
    CONSTRAINT fk_notifications_user_id 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_notifications_user_id (user_id),
    INDEX idx_notifications_type (type),
    INDEX idx_notifications_is_read (is_read),
    INDEX idx_notifications_created_at (created_at),
    INDEX idx_notifications_deleted_at (deleted_at),
    
    -- Composite Indexes (common queries)
    INDEX idx_notifications_user_unread (user_id, is_read, created_at DESC),
    INDEX idx_notifications_user_type (user_id, type, created_at DESC),
    INDEX idx_notifications_notifiable (notifiable_type, notifiable_id),
    
    -- Constraints
    CONSTRAINT chk_notifications_read_consistency CHECK (
        (is_read = TRUE AND read_at IS NOT NULL) OR
        (is_read = FALSE)
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2.3 Notification Types (Enum)

```php
// app/Modules/Notifications/Enums/NotificationType.php

enum NotificationType: string
{
    // Service Request Events
    case SERVICE_REQUEST_CREATED = 'service_request_created';
    case SERVICE_REQUEST_ACCEPTED = 'service_request_accepted';
    case SERVICE_REQUEST_STARTED = 'service_request_started';
    case SERVICE_REQUEST_COMPLETED = 'service_request_completed';
    case SERVICE_REQUEST_CANCELLED = 'service_request_cancelled';
    
    // Document Events
    case DOCUMENT_APPROVED = 'document_approved';
    case DOCUMENT_REJECTED = 'document_rejected';
    case DOCUMENT_PENDING_REVIEW = 'document_pending_review';
    
    // Mechanic Events
    case MECHANIC_APPROVED = 'mechanic_approved';
    case MECHANIC_REJECTED = 'mechanic_rejected';
    case MECHANIC_SUSPENDED = 'mechanic_suspended';
    
    // Expiration Alerts
    case SOAT_EXPIRING_SOON = 'soat_expiring_soon';
    case TECHNOMECHANICAL_EXPIRING_SOON = 'technomechanical_expiring_soon';
    case LICENSE_EXPIRING_SOON = 'license_expiring_soon';
}
```

---

## 3. IMPLEMENTACIÓN RECOMENDADA

### 3.1 Módulo Notifications Structure

```
app/Modules/Notifications/
├── Controllers/
│   └── NotificationController.php      - List, mark as read, delete
│
├── Services/
│   ├── NotificationService.php         - Create, send, manage
│   ├── EmailNotificationService.php    - Email channel
│   ├── SmsNotificationService.php      - SMS channel (Twilio)
│   └── InAppNotificationService.php    - In-app storage
│
├── Events/
│   ├── ServiceRequestAccepted.php      - Event classes
│   ├── DocumentApproved.php
│   └── ...
│
├── Listeners/
│   ├── SendServiceRequestNotification.php
│   ├── SendDocumentNotification.php
│   └── ...
│
├── Templates/
│   ├── email/
│   │   ├── service_request_accepted.blade.php
│   │   ├── document_approved.blade.php
│   │   └── ...
│   └── sms/
│       ├── service_request_accepted.txt
│       └── ...
│
├── Models/
│   └── Notification.php
│
└── routes.php
```

### 3.2 API Endpoints

**User Endpoints:**
```
GET    /api/notifications                  - List user's notifications
GET    /api/notifications/unread/count     - Count unread
PATCH  /api/notifications/{id}/read        - Mark as read
PATCH  /api/notifications/read-all         - Mark all as read
DELETE /api/notifications/{id}             - Delete notification
GET    /api/notifications/settings         - Notification preferences
PUT    /api/notifications/settings         - Update preferences
```

**Admin Endpoints:**
```
POST   /api/admin/notifications/broadcast  - Broadcast to all users
GET    /api/admin/notifications/stats      - Delivery stats
```

### 3.3 Event-Driven Architecture

**Example Flow:**

```php
// 1. Event triggered
event(new ServiceRequestAccepted($serviceRequest, $mechanic));

// 2. Listener handles
class SendServiceRequestNotification
{
    public function handle(ServiceRequestAccepted $event)
    {
        $notification = $this->notificationService->create([
            'user_id' => $event->serviceRequest->customer_id,
            'type' => NotificationType::SERVICE_REQUEST_ACCEPTED,
            'title' => '¡Mecánico asignado!',
            'message' => "{$event->mechanic->first_name} aceptó tu solicitud",
            'notifiable_type' => 'service_request',
            'notifiable_id' => $event->serviceRequest->id,
            'channels' => ['in_app', 'email', 'sms'],
            'priority' => 'high',
            'action_url' => "/requests/{$event->serviceRequest->id}",
            'data' => [
                'mechanic_name' => $event->mechanic->full_name,
                'mechanic_phone' => $event->mechanic->phone,
                'request_code' => $event->serviceRequest->service_code,
            ]
        ]);
        
        // Send via channels
        $this->notificationService->send($notification);
    }
}
```

---

## 4. OPCIÓN A: IMPLEMENTAR AHORA (Phase 3-4)

### 4.1 Justificación

**PRO:**
- ✅ **Core feature:** Notificaciones son CRÍTICAS para UX
- ✅ **Service Request depende:** Customer debe saber estado de solicitud
- ✅ **Integración temprana:** Más fácil integrar durante desarrollo
- ✅ **Testing completo:** Workflows probados desde el inicio

**CONTRA:**
- ❌ **Tiempo:** +30-40 horas de desarrollo
- ❌ **Complejidad:** Event-driven architecture
- ❌ **Dependencies:** SMTP config, SMS API (Twilio)

### 4.2 Impacto en Roadmap

**Si se implementa en Phase 3-4:**

**Backend (+20 horas):**
- Crear tabla `notifications`
- NotificationService (create, send, read, delete)
- Event listeners para service requests
- Email templates
- SMTP configuration

**Frontend (+15 horas):**
- Notification bell icon con badge
- Notification dropdown/modal
- Notification list page
- Mark as read functionality
- Notification settings page

**Total:** +35 horas → Roadmap pasa de 160h a **195h (7.5 semanas)**

### 4.3 Prioridad de Eventos para MVP

**Phase 3 (Must Have):**
1. ✅ Solicitud aceptada (CRÍTICO)
2. ✅ Solicitud iniciada (CRÍTICO)
3. ✅ Solicitud completada (CRÍTICO)

**Phase 4 (Should Have):**
4. ✅ Documento aprobado
5. ✅ Documento rechazado
6. ✅ Mecánico aprobado

**Phase 7 (Nice to Have):**
7. ⚠️ Expiraciones (SOAT, licencia, etc.)
8. ⚠️ Solicitud cancelada
9. ⚠️ Broadcast messages

---

## 5. OPCIÓN B: RESERVAR PARA PHASE 7 (Post-MVP)

### 5.1 Justificación

**PRO:**
- ✅ **MVP más rápido:** Launch en 6.5 semanas vs 7.5 semanas
- ✅ **Priorización:** Focus en features core primero
- ✅ **Workaround temporal:** Email directo sin tabla

**CONTRA:**
- ❌ **UX pobre:** Customer no sabe estado de solicitud en tiempo real
- ❌ **Refactor futuro:** Agregar eventos después es más complejo
- ❌ **Testing incompleto:** Workflows sin notificaciones reales
- ❌ **Deuda técnica:** Email directo sin logs ni retry

### 5.2 Workaround Temporal (Sin Notifications Module)

```php
// Enviar email directo (sin tabla notifications)
Mail::to($customer->email)->send(new ServiceRequestAcceptedMail($request, $mechanic));
```

**Problemas del workaround:**
- ❌ No hay histórico de notificaciones
- ❌ No hay UI in-app
- ❌ No hay retry si email falla
- ❌ No hay logs de delivery
- ❌ No se puede marcar como leído
- ❌ No hay badge de "nuevas notificaciones"

### 5.3 Impacto en UX

**Sin Notifications:**
- ❌ Customer debe refrescar página para ver cambios
- ❌ No hay indicador visual de "novedad"
- ❌ Mecánico no recibe alertas de nuevas solicitudes
- ❌ Pobre experiencia vs competencia (Uber, etc.)

**Con Notifications:**
- ✅ Customer ve en tiempo real cuando mecánico acepta
- ✅ Badge muestra "Tienes 3 notificaciones nuevas"
- ✅ Mecánico recibe alerta de solicitud nueva cerca
- ✅ Experiencia profesional y moderna

---

## 6. COMPARACIÓN: Ahora vs Después

### 6.1 Matriz de Decisión

| Factor | Implementar Ahora | Implementar Phase 7 | Ganador |
|--------|-------------------|---------------------|---------|
| **Time to Market** | 7.5 weeks | 6.5 weeks | **Phase 7** |
| **UX Quality** | ✅ Excelente | ❌ Pobre | **Ahora** |
| **Technical Debt** | ✅ Ninguna | ❌ Alta | **Ahora** |
| **Complexity** | ⚠️ Media | ✅ Baja (sin módulo) | **Phase 7** |
| **Refactor Cost** | ✅ $0 | ❌ $$$$ | **Ahora** |
| **Competitive Edge** | ✅ Profesional | ❌ Básico | **Ahora** |
| **Testing** | ✅ Completo | ⚠️ Parcial | **Ahora** |

**Resultado: 5-2 a favor de "Implementar Ahora"**

### 6.2 Costo de Refactor Futuro

**Si NO se implementa ahora:**

**Fase 1: Agregar tabla + migración (2h)**
- CREATE notifications table
- Migrar emails enviados (imposible, no hay log)

**Fase 2: Agregar módulo (20h)**
- NotificationService
- Event listeners
- Email templates
- SMTP config

**Fase 3: Refactor código existente (15h)**
- Cambiar `Mail::to()` directo por eventos
- Agregar listeners en todos los módulos
- Testing de integración

**Fase 4: Frontend (15h)**
- Agregar notification UI
- Integration con API
- Testing

**Total Refactor: 52 horas**

**vs Implementar Ahora: 35 horas**

**Diferencia: 17 horas desperdiciadas + deuda técnica**

---

## 7. RECOMENDACIÓN FINAL

### 7.1 Decisión Arquitectónica

**✅ OPCIÓN A: IMPLEMENTAR EN PHASE 3-4 (Modificar Roadmap)**

**Justificación:**

1. **UX Critical:**
   - Notificaciones son CORE para service request workflow
   - Customer DEBE saber cuando mecánico acepta/inicia/completa
   - Sin notificaciones = UX pobre vs competencia

2. **Technical Debt:**
   - Implementar después cuesta 52h vs 35h ahora
   - Refactor futuro es complejo y riesgoso
   - Workaround temporal crea deuda técnica

3. **Event-Driven Benefits:**
   - Architecture limpia desde el inicio
   - Fácil agregar nuevos eventos
   - Testing completo

4. **Competitive Edge:**
   - Uber/Rappi/DiDi tienen notificaciones
   - Users esperan notificaciones en tiempo real
   - MVP sin notificaciones se ve incompleto

5. **ROI:**
   - +35 horas inversión
   - -17 horas ahorradas en refactor
   - **+18 horas netas** pero con UX superior

### 7.2 Roadmap Actualizado

**Nuevo Phase 3.5: Notifications Module (Week 4-5)**

Insertar entre Documents y Mechanics:

```
Phase 1: Module Restructure (Week 1) - 23h
Phase 2: Database (Week 2) - 6h
Phase 3: Documents (Week 3-4) - 52h
Phase 3.5: Notifications (Week 4-5) - 35h  🆕 NUEVO
Phase 4: Mechanics (Week 6-7) - 45h
Phase 5: Admin (Week 8) - 30h
```

**Nuevo Total: 195 horas (7.5 semanas)**

### 7.3 Implementación Incremental

**Week 4-5 (35 horas):**

**Backend (20h):**
- Day 1 (4h): Create `notifications` table + model
- Day 2 (6h): NotificationService + EmailService
- Day 3 (5h): Event system + listeners para service requests
- Day 4 (3h): Email templates
- Day 5 (2h): API endpoints

**Frontend (15h):**
- Day 6 (5h): Notification bell + dropdown
- Day 7 (5h): Notification list page
- Day 8 (3h): Mark as read functionality
- Day 9 (2h): Testing + polish

**Eventos MVP (Priority 1):**
1. ✅ service_request_accepted
2. ✅ service_request_started
3. ✅ service_request_completed
4. ✅ document_approved
5. ✅ document_rejected
6. ✅ mechanic_approved

**Eventos Phase 7 (Priority 2):**
7. ⚠️ SOAT/License expiring
8. ⚠️ Request cancelled
9. ⚠️ Broadcast messages

---

## 8. ESTRUCTURA MODULAR DEFINITIVA

### 8.1 Orden de Implementación Final

```
Core (base)
  ↓
Shared (utilities)
  ↓
Auth (authentication)
  ↓
Users + Vehicles + ServiceRequests (domains)
  ↓
Documents (file management)
  ↓
Notifications (event-driven)  🆕 NUEVO
  ↓
Mechanics (profiles + approval)
  ↓
Admin (management)
```

### 8.2 Dependencias

| Módulo | Depende de | Razón |
|--------|-----------|-------|
| Notifications | Auth, Users | Enviar a usuarios autenticados |
| Mechanics | Documents, **Notifications** | Notificar aprobación |
| ServiceRequests | **Notifications** | Notificar cambios de estado |
| Documents | **Notifications** | Notificar verificación |

**Conclusión:** Notifications debe ir ANTES de Mechanics para que approval workflow pueda enviar notificaciones.

---

## 9. IMPACTO EN IMPLEMENTATION_ROADMAP_V1.md

### 9.1 Cambios Requeridos

**Agregar Phase 3.5:**
- Título: "Notifications Module"
- Timing: Week 4-5
- Esfuerzo: 35 horas (20h backend + 15h frontend)
- Objetivo: Sistema de notificaciones event-driven

**Actualizar Total:**
- De: 160.75 horas (6.5 semanas)
- A: **195.75 horas (7.5 semanas)**

**Actualizar Dependencies:**
- Mechanics ahora depende de Notifications
- ServiceRequests integra con Notifications

**Agregar Entregables Phase 3.5:**
- ✅ Tabla `notifications` creada
- ✅ Event system funcionando
- ✅ Email notifications enviándose
- ✅ Notification bell en UI
- ✅ 6 eventos críticos implementados

### 9.2 Módulos Finales (9 módulos)

1. Core
2. Shared
3. Auth
4. Users
5. Vehicles
6. ServiceRequests
7. Documents
8. **Notifications** 🆕 AGREGADO
9. Mechanics
10. Admin

---

## 10. RESUMEN EJECUTIVO

### 10.1 Decisión Final

**✅ OPCIÓN A APROBADA: Implementar Notifications en Phase 3.5**

**Razones:**
1. ✅ UX crítica para service request workflow
2. ✅ Evita deuda técnica (17h ahorradas)
3. ✅ Competitive edge vs competencia
4. ✅ Event-driven architecture desde el inicio
5. ✅ ROI positivo (+18h netas, UX superior)

### 10.2 Tabla `notifications` Requerida

**✅ SÍ, tabla dedicada es necesaria:**
- Histórico persistente
- Estado de lectura
- Multi-channel delivery
- Auditoría completa
- Retry logic

### 10.3 Roadmap Actualizado

**Nuevo Total: 195.75 horas (7.5 semanas)**

| Phase | Timing | Esfuerzo |
|-------|--------|----------|
| 0: Pre-implementation | Day 1 | 2h |
| 1: Module Restructure | Week 1 | 23h |
| 2: Database | Week 2 | 6h |
| 3: Documents | Week 3-4 | 52h |
| **3.5: Notifications** | **Week 4-5** | **35h** 🆕 |
| 4: Mechanics | Week 6-7 | 45h |
| 5: Admin | Week 8 | 30h |
| 6: Quick Wins | Parallel | 4.75h |

### 10.4 Eventos MVP (6 eventos críticos)

1. ✅ service_request_accepted (HIGH priority)
2. ✅ service_request_started (HIGH priority)
3. ✅ service_request_completed (HIGH priority)
4. ✅ document_approved (MEDIUM priority)
5. ✅ document_rejected (MEDIUM priority)
6. ✅ mechanic_approved (MEDIUM priority)

**Phase 7:** Expiration alerts, broadcast, etc.

### 10.5 Canales MVP

- ✅ **In-App:** Obligatorio
- ✅ **Email (SMTP):** Obligatorio
- ⚠️ **SMS (Twilio):** Opcional (solo eventos HIGH)
- ❌ **Push/WhatsApp:** Phase 7+

---

**Estado:** ✅ ANÁLISIS COMPLETO  
**Recomendación:** **OPCIÓN A (Implementar en Phase 3.5)** 
**Impacto Roadmap:** +35 horas, +1 semana  
**Próxima acción:** Actualizar IMPLEMENTATION_ROADMAP_V1.md con Phase 3.5

