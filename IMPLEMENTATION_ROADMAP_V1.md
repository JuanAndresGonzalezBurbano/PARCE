# IMPLEMENTATION ROADMAP V2.0 - P.A.R.C.E
## Plan Definitivo de Implementación Post-Validación (Con Notifications)

**Fecha:** 2024-01-XX  
**Versión:** 2.0.0 FINAL  
**Estado:** APROBADO - LISTO PARA EJECUTAR  
**Propósito:** Guía completa de implementación validada incluyendo módulo Notifications

---

## Resumen Ejecutivo

Este roadmap integra todas las validaciones de dominio realizadas:
- ✅ Modelo de datos validado (`DOMAIN_MODEL_FINAL.md`)
- ✅ Dominio Mechanic validado (`MECHANIC_DOMAIN_ANALYSIS.md`) → `mechanic_profiles` APROBADO
- ✅ Dominio Admin validado (`ADMIN_DOMAIN_ANALYSIS.md`) → SOLO RBAC APROBADO
- ✅ Dominio Notifications validado (`NOTIFICATION_DOMAIN_ANALYSIS.md`) → Tabla `notifications` APROBADA
- ✅ Arquitectura modular definida (`MODULE_RESTRUCTURE_FINAL.md`)

**Decisiones Arquitectónicas Finales:**
1. ✅ NO agregar columnas a `users` o `vehicles`
2. ✅ Arquitectura documental desacoplada con 3 tablas
3. ✅ Tabla `mechanic_profiles` para mecánicos (23 campos específicos)
4. ✅ RBAC solo para administradores (sin `admin_profiles`)
5. ✅ Tabla `notifications` para sistema event-driven (UX crítica)
6. ✅ Estructura modular por dominios (10 módulos finales)

---

## 1. MÓDULOS DEFINITIVOS

### 1.1 Lista Completa de Módulos

**Backend:** `app/Modules/`

| Módulo | Propósito | Entidades | Prioridad |
|--------|-----------|-----------|-----------|
| **Core** | Framework básico (Router, Database, etc.) | - | ✅ Existente |
| **Shared** | Utilidades compartidas | Http utils, Middleware | 🔴 Phase 1 |
| **Auth** | Autenticación y sesiones | users, sessions | 🔴 Phase 1 |
| **Users** | Gestión de usuarios | users, user_roles | 🔴 Phase 1 |
| **Vehicles** | Gestión de vehículos | vehicles | 🔴 Phase 1 |
| **ServiceRequests** | Solicitudes de servicio | service_requests | 🔴 Phase 1 |
| **Documents** | Gestión documental | documents, document_types, verifications | 🔴 Phase 2 |
| **Notifications** | Sistema de notificaciones event-driven | notifications | 🔴 Phase 3.5 |
| **Mechanics** | Perfiles de mecánicos | mechanic_profiles | 🔴 Phase 4 |
| **Admin** | Funciones administrativas | - (usa RBAC) | 🟡 Phase 5 |

**Frontend:** `frontend/src/modules/`

| Módulo | Propósito | Prioridad |
|--------|-----------|-----------|
| **shared** | Componentes compartidos | 🔴 Phase 1 |
| **auth** | Login, registro, sesiones | 🔴 Phase 1 |
| **vehicles** | CRUD vehículos | 🔴 Phase 1 |
| **service-requests** | Solicitudes de servicio | 🔴 Phase 1 |
| **mechanics** | Dashboard mecánico | 🔴 Phase 1 |
| **dashboard** | Dashboard customer | 🔴 Phase 1 |
| **documents** | Upload y gestión docs | 🔴 Phase 2 |
| **notifications** | Notificaciones in-app y email | 🔴 Phase 3.5 |
| **admin** | Panel administrativo | 🟡 Phase 5 |

### 1.2 Estructura Modular Detallada

**Backend Modules Structure:**
```
app/Modules/
├── Auth/
│   ├── Controllers/AuthController.php
│   ├── Services/{AuthService, SessionManager, PasswordHasher, RoleValidator}
│   ├── DTO/{AuthResult, SessionData, CookieConfig}
│   ├── Exceptions/AuthenticationException.php
│   ├── Middleware/{AuthMiddleware, RBACMiddleware}
│   └── routes.php
│
├── Users/
│   ├── Controllers/{UserController, ProfileController}
│   ├── Services/{UserService, ProfileService}
│   ├── Models/User.php
│   └── routes.php
│
├── Vehicles/
│   ├── Controllers/VehicleController.php
│   ├── Services/{VehicleService, VehicleVerificationService}
│   ├── Validators/VehicleValidator.php
│   ├── Models/Vehicle.php
│   └── routes.php
│
├── ServiceRequests/
│   ├── Controllers/{ServiceRequestController, MechanicRequestController}
│   ├── Services/ServiceRequestService.php
│   ├── Validators/ServiceRequestValidator.php
│   ├── Models/ServiceRequest.php
│   └── routes.php
│
├── Documents/
│   ├── Controllers/{DocumentController, VerificationController}
│   ├── Services/{DocumentService, StorageService, VerificationService}
│   ├── Validators/DocumentValidator.php
│   ├── Models/{Document, DocumentType, DocumentVerification}
│   ├── Middleware/DocumentOwnershipMiddleware.php
│   └── routes.php
│
├── Notifications/
│   ├── Controllers/NotificationController.php
│   ├── Services/{NotificationService, EmailNotificationService, SmsNotificationService}
│   ├── Events/{ServiceRequestAccepted, DocumentApproved, MechanicApproved}
│   ├── Listeners/{SendServiceRequestNotification, SendDocumentNotification}
│   ├── Templates/email/{service_request_accepted, document_approved}.blade.php
│   ├── Models/Notification.php
│   └── routes.php
│
├── Mechanics/
│   ├── Controllers/{ProfileController, ApprovalController, AvailabilityController}
│   ├── Services/{ProfileService, ApprovalService, VerificationService, LocationService}
│   ├── Models/MechanicProfile.php
│   ├── Validators/MechanicProfileValidator.php
│   └── routes.php
│
└── Admin/
    ├── Controllers/{DashboardController, MechanicApprovalController, DocumentReviewController, UserManagementController}
    ├── Services/{DashboardService, ReportService, AuditService}
    ├── Middleware/AdminAccessMiddleware.php
    └── routes.php
```

---

## 2. DEPENDENCIAS ENTRE MÓDULOS

### 2.1 Grafo de Dependencias

```
Core (base framework)
  ↓
Shared (utilities)
  ↓
├─→ Auth ────────┐
│                │
├─→ Users ───────┤
│                │
├─→ Vehicles ────┤
│                │
├─→ ServiceRequests ──┐
│                     │
└─→ Documents ────────┤
         ↓            │
   Notifications ─────┤
         ↓            │
    Mechanics ────────┤
         ↓            │
       Admin ─────────┘
```

### 2.2 Tabla de Dependencias

| Módulo | Depende de | Razón |
|--------|-----------|-------|
| Auth | Shared | ErrorHandler, ResponseFormatter |
| Users | Auth, Shared | Autenticación required |
| Vehicles | Auth, Shared | Solo usuarios autenticados |
| ServiceRequests | Auth, Vehicles, Shared | Necesita vehículos |
| Documents | Auth, Shared | Upload requiere auth |
| Notifications | Auth, Users | Enviar a usuarios autenticados |
| Mechanics | Auth, Users, Documents, Notifications | Verificación documental + notificaciones |
| Admin | Auth, Mechanics, Documents, Users | Gestión de todos |

### 2.3 Reglas de Migración

**CRÍTICO - Orden de migración obligatorio:**

1. ✅ **Core** (sin cambios)
2. ✅ **Shared** primero (todos dependen de él)
3. ✅ **Auth** segundo (autorización base)
4. ✅ **Users**, **Vehicles**, **ServiceRequests** en paralelo posible
5. ✅ **Documents** requiere Auth funcionando
6. ✅ **Notifications** requiere Documents funcionando
7. ✅ **Mechanics** requiere Notifications funcionando
8. ✅ **Admin** al final (depende de todo)

---

## 3. ROADMAP POR FASES

### 3.1 PHASE 0: Pre-Implementation (1 día)

**Objetivo:** Preparación y validación final

**Tareas:**
- [x] Validar modelo de datos (DOMAIN_MODEL_FINAL.md)
- [x] Validar dominio Mechanic (MECHANIC_DOMAIN_ANALYSIS.md)
- [x] Validar dominio Admin (ADMIN_DOMAIN_ANALYSIS.md)
- [ ] Crear Git tag `v1.0.0-pre-refactor`
- [ ] Crear branch `refactor/modular-architecture`
- [ ] Backup database completo
- [ ] Documentar 25 rutas actuales

**Entregables:**
- ✅ Tag Git creado
- ✅ Branch refactor creado
- ✅ Backup DB
- ✅ Documentación de rutas

**Tiempo:** 1 día (2 horas)

---

### 3.2 PHASE 1: Module Restructure (Week 1)

**Objetivo:** Reorganizar código existente en estructura modular


**Backend Migration (11 horas):**

**Day 1 (3h): Preparation + Shared**
- [ ] Crear estructura `app/Modules/` y `app/Shared/`
- [ ] Actualizar `composer.json` autoload
- [ ] Mover `Infrastructure/Http/*` → `Shared/Http/`
- [ ] Mover `Middleware/CORS*` y `RequestLogger*` → `Shared/Middleware/`
- [ ] Actualizar namespaces
- [ ] `composer dump-autoload`
- [ ] ✅ Test: Health endpoint

**Day 2 (5h): Auth + Vehicles**
- [ ] Mover Auth a `Modules/Auth/`
- [ ] Actualizar imports Auth
- [ ] ✅ Test: Login, logout, protected routes
- [ ] Mover Vehicles a `Modules/Vehicles/`
- [ ] Actualizar imports Vehicles
- [ ] ✅ Test: Vehicle CRUD

**Day 3 (3h): ServiceRequests + Cleanup**
- [ ] Mover ServiceRequests a `Modules/ServiceRequests/`
- [ ] Actualizar imports ServiceRequests
- [ ] ✅ Test: Service request workflows
- [ ] Eliminar `HomeController.php` (unused)
- [ ] Limpiar directorios vacíos
- [ ] `composer dump-autoload --optimize`
- [ ] ✅ Test: Full regression

**Frontend Migration (12 horas):**

**Day 4 (4h): Auth + Vehicles modules**
- [ ] Crear `src/modules/` y `src/shared/`
- [ ] Migrar módulo auth
- [ ] Migrar módulo vehicles
- [ ] Actualizar `vite.config.ts` paths
- [ ] Actualizar `tsconfig.json` paths

**Day 5 (5h): ServiceRequests + Mechanics + Dashboard**
- [ ] Migrar service-requests
- [ ] Migrar mechanics
- [ ] Migrar dashboard
- [ ] Actualizar imports

**Day 6 (3h): Shared + Testing**
- [ ] Migrar shared components
- [ ] Actualizar todos los imports restantes
- [ ] `npx tsc --noEmit` (0 errors)
- [ ] `npm run build`
- [ ] ✅ Test: Todas las páginas

**Entregables Phase 1:**
- ✅ Backend: Estructura modular completa
- ✅ Frontend: Estructura modular completa
- ✅ Todas las 25 rutas funcionando
- ✅ TypeScript: 0 errores
- ✅ Build: exitoso
- ✅ Zero funcionalidad cambiada

**Tiempo:** Week 1 (23 horas)  
**Riesgo:** 🟡 MEDIO (breaking imports)  
**Mitigation:** Test after each module, commit frequently

---

### 3.3 PHASE 2: Database Enhancements (Week 2)

**Objetivo:** Crear tablas para documents y mechanic_profiles

**Migrations (6 horas):**

**Day 1 (2h): Documents tables**
- [ ] Migration: CREATE `documents` table
- [ ] Migration: CREATE `document_verifications` table
- [ ] Migration: CREATE `document_types` table
- [ ] Seeder: Insert document_types data (9 types)
- [ ] ✅ Test: Migrations run successfully

**Day 2 (2h): Mechanic profiles table**
- [ ] Migration: CREATE `mechanic_profiles` table
- [ ] Seeder: Create sample mechanic profiles
- [ ] ✅ Test: FK constraints work

**Day 3 (2h): Data migration + Validation**
- [ ] Migration: Migrate existing `profile_picture_url` → documents
- [ ] Migration: Migrate existing `primary_photo_url` → documents
- [ ] ✅ Test: Data integrity check
- [ ] ✅ Test: Rollback and re-run migrations

**Entregables Phase 2:**
- ✅ 4 new tables created
- ✅ 9 document types seeded
- ✅ Existing data migrated
- ✅ All FKs and constraints working
- ✅ Rollback tested

**Tiempo:** Week 2 (6 horas)  
**Riesgo:** 🟢 BAJO (no afecta código existente)  
**Mitigation:** Rollback plan ready, staging test first

---

### 3.4 PHASE 3: Documents Module (Week 3-4)

**Objetivo:** Implementar sistema de gestión documental completo

**Backend (25 horas):**

**Week 3 Day 1-2 (8h): Core Services**
- [ ] DocumentService (upload, get, list, delete)
- [ ] DocumentStorageService (file handling)
- [ ] DocumentValidator
- [ ] ✅ Test: Unit tests for services

**Week 3 Day 3-4 (8h): Verification + Controllers**
- [ ] DocumentVerificationService
- [ ] DocumentController
- [ ] VerificationController (admin)
- [ ] ✅ Test: API endpoints

**Week 3 Day 5 (4h): Middleware + Routes**
- [ ] DocumentOwnershipMiddleware
- [ ] Module routes
- [ ] Integration with Auth
- [ ] ✅ Test: Authorization works

**Week 4 Day 1 (5h): Testing + Polish**
- [ ] Integration tests
- [ ] Error handling
- [ ] Documentation
- [ ] ✅ Test: Full document workflow

**Frontend (27 horas):**

**Week 4 Day 2-3 (9h): Core Components**
- [ ] Types (document.ts)
- [ ] documentService.ts
- [ ] DocumentContext
- [ ] DocumentUploader component
- [ ] DocumentList component
- [ ] DocumentCard component

**Week 4 Day 4 (4h): Preview + Verification**
- [ ] DocumentPreview component
- [ ] DocumentVerificationBadge
- [ ] ✅ Test: Components render

**Week 4 Day 5 (4h): Integration**
- [ ] Profile integration (user docs)
- [ ] Vehicle integration (vehicle docs)
- [ ] ✅ Test: Upload flows

**Week 5 Day 1 (6h): Admin + Testing**
- [ ] Admin verification page
- [ ] Admin verification queue
- [ ] ✅ Test: Admin approval workflow

**Week 5 Day 2 (4h): Polish + Documentation**
- [ ] Error handling
- [ ] Loading states
- [ ] Documentation
- [ ] ✅ Test: E2E document flow

**Entregables Phase 3:**
- ✅ Users can upload: profile pic, national ID
- ✅ Vehicles can upload: photos, property card, SOAT, technomechanical
- ✅ Admin can verify/reject documents
- ✅ Expiration tracking works
- ✅ Document status badges display
- ✅ All tests passing

**Tiempo:** Week 3-5 (52 horas)  
**Riesgo:** 🟡 MEDIO (file upload security)  
**Mitigation:** Strict validation, virus scanning, whitelist MIME types

---

### 3.5 PHASE 3.5: Notifications Module (Week 4-5)

**Objetivo:** Implementar sistema de notificaciones event-driven completo

**Backend (20 horas):**

**Week 4 Day 5 (4h): Database + Model**
- [ ] Migration: CREATE `notifications` table
  - user_id, type, title, message
  - notifiable_type, notifiable_id (polymorphic)
  - data (JSON), action_url
  - is_read, read_at
  - channels (JSON), delivery status per channel
  - priority, expires_at
  - Indexes: user_id, type, is_read, created_at
- [ ] Notification model
- [ ] NotificationType enum (18 tipos)
- [ ] ✅ Test: Migration runs successfully

**Week 5 Day 1 (6h): Core Services**
- [ ] NotificationService (create, send, list, markAsRead)
- [ ] EmailNotificationService (SMTP integration)
- [ ] InAppNotificationService (database storage)
- [ ] SmsNotificationService (Twilio - optional)
- [ ] ✅ Test: Unit tests for services

**Week 5 Day 2 (5h): Event System**
- [ ] Events: ServiceRequestAccepted, ServiceRequestStarted, ServiceRequestCompleted
- [ ] Events: DocumentApproved, DocumentRejected
- [ ] Events: MechanicApproved, MechanicRejected
- [ ] Listeners: SendServiceRequestNotification
- [ ] Listeners: SendDocumentNotification
- [ ] ✅ Test: Events trigger correctly

**Week 5 Day 3 (3h): Email Templates + Config**
- [ ] Blade templates: service_request_accepted.blade.php
- [ ] Blade templates: document_approved.blade.php
- [ ] Blade templates: mechanic_approved.blade.php
- [ ] SMTP configuration (.env setup)
- [ ] ✅ Test: Email templates render

**Week 5 Day 4 (2h): Controllers + Routes**
- [ ] NotificationController (list, markAsRead, markAllAsRead, delete)
- [ ] Module routes
- [ ] Integration with Auth middleware
- [ ] ✅ Test: API endpoints

**Frontend (15 horas):**

**Week 5 Day 4 (5h): Core Components**
- [ ] Types: notification.ts interface
- [ ] notificationService.ts (API calls)
- [ ] NotificationContext (state management)
- [ ] useNotifications hook
- [ ] ✅ Test: Service communicates with API

**Week 5 Day 5 (5h): Notification Bell + Dropdown**
- [ ] NotificationBell component (icon + badge)
- [ ] NotificationDropdown component
- [ ] NotificationItem component
- [ ] Auto-refresh every 30s
- [ ] ✅ Test: Bell displays unread count

**Week 6 Day 1 (3h): Notification List Page**
- [ ] NotificationListPage
- [ ] Filter by type
- [ ] Mark as read on click
- [ ] Delete notification
- [ ] ✅ Test: List page works

**Week 6 Day 2 (2h): Integration + Polish**
- [ ] Integrate bell in Header
- [ ] Add to all layouts
- [ ] Sound/vibration on new notification (optional)
- [ ] Error handling
- [ ] ✅ Test: E2E notification flow

**Entregables Phase 3.5:**
- ✅ Tabla `notifications` created with all fields
- ✅ 6 eventos MVP implemented:
  1. service_request_accepted
  2. service_request_started
  3. service_request_completed
  4. document_approved
  5. document_rejected
  6. mechanic_approved
- ✅ Email notifications sending via SMTP
- ✅ In-app notifications with bell icon
- ✅ Notification list page with read/unread
- ✅ Event-driven architecture working
- ✅ All tests passing

**Tiempo:** Week 4-5 (35 horas)  
**Riesgo:** 🟡 MEDIO (SMTP config, event architecture)  
**Mitigation:** Test emails locally first, fallback to in-app only if SMTP fails

**Eventos Phase 7 (Future):**
- ⚠️ SOAT/License expiration alerts
- ⚠️ Request cancelled notifications
- ⚠️ Mechanic arrived at location
- ⚠️ Broadcast messages

---

### 3.6 PHASE 4: Mechanics Module (Week 6-7)

**Objetivo:** Implementar perfiles y workflow de aprobación de mecánicos

**Backend (25 horas):**

**Week 6 Day 1-2 (8h): Core Services**
- [ ] MechanicProfile model
- [ ] MechanicProfileService
- [ ] MechanicVerificationService
- [ ] ✅ Test: Profile CRUD

**Week 6 Day 3-4 (8h): Approval Workflow**
- [ ] MechanicApprovalService
- [ ] canOperateAsMechanic() logic
- [ ] Document verification integration
- [ ] ✅ Test: Approval workflow

**Week 6 Day 5 (5h): Controllers + Routes**
- [ ] MechanicProfileController
- [ ] MechanicApprovalController (admin)
- [ ] MechanicAvailabilityController
- [ ] Module routes
- [ ] ✅ Test: API endpoints

**Week 7 Day 1 (4h): Location + Matching**
- [ ] MechanicLocationService
- [ ] MechanicMatchingService (nearby search)
- [ ] ✅ Test: Location queries

**Frontend (20 horas):**

**Week 7 Day 2-3 (8h): Profile Components**
- [ ] Types (mechanic.ts)
- [ ] mechanicService.ts
- [ ] MechanicContext
- [ ] MechanicProfileForm
- [ ] MechanicCard

**Week 7 Day 4 (6h): Onboarding + Dashboard**
- [ ] MechanicOnboardingPage
- [ ] Update MechanicDashboard with profile stats
- [ ] MechanicAvailabilityToggle
- [ ] ✅ Test: Onboarding flow

**Week 7 Day 5 (6h): Admin + Integration**
- [ ] Admin: MechanicApprovalQueuePage
- [ ] Integration with ServiceRequests
- [ ] ✅ Test: Assignment checks mechanic verification

**Entregables Phase 4:**
- ✅ Mechanics can create profile
- ✅ Mechanics must upload: ID, license, certification
- ✅ Admin can approve/reject mechanics
- ✅ Mechanics cannot operate without approval
- ✅ Location-based mechanic search works
- ✅ All tests passing

**Tiempo:** Week 6-7 (45 horas)  
**Riesgo:** 🟡 MEDIO (integration with service requests)  
**Mitigation:** Integration tests, staged rollout

---

### 3.7 PHASE 5: Admin Module (Week 8)

**Objetivo:** Panel administrativo completo

**Backend (15 horas):**

**Week 8 Day 1-2 (8h): Dashboard + Reports**
- [ ] AdminDashboardService (metrics)
- [ ] AdminReportService
- [ ] AdminAuditService
- [ ] DashboardController
- [ ] ReportController
- [ ] ✅ Test: Metrics calculation

**Week 8 Day 3 (4h): Management Controllers**
- [ ] UserManagementController
- [ ] Integration with Mechanics/Documents approval
- [ ] ✅ Test: Admin actions

**Week 8 Day 4 (3h): Routes + Middleware**
- [ ] AdminAccessMiddleware
- [ ] Module routes
- [ ] ✅ Test: Authorization

**Frontend (15 horas):**

**Week 8 Day 4-5 (10h): Admin Dashboard**
- [ ] AdminDashboard page
- [ ] Metrics components
- [ ] Charts/graphs
- [ ] Approval queues
- [ ] ✅ Test: Dashboard loads

**Week 8 Day 5 (5h): Reports + Polish**
- [ ] Reports page
- [ ] User management page
- [ ] ✅ Test: Full admin workflow

**Entregables Phase 5:**
- ✅ Admin dashboard with metrics
- ✅ Mechanic approval queue
- ✅ Document verification queue
- ✅ User management
- ✅ Reports and analytics
- ✅ All tests passing

**Tiempo:** Week 8 (30 horas)  
**Riesgo:** 🟢 BAJO (builds on existing modules)  
**Mitigation:** Reuse existing components

---

### 3.8 PHASE 6: Quick Wins (Parallel to Phase 3-5)

**Objetivo:** Mejoras UX rápidas

**Geolocation (2 horas):**
- [ ] useGeolocation hook
- [ ] Update RequestsPage to use real GPS
- [ ] Fallback to Bogotá if denied
- [ ] ✅ Test: Location permission flow

**Loading States (2 hours):**
- [ ] Add loading states to all pages
- [ ] Skeleton screens
- [ ] ✅ Test: UX during slow network

**Code Cleanup (0.75 hours):**
- [ ] Remove HomeController
- [ ] Populate or remove utils folder
- [ ] ✅ Test: No broken imports

**Entregables Phase 6:**
- ✅ Real GPS in service requests
- ✅ Better UX during API calls
- ✅ Cleaner codebase

**Tiempo:** Parallel (4.75 hours)  
**Riesgo:** 🟢 BAJO  
**Mitigation:** Independent tasks

---

## 4. ESTIMACIÓN TOTAL DE ESFUERZO

### 4.1 Resumen por Fase

| Phase | Backend | Frontend | Total | Weeks |
|-------|---------|----------|-------|-------|
| **Phase 0:** Pre-implementation | - | - | 2h | 0.25 days |
| **Phase 1:** Module Restructure | 11h | 12h | 23h | 1 week |
| **Phase 2:** Database | 6h | - | 6h | 0.75 weeks |
| **Phase 3:** Documents | 25h | 27h | 52h | 2 weeks |
| **Phase 3.5:** Notifications | 20h | 15h | 35h | 1 week |
| **Phase 4:** Mechanics | 25h | 20h | 45h | 1.5 weeks |
| **Phase 5:** Admin | 15h | 15h | 30h | 1 week |
| **Phase 6:** Quick Wins | 2h | 2.75h | 4.75h | Parallel |
| **TOTAL** | **104h** | **91.75h** | **195.75h** | **~7.5 weeks** |

### 4.2 Esfuerzo por Desarrollador

**1 Full-time Developer:**
- Total: 195.75 hours
- @ 8h/day = 24.5 días = **5 semanas calendario**
- Con testing/bugs = **7.5 semanas calendario**

**2 Developers (Parallel):**
- Backend Dev: 104 hours = 13 días
- Frontend Dev: 91.75 hours = 11.5 días
- **Total: ~3.5 semanas calendario** (con overlap)

**Recomendado: 1 Full-Stack Dev por 7.5 semanas**

---

## 5. RIESGOS E MITIGACIÓN

### 5.1 Matriz de Riesgos

| Riesgo | Probabilidad | Impacto | Severidad | Mitigación |
|--------|--------------|---------|-----------|------------|
| **Breaking autoload** | ALTA | ALTA | 🔴 CRÍTICO | Git tracking, composer dump-autoload after each step |
| **Import path errors** | ALTA | MEDIA | 🟡 MEDIO | IDE refactor tools, systematic testing |
| **File upload security** | MEDIA | ALTA | 🔴 CRÍTICO | Whitelist MIME, virus scan, validation |
| **SMTP config failure** | MEDIA | MEDIA | 🟡 MEDIO | Test locally, fallback to in-app only |
| **Event system bugs** | MEDIA | ALTA | 🔴 CRÍTICO | Comprehensive tests, event logging |
| **Mechanic verification bug** | MEDIA | ALTA | 🔴 CRÍTICO | Comprehensive tests, staged rollout |
| **Performance degradation** | BAJA | MEDIA | 🟡 MEDIO | Benchmark after each phase |
| **Data loss** | BAJA | CRÍTICA | 🔴 CRÍTICO | Backups before migrations, rollback plan |
| **Team burnout** | MEDIA | MEDIA | 🟡 MEDIO | Realistic estimates, buffer time |

### 5.2 Estrategias de Mitigación

**Pre-Migration:**
1. ✅ Git tag current version
2. ✅ Full database backup
3. ✅ Document all routes
4. ✅ Staging environment ready

**Durante Migration:**
1. ✅ Test after EACH module
2. ✅ Commit after EACH success
3. ✅ Never skip testing
4. ✅ Keep migration log

**Post-Migration:**
1. ✅ Full regression testing
2. ✅ Performance benchmarking
3. ✅ Monitor for 48 hours
4. ✅ Rollback plan ready

---

## 6. ENTREGABLES POR FASE

### 6.1 Phase 1 Deliverables

**Code:**
- ✅ Modular backend structure
- ✅ Modular frontend structure
- ✅ Updated composer.json
- ✅ Updated vite.config.ts
- ✅ Updated tsconfig.json

**Documentation:**
- ✅ Updated README with new structure
- ✅ Migration log

**Testing:**
- ✅ All 25 endpoints working
- ✅ TypeScript: 0 errors
- ✅ Build: successful

### 6.2 Phase 2 Deliverables

**Database:**
- ✅ 4 new tables created
- ✅ 9 document types seeded
- ✅ Data migrated

**Documentation:**
- ✅ Migration files documented
- ✅ ERD updated

**Testing:**
- ✅ Migration rollback tested
- ✅ FK constraints validated

### 6.3 Phase 3 Deliverables

**Backend:**
- ✅ Documents API (7 endpoints)
- ✅ Verification API (3 endpoints)
- ✅ File upload working

**Frontend:**
- ✅ Document upload UI
- ✅ Document list/preview
- ✅ Admin verification page

**Testing:**
- ✅ Unit tests passing
- ✅ Integration tests passing
- ✅ E2E document flow tested

### 6.4 Phase 3.5 Deliverables

**Database:**
- ✅ Notifications table created
- ✅ Indexes optimized for queries

**Backend:**
- ✅ Notifications API (5 endpoints)
- ✅ Event system working
- ✅ 6 eventos MVP implemented
- ✅ Email templates rendering
- ✅ SMTP integration working

**Frontend:**
- ✅ Notification bell with badge
- ✅ Notification dropdown
- ✅ Notification list page
- ✅ Mark as read functionality

**Testing:**
- ✅ Event triggers verified
- ✅ Email delivery tested
- ✅ E2E notification flow tested

### 6.5 Phase 4 Deliverables

**Backend:**
- ✅ Mechanic profiles API (10 endpoints)
- ✅ Approval workflow working
- ✅ Location-based search

**Frontend:**
- ✅ Mechanic onboarding flow
- ✅ Profile management
- ✅ Admin approval queue

**Testing:**
- ✅ Verification logic tested
- ✅ Integration with service requests tested

### 6.6 Phase 5 Deliverables

**Backend:**
- ✅ Admin dashboard API
- ✅ Reports API
- ✅ Audit logs

**Frontend:**
- ✅ Admin dashboard
- ✅ Metrics and charts
- ✅ Management pages

**Testing:**
- ✅ Admin workflows tested
- ✅ RBAC verified

---

## 7. TESTING STRATEGY

### 7.1 Testing Pyramid

```
        /\
       /E2E\         ← 10% (Critical flows)
      /------\
     /Integration\   ← 30% (Module interactions)
    /------------\
   /  Unit Tests  \  ← 60% (Business logic)
  /________________\
```

### 7.2 Testing Checklist por Phase

**Phase 1 (Module Restructure):**
- [ ] All routes return correct responses
- [ ] Login/Logout works
- [ ] RBAC works
- [ ] Vehicle CRUD works
- [ ] Service request CRUD works
- [ ] TypeScript compiles
- [ ] Build succeeds

**Phase 2 (Database):**
- [ ] Migrations run successfully
- [ ] Rollback works
- [ ] Foreign keys enforce integrity
- [ ] Data migration preserves data
- [ ] Indexes improve query performance

**Phase 3 (Documents):**
- [ ] Upload validates file type
- [ ] Upload validates file size
- [ ] Documents are stored correctly
- [ ] Verification workflow works
- [ ] Admin can approve/reject
- [ ] Expiration alerts work

**Phase 3.5 (Notifications):**
- [ ] Notifications table stores data correctly
- [ ] Events trigger notifications
- [ ] Email notifications send successfully
- [ ] In-app notifications display in UI
- [ ] Bell badge shows correct unread count
- [ ] Mark as read updates state
- [ ] Notification list loads correctly
- [ ] Multi-channel delivery works

**Phase 4 (Mechanics):**
- [ ] Profile creation works
- [ ] Document verification blocks operation
- [ ] Approval workflow works
- [ ] Location-based search works
- [ ] Service request assignment checks verification

**Phase 5 (Admin):**
- [ ] Dashboard shows correct metrics
- [ ] Admin can approve mechanics
- [ ] Admin can verify documents
- [ ] Reports generate correctly
- [ ] RBAC prevents unauthorized access

---

## 8. ROLLBACK PLAN

### 8.1 Rollback Triggers

Execute rollback if:
- ❌ >3 critical bugs in production
- ❌ Data loss detected
- ❌ Performance degradation >20%
- ❌ Security vulnerability found
- ❌ Deployment fails repeatedly

### 8.2 Rollback Procedure

**Step 1: Immediate Response (5 minutes)**
```bash
# Switch to pre-refactor version
git checkout v1.0.0-pre-refactor

# Restore composer autoload
composer dump-autoload

# Rebuild frontend
cd frontend && npm run build
```

**Step 2: Database Rollback (10 minutes)**
```bash
# If migrations were run, rollback
php migrate.php rollback

# If data corruption, restore backup
mysql -u root parce_db < backup_pre_refactor_YYYYMMDD.sql
```

**Step 3: Verification (10 minutes)**
- [ ] Test all 25 original endpoints
- [ ] Verify frontend loads
- [ ] Check database integrity
- [ ] Monitor error logs

**Step 4: Incident Report (30 minutes)**
- Document what failed
- Root cause analysis
- Plan corrective actions
- Schedule retry

**Total Rollback Time:** ~30-60 minutes

---

## 9. SUCCESS CRITERIA

### 9.1 Technical Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| All routes working | 25/25 (100%) | Manual + automated tests |
| TypeScript errors | 0 | `npx tsc --noEmit` |
| Build success | ✅ | `npm run build` |
| Performance | No degradation | Benchmark comparison |
| Code organization | Modular | Code review |
| Test coverage | >70% | Coverage report |

### 9.2 Business Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Zero downtime | ✅ | Uptime monitoring |
| User impact | None | Support tickets |
| Feature velocity | +30% | Sprint metrics |
| Developer satisfaction | ≥8/10 | Team survey |

### 9.3 Quality Gates

**Gate 1 (End of Phase 1):**
- ✅ All modules migrated
- ✅ All tests passing
- ✅ TypeScript: 0 errors
- ⏭️ Proceed to Phase 2

**Gate 2 (End of Phase 2):**
- ✅ All migrations successful
- ✅ Data integrity verified
- ✅ Rollback tested
- ⏭️ Proceed to Phase 3

**Gate 3 (End of Phase 3):**
- ✅ Documents upload works
- ✅ Admin verification works
- ✅ All tests passing
- ⏭️ Proceed to Phase 3.5

**Gate 3.5 (End of Phase 3.5):**
- ✅ Notifications send correctly
- ✅ Event system working
- ✅ Email delivery verified
- ✅ In-app UI functional
- ⏭️ Proceed to Phase 4

**Gate 4 (End of Phase 4):**
- ✅ Mechanic profiles work
- ✅ Approval workflow works
- ✅ Integration tests passing
- ⏭️ Proceed to Phase 5

**Gate 5 (End of Phase 5):**
- ✅ Admin dashboard works
- ✅ All modules integrated
- ✅ Full regression passing
- ⏭️ Deploy to production

---

## 10. CONCLUSIÓN Y PRÓXIMOS PASOS

### 10.1 Resumen de Validaciones

**Completadas:**
- ✅ Domain Model validation (`DOMAIN_MODEL_FINAL.md`)
- ✅ Mechanic Domain validation (`MECHANIC_DOMAIN_ANALYSIS.md`)
- ✅ Admin Domain validation (`ADMIN_DOMAIN_ANALYSIS.md`)
- ✅ Module Restructure plan (`MODULE_RESTRUCTURE_FINAL.md`)
- ✅ Implementation Roadmap (`IMPLEMENTATION_ROADMAP_V1.md`)

### 10.2 Decisiones Arquitectónicas Aprobadas

1. ✅ **NO agregar columnas** a `users` o `vehicles`
2. ✅ **Arquitectura documental desacoplada** (3 tablas)
3. ✅ **Tabla `mechanic_profiles`** para mecánicos (justificado: 23 campos específicos)
4. ✅ **RBAC solo** para administradores (justificado: solo 3-5 campos, YAGNI)
5. ✅ **Tabla `notifications`** para notificaciones (justificado: UX crítica, event-driven)
6. ✅ **Estructura modular** por dominios (10 módulos finales)

### 10.3 Ready to Execute

**Pre-Flight Checklist:**
- [x] Domain model validated
- [x] Architecture validated
- [x] Dependencies identified
- [x] Risks mitigated
- [x] Timeline realistic
- [ ] Team capacity confirmed
- [ ] Stakeholder approval
- [ ] Git branch created
- [ ] Database backup

**Listo para comenzar Phase 0 cuando:**
- ✅ Se apruebe este roadmap
- ✅ Se confirme disponibilidad del equipo
- ✅ Se complete pre-flight checklist

**Nota sobre Notifications:**
- ✅ Módulo Notifications agregado en Phase 3.5
- ✅ Decisión basada en análisis exhaustivo (`NOTIFICATION_DOMAIN_ANALYSIS.md`)
- ✅ Justificación: UX crítica, evita deuda técnica, competitive edge
- ✅ +35 horas inversión (195.75h total vs 160.75h original)
- ✅ +1 semana calendario (7.5 semanas vs 6.5 semanas)

### 10.4 Contacto y Soporte

**Technical Lead:** [Your Name]  
**Project Manager:** [PM Name]  
**Implementation Start:** Pending approval  
**Expected Completion:** 7.5 weeks from start  

---

**Estado:** ✅ ROADMAP COMPLETO Y VALIDADO (V2 - Con Notifications)  
**Versión:** 2.0.0 FINAL  
**Última Actualización:** 2024-01-XX  
**Aprobación:** PENDING

**Documentos Relacionados:**
1. `DOMAIN_MODEL_FINAL.md` - Modelo de datos completo
2. `MECHANIC_DOMAIN_ANALYSIS.md` - Análisis dominio Mechanic
3. `ADMIN_DOMAIN_ANALYSIS.md` - Análisis dominio Admin
4. `NOTIFICATION_DOMAIN_ANALYSIS.md` - Análisis dominio Notifications (NUEVO)
5. `MODULE_RESTRUCTURE_FINAL.md` - Plan de reorganización modular
6. `PRE_IMPLEMENTATION_CHECKLIST.md` - Checklist de validación pre-refactor
7. `DATABASE_REFINEMENT.md` - Propuesta de sistema documental
8. `MVP_AUDIT_REPORT_V2.md` - Auditoría técnica completa

