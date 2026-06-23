# AI_CONTEXT_PARCE.md
# Complete Project Context for AI Agents

**Project Name:** P.A.R.C.E (Plataforma de Asistencia Rápida para Conductores en Emergencia)  
**Version:** MVP Phase  
**Last Updated:** 2026-01-11  
**PHP Version:** 8.2+  
**Database:** MySQL 8.0+  
**Environment:** XAMPP (Local Development)

---

## 1. ESTADO ACTUAL DEL PROYECTO

### 1.1 Resumen Ejecutivo

P.A.R.C.E es una plataforma de asistencia vehicular en emergencia que conecta conductores con mecánicos certificados en tiempo real. El proyecto está en **fase MVP**, con infraestructura base implementada y capas de seguridad en desarrollo activo.

**Estado de Implementación (Enero 2026):**
- ✅ **Database Layer:** Implementada (migrations, seeders, core schema)
- ✅ **MVC Core:** Implementado (Router, Controller, Model, Request, Response)
- ✅ **RBAC Base:** Implementado (users, roles, user_roles)
- 🔄 **Authentication Infrastructure:** En desarrollo (PasswordHasher, SessionManager, DTOs completados)
- ⏳ **Authentication API Layer:** Pendiente
- ⏳ **Document Management:** Pendiente (diseñado, no implementado)
- ⏳ **Mechanic Profiles:** Pendiente (diseñado, no implementado)
- ⏳ **Service Requests Module:** Pendiente

**Componentes Completados:**
1. Database migrations (users, roles, sessions, vehicles, service_requests)
2. Core MVC framework (Router, Controller, Model, Database abstraction)
3. PasswordHasher service (Argon2id hashing)
4. SessionManager service (database-backed sessions)
5. AuthService (authentication core)
6. DTOs (AuthResult, SessionData, CookieConfig, RateLimitConfig)
7. Middleware base (AuthMiddleware, RBACMiddleware, CORSMiddleware)

**Componentes En Desarrollo:**
1. Property-based tests for authentication infrastructure
2. Integration tests for auth workflow
3. API controllers for authentication endpoints

**Componentes Pendientes:**
1. Document management system (documents, document_verifications tables)
2. Mechanic profiles (mechanic_profiles table)
3. Service request business logic
4. Real-time location tracking
5. Notification system
6. Payment integration
7. Frontend application


### 1.2 Módulos por Estado

| Módulo | Estado | Completitud | Prioridad | Notas |
|--------|--------|-------------|-----------|-------|
| Database Infrastructure | ✅ Completo | 100% | Alta | Migrations, seeders funcionando |
| MVC Core (Router, Controller, Model) | ✅ Completo | 100% | Alta | PSR-4 autoloading, middleware pipeline |
| Authentication Infrastructure | 🔄 70% | 70% | Alta | Core services completos, tests pendientes |
| Authentication API | ⏳ Pendiente | 0% | Alta | Controllers y endpoints por implementar |
| RBAC Middleware | ✅ Completo | 95% | Alta | Implementado, tests pendientes |
| Document Management | ⏳ Diseñado | 0% | Media | Schema diseñado, no implementado |
| Mechanic Profiles | ⏳ Diseñado | 0% | Media | Schema diseñado, no implementado |
| Vehicles Module | ✅ Completo | 80% | Media | CRUD básico, validaciones pendientes |
| Service Requests Module | ⏳ Diseñado | 0% | Alta | Schema completo, lógica pendiente |
| Notification System | ⏳ Diseñado | 0% | Baja | Análisis completado, no implementado |
| Real-time Tracking | ⏳ Diseñado | 0% | Media | GPS tracking, WebSocket pendiente |
| Payment Integration | ⏳ No diseñado | 0% | Baja | Post-MVP |
| Frontend Application | ⏳ No iniciado | 0% | Alta | React/Vue pendiente de decisión |

### 1.3 Hitos Recientes

**2026-01-10:**
- ✅ Completado AuthService con timing-attack protection
- ✅ Completado SessionManager con absolute/idle timeouts
- ✅ Completado PasswordHasher con Argon2id
- ✅ Implementados todos los DTOs (AuthResult, SessionData, CookieConfig, RateLimitConfig)
- ✅ Implementada AuthenticationException

**2026-01-09:**
- ✅ Refinamiento de database schema (documents, mechanic_profiles)
- ✅ Documentación de arquitectura documental
- ✅ Análisis de dominio para mecánicos

**2026-01-08:**
- ✅ Creación de migrations para todas las tablas core
- ✅ Implementación de seeders (users, roles, vehicles, service_requests)

### 1.4 Próximos Pasos Inmediatos

**Semana Actual (2026-01-11 a 2026-01-17):**
1. ✅ Completar property-based tests para authentication infrastructure
2. ⏳ Implementar authentication API controllers (login, logout, register)
3. ⏳ Implementar CSRF protection middleware
4. ⏳ Implementar rate limiting service
5. ⏳ Testing end-to-end de authentication flow

**Próximas 2 Semanas:**
1. Implementar document management system (migrations + services)
2. Implementar mechanic profiles (migrations + services)
3. Implementar service request business logic
4. Pruebas de integración completas


---

## 2. ARQUITECTURA COMPLETA

### 2.1 Arquitectura General (Capas)

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                         │
│  (Frontend - React/Vue - NOT IMPLEMENTED)              │
└─────────────────────────────────────────────────────────┘
                           ↓ HTTP/JSON
┌─────────────────────────────────────────────────────────┐
│                   API LAYER (REST)                      │
│  • AuthController (login, logout, register)            │
│  • VehicleController (CRUD)                            │
│  • ServiceRequestController (create, assign, complete) │
│  • DocumentController (upload, verify)  [PENDING]     │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│              MIDDLEWARE PIPELINE                        │
│  1. CORSMiddleware (headers, preflight)                │
│  2. CSRFMiddleware [PENDING]                           │
│  3. AuthMiddleware (session validation)                │
│  4. RBACMiddleware (role-based access)                 │
│  5. RateLimitMiddleware [PENDING]                      │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│           INFRASTRUCTURE LAYER (Services)               │
│  • AuthService (authenticate, logout, session mgmt)    │
│  • PasswordHasher (Argon2id hash/verify)               │
│  • SessionManager (DB-backed sessions)                 │
│  • DocumentService [PENDING]                           │
│  • VehicleService (validation, ownership)              │
│  • ServiceRequestService [PENDING]                     │
│  • NotificationService [PENDING]                       │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                 CORE LAYER (Framework)                  │
│  • Router (route registration, dispatch)               │
│  • Database (PDO abstraction, query builder)           │
│  • Model (base model with CRUD)                        │
│  • Controller (base controller)                        │
│  • Request (HTTP request wrapper)                      │
│  • Response (HTTP response builder)                    │
│  • Migration (database migration base)                 │
│  • Seeder (data seeding base)                          │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                  DATA LAYER (MySQL)                     │
│  • users, roles, user_roles                            │
│  • sessions                                             │
│  • vehicles                                             │
│  • service_requests                                     │
│  • documents [PENDING]                                  │
│  • document_verifications [PENDING]                     │
│  • mechanic_profiles [PENDING]                          │
└─────────────────────────────────────────────────────────┘
```


### 2.2 Flujo de Request (Implementado)

```
1. HTTP Request → public/index.php
2. index.php → Autoloader (PSR-4)
3. Autoloader → App::run()
4. App::run() → Router::dispatch()
5. Router::dispatch() → Middleware Pipeline
   5.1. CORSMiddleware (set headers)
   5.2. AuthMiddleware (validate session)
   5.3. RBACMiddleware (check roles)
6. Middleware Pipeline → Controller::method()
7. Controller → Service Layer (business logic)
8. Service Layer → Database Layer (queries)
9. Database → PDO → MySQL
10. Response ← Controller (JSON/HTML)
11. Response → Client
```

### 2.3 Patrón de Diseño Principal

**MVC + Service Layer + Repository Pattern**

- **Model (M):** Representación de datos, CRUD básico
- **View (V):** JSON responses (REST API), frontend separado
- **Controller (C):** Request handling, validation, response formatting
- **Service Layer:** Business logic, orchestration, transactions
- **Repository Pattern:** Database::fetchOne(), Database::query() abstraction

**Ventajas:**
- Separación clara de responsabilidades
- Testeable (mock services sin tocar DB)
- Escalable (agregar services sin modificar core)
- Mantenible (business logic fuera de controllers)

### 2.4 Arquitectura de Seguridad

```
┌─────────────────────────────────────────────────────────┐
│              SECURITY LAYERS (Defense in Depth)         │
├─────────────────────────────────────────────────────────┤
│ Layer 1: Network                                        │
│   • HTTPS enforced (production)                         │
│   • CORS policy (whitelist origins)                     │
│   • Rate limiting by IP [PENDING]                       │
├─────────────────────────────────────────────────────────┤
│ Layer 2: Authentication                                 │
│   • Argon2id password hashing (memory-hard)            │
│   • Database-backed sessions (not cookies)             │
│   • Session regeneration (anti-fixation)               │
│   • Absolute + idle timeout (2h + 30m)                 │
│   • Timing-attack protection (dummy hash)              │
├─────────────────────────────────────────────────────────┤
│ Layer 3: Authorization                                  │
│   • RBAC (4 roles: customer, mechanic, admin, super)  │
│   • Route-level permissions (middleware)               │
│   • Resource ownership checks (user_id validation)     │
├─────────────────────────────────────────────────────────┤
│ Layer 4: Input Validation                              │
│   • SQL injection prevention (parameterized queries)   │
│   • XSS prevention (JSON responses, no HTML injection) │
│   • CSRF protection [PENDING]                          │
│   • File upload validation [PENDING]                   │
├─────────────────────────────────────────────────────────┤
│ Layer 5: Data Protection                               │
│   • Sensitive data hashing (passwords never plain)     │
│   • Soft deletes (audit trail)                         │
│   • Session data encryption [PENDING]                  │
│   • Document access control [PENDING]                  │
└─────────────────────────────────────────────────────────┘
```


---

## 3. BRANCHES IMPORTANTES

### 3.1 Estrategia de Branching

**Modelo:** GitHub Flow (simplificado para MVP)

```
main (production-ready)
  ├── develop (integration branch)
  │     ├── feature/auth-infrastructure
  │     ├── feature/auth-api-layer
  │     ├── feature/document-management
  │     ├── feature/mechanic-profiles
  │     ├── feature/service-requests
  │     └── bugfix/*
  └── hotfix/* (emergency fixes)
```

### 3.2 Branches Actuales

| Branch | Estado | Descripción | Última Actualización |
|--------|--------|-------------|---------------------|
| `main` | Estable | Código en producción (vacío en MVP) | N/A |
| `develop` | Activo | Integración de features | 2026-01-11 |
| `feature/auth-infrastructure` | Activo | Authentication services (70% completo) | 2026-01-10 |
| `feature/database-schema` | Merged | Database migrations y seeders | 2026-01-08 |
| `feature/mvc-core` | Merged | Router, Controller, Model base | 2026-01-07 |

### 3.3 Convención de Commits

**Formato:** `<type>(<scope>): <subject>`

**Types:**
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `refactor`: Refactorización sin cambio funcional
- `docs`: Documentación
- `test`: Tests
- `chore`: Tareas de mantenimiento
- `perf`: Mejora de performance

**Ejemplos:**
```bash
feat(auth): implement PasswordHasher with Argon2id
fix(sessions): correct idle timeout calculation
refactor(database): extract query builder methods
docs(api): add authentication endpoint documentation
test(auth): add property-based tests for SessionManager
```

---

## 4. DECISIONES ARQUITECTÓNICAS TOMADAS

### 4.1 Decisiones de Base de Datos

#### DA-001: Soft Deletes en Todas las Tablas Core
**Fecha:** 2026-01-08  
**Estado:** ✅ Aprobado  

**Decisión:** Todas las tablas core (`users`, `vehicles`, `service_requests`) usan `deleted_at TIMESTAMP NULL` para soft deletes.

**Razones:**
- Auditoría completa (compliance, GDPR)
- Recuperación de datos accidentalmente eliminados
- Integridad referencial (foreign keys con `ON DELETE RESTRICT`)
- Historial de service requests preservado

**Consecuencias:**
- Todas las queries deben incluir `WHERE deleted_at IS NULL`
- Índices compuestos incluyen `deleted_at`
- Espacio de almacenamiento incrementado

**Alternativas Rechazadas:**
- Hard deletes: Pérdida de auditoría
- Archive tables: Complejidad de queries


#### DA-002: Tabla `documents` Polimórfica en Lugar de Columnas en `users`/`vehicles`
**Fecha:** 2026-01-09  
**Estado:** ✅ Aprobado (NO IMPLEMENTADO AÚN)

**Decisión:** NO agregar columnas como `profile_picture_url`, `soat_url`, etc. a las tablas de entidades. En su lugar, usar una tabla `documents` con relación polimórfica (`documentable_type`, `documentable_id`).

**Razones:**
- Flexibilidad: Múltiples documentos del mismo tipo
- Versionamiento: Histórico de uploads
- Verificación: Workflow de aprobación/rechazo completo
- Expiración: Tracking de vencimientos (SOAT, tecnomecánica)
- Metadata: Tamaño, hash SHA-256, MIME type
- Separación de responsabilidades (SRP)

**Consecuencias:**
- Complejidad de queries (JOINs polimórficos)
- Necesita índices compuestos eficientes
- Servicio DocumentService obligatorio

**Alternativas Rechazadas:**
- Columnas directas: Inflexible, sin versionamiento
- Tabla por tipo: Demasiadas tablas, código duplicado

**Referencias:** Ver `docs/architecture/DATABASE_REFINEMENT.md`

#### DA-003: Tabla `mechanic_profiles` Dedicada para Mecánicos
**Fecha:** 2026-01-09  
**Estado:** ✅ Aprobado (NO IMPLEMENTADO AÚN)

**Decisión:** Los mecánicos tienen relación 1:1 con `mechanic_profiles` (11 campos específicos) en lugar de agregar columnas a `users` o solo usar RBAC.

**Razones:**
- 11 campos específicos que no aplican a otros usuarios
- Cumple Single Responsibility Principle
- Queries optimizadas (índices específicos para búsqueda de mecánicos)
- Integridad de datos (constraints específicos)
- Escalable para futuros roles especializados

**Consecuencias:**
- JOIN adicional para queries de mecánico
- Necesita sincronización con `user_roles`

**Alternativas Rechazadas:**
- Solo RBAC: No permite almacenar datos específicos (rating, location, specialties)
- Agregar a `users`: Violación de SRP, columnas NULL para otros roles

**Puntuación Evaluada:** 53/60 vs 23/60 (RBAC solo)

**Referencias:** Ver `docs/architecture/MECHANIC_DOMAIN_ANALYSIS.md`


#### DA-004: Database-Backed Sessions en Lugar de File-Based
**Fecha:** 2026-01-10  
**Estado:** ✅ Implementado

**Decisión:** Las sesiones se almacenan en tabla `sessions` de MySQL, no en archivos del filesystem.

**Razones:**
- Escalabilidad horizontal (múltiples servidores web)
- Concurrencia segura (transacciones ACID)
- Metadata rica (IP, user agent, payload JSON)
- Cleanup automático con queries
- Integración con RBAC (user_id foreign key)

**Consecuencias:**
- Queries adicionales en cada request (SELECT + UPDATE)
- Índice en `last_activity` obligatorio
- Requiere SessionManager service

**Alternativas Rechazadas:**
- File-based: No escalable, problemas de concurrencia
- Redis: Overkill para MVP, complejidad adicional

#### DA-005: Argon2id para Password Hashing (No bcrypt)
**Fecha:** 2026-01-10  
**Estado:** ✅ Implementado

**Decisión:** Usar `PASSWORD_ARGON2ID` en lugar de `PASSWORD_BCRYPT`.

**Razones:**
- Resistente a ataques GPU (memory-hard)
- Estándar moderno (recomendado por OWASP 2023)
- Soporte nativo en PHP 7.2+
- Configuración automática por PHP

**Consecuencias:**
- PHP 7.2+ requerido (cumplido: PHP 8.2)
- Hashing más lento que bcrypt (bueno para seguridad)

**Alternativas Rechazadas:**
- bcrypt: Menos resistente a ataques GPU
- Scrypt: No soportado nativamente en PHP

#### DA-006: Timing-Attack Protection en Authentication
**Fecha:** 2026-01-10  
**Estado:** ✅ Implementado

**Decisión:** Cuando un email no existe, realizar un dummy hash antes de retornar error.

**Razones:**
- Previene user enumeration via timing analysis
- OWASP Authentication Cheat Sheet compliance
- Execution time constante (válido vs inválido)

**Implementación:**
```php
if ($user === null) {
    $this->passwordHasher->hash('dummy_password_for_timing_safety_' . bin2hex(random_bytes(8)));
    return AuthResult::failure('Invalid credentials');
}
```

**Consecuencias:**
- Autenticación ~150ms más lenta para usuarios inexistentes
- Error message genérico (no revela si email existe)


### 4.2 Decisiones de Código y Arquitectura

#### DA-007: PHP 8.2 Features Obligatorias
**Fecha:** 2026-01-07  
**Estado:** ✅ Implementado

**Decisión:** Usar readonly classes, typed properties, constructor property promotion en todos los DTOs y services.

**Ejemplo:**
```php
readonly class SessionData
{
    public function __construct(
        public string $id,
        public int $userId,
        public string $ipAddress,
        public string $userAgent,
        public int $lastActivity,
        public int $createdAt,
        public ?int $expiresAt = null
    ) {}
}
```

**Razones:**
- Immutability (thread-safe, menos bugs)
- Type safety (menos validaciones manuales)
- Código más limpio (menos boilerplate)

**Consecuencias:**
- PHP 8.2+ obligatorio (no backward compatibility con PHP 7.x)
- DTOs no mutables (new instance para cambios)

#### DA-008: Middleware Pipeline con Callable Chain
**Fecha:** 2026-01-07  
**Estado:** ✅ Implementado

**Decisión:** Middleware sigue patrón `handle(Request, callable $next)` (PSR-15 inspired).

**Razones:**
- Composable (orden configurable)
- Testeable (mock $next)
- Short-circuit support (middleware puede retornar sin llamar $next)

**Ejemplo:**
```php
class AuthMiddleware
{
    public function handle(Request $request, callable $next): Response
    {
        if (!$this->isAuthenticated()) {
            return Response::error('Unauthorized', null, 401);
        }
        return $next($request);
    }
}
```

**Alternativas Rechazadas:**
- Filters (pre/post): Menos flexible
- Event system: Overkill para MVP

#### DA-009: PSR-4 Autoloading con Namespace `App\`
**Fecha:** 2026-01-07  
**Estado:** ✅ Implementado

**Decisión:** Todo el código en namespace `App\` con PSR-4 autoloading.

**Estructura:**
```
app/
├── Core/                  → App\Core\
├── Controllers/           → App\Controllers\
├── Infrastructure/        → App\Infrastructure\
├── Middleware/            → App\Middleware\
└── Modules/               → App\Modules\
```

**Razones:**
- PSR-4 standard (interoperabilidad)
- Composer autoloader automático
- Organización clara

**Configuración:**
```json
"autoload": {
    "psr-4": {
        "App\\": "app/"
    }
}
```


---

## 8. ARQUITECTURA DEL BACKEND

### 8.1 Arquitectura Modular PHP

El backend de P.A.R.C.E sigue una arquitectura **MVC + Service Layer** con Domain Driven Design simplificado. No usa frameworks externos — todo el código del framework es propio (core custom).

```
app/
├── Controllers/          # Capa HTTP: maneja request/response
│   ├── Auth/             # AuthController (login, logout, register, me)
│   ├── HealthController  # Endpoints de salud del sistema
│   ├── HomeController    # Página principal
│   ├── ServiceRequestController
│   └── VehicleController
│
├── Core/                 # Framework propio (base del sistema)
│   ├── App.php           # Bootstrapper: carga .env, rutas, configura DB
│   ├── ConfigValidator   # Valida variables de entorno obligatorias
│   ├── Controller.php    # BaseController: json(), error(), success()
│   ├── Database.php      # Abstracción PDO: fetchOne, query, insert, update, delete
│   ├── DatabaseException # Excepción específica de DB
│   ├── Migration.php     # Base para migrations (execute, dropTable)
│   ├── MigrationRunner   # Ejecuta todas las migrations en orden
│   ├── Model.php         # Base model con CRUD básico
│   ├── Request.php       # Wrapper HTTP: input(), header(), cookie(), ip()
│   ├── Response.php      # Builder HTTP: json(), html(), setHeader(), setCookie()
│   ├── Route.php         # Entidad de ruta: method, uri, action, middleware
│   ├── Router.php        # Dispatcher: registra rutas, ejecuta middleware pipeline
│   ├── Seeder.php        # Base para seeders (run, insert)
│   └── Session.php       # Wrapper de sesión PHP nativa
│
├── Infrastructure/       # Implementación de servicios técnicos
│   ├── Auth/             # Todo lo relacionado con autenticación
│   │   ├── DTO/          # Data Transfer Objects (readonly classes)
│   │   ├── Exceptions/   # AuthenticationException
│   │   └── Services/     # PasswordHasher, SessionManager, AuthService, RoleValidator
│   ├── Http/             # Utilidades HTTP transversales
│   │   ├── ErrorHandler      # Mapeo exception → HTTP status code
│   │   ├── IPValidator       # Extracción y validación de IPs
│   │   ├── RateLimiter       # Sliding window, per-endpoint, per-IP
│   │   ├── RequestValidator  # Validación email/password/campos/JSON
│   │   └── ResponseFormatter # Formato estándar JSON, cookies seguras
│   ├── ServiceRequest/   # Validación y servicio de solicitudes
│   └── Vehicle/          # Validación y servicio de vehículos
│
├── Middleware/           # Interceptores del pipeline HTTP
│   ├── AuthMiddleware          # Valida sesión, adjunta user al request
│   ├── CORSMiddleware          # Gestión CORS + preflight
│   ├── RBACMiddleware          # Control de acceso basado en roles
│   └── RequestLoggerMiddleware # Log de cada request en JSON Lines
│
└── Modules/              # (RESERVADO) Módulos de dominio futuros
    └── (vacío actualmente)
```

### 8.2 Domain Driven Design Simplificado

El proyecto usa DDD **sin la complejidad completa** (sin Aggregates, Events, Value Objects formales). Los principios aplicados son:

| Principio DDD | Cómo se aplica en PARCE |
|---------------|------------------------|
| **Separación por dominio** | `Infrastructure/Auth/`, `Infrastructure/Vehicle/`, `Infrastructure/ServiceRequest/` |
| **Entidades** | `users`, `vehicles`, `service_requests` (con IDs propios) |
| **DTOs** | `AuthResult`, `SessionData`, `CookieConfig`, `RateLimitConfig` (readonly classes) |
| **Services** | `AuthService`, `SessionManager`, `VehicleService`, `ServiceRequestService` |
| **Repositorio implícito** | `Database::fetchOne()`, `Database::query()` actúan como repositorio |
| **Ubiquitous Language** | Nombres de dominio: "session", "mechanic profile", "service request", "emergency" |

### 8.3 Flujo HTTP Completo

```
1. Petición HTTP llega a public/index.php
2. App::run() inicializa .env, Database, Router
3. Router::dispatch() recibe Request
4. Middleware Pipeline ejecuta en orden:
   a. CORSMiddleware        → headers Access-Control-*
   b. RequestLoggerMiddleware → log JSON al archivo
   c. (Si ruta protegida) AuthMiddleware → valida cookie parce_session
   d. (Si ruta RBAC) RBACMiddleware → verifica roles del usuario
5. Controller::method() se ejecuta
6. Controller llama a Service (AuthService, VehicleService, etc.)
7. Service llama a Database::fetchOne / insert / update / delete
8. Service retorna DTO o array
9. Controller arma Response JSON via ResponseFormatter
10. Middleware retorna Response hacia arriba
11. Response sale al cliente con headers correctos
```

### 8.4 Router Principal (`app/Core/Router.php`)

```php
// Registro de ruta básica
$router->get('/api/vehicles', [VehicleController::class, 'index'])
       ->middleware([AuthMiddleware::class]);

// Ruta con RBAC (el middleware recibe array de roles permitidos)
$router->post('/api/service-requests', [ServiceRequestController::class, 'store'])
       ->middleware([
           AuthMiddleware::class,
           [RBACMiddleware::class, ['customer']]  // array [Clase, params]
       ]);

// Middleware global (corre en TODOS los requests)
$router->middleware([CORSMiddleware::class, RequestLoggerMiddleware::class]);
```

**Funcionalidades del Router:**
- Soporta `GET`, `POST`, `PUT`, `DELETE`, `ANY`
- Grupos con prefijo y middleware compartido (`group(['prefix' => 'api/v1', 'middleware' => ...], fn)`)
- Extracción de parámetros de URL: `/user/{id}` → `$id`
- Pipeline de middleware callable chain (PSR-15 inspired)
- Manejo de OPTIONS para CORS preflight automático

### 8.5 Manejo de Errores

**Flujo de errores:**
```
Exception lanzada
    ↓
ErrorHandler::handleException($e)
    ↓
mapExceptionToStatusCode($e)
    AuthenticationException → 401
    InvalidArgumentException → 400
    PDOException → 500
    * → 500
    ↓
logException($e) → storage/logs/error-YYYY-MM-DD.log
    ↓
ResponseFormatter::error(genericMessage, null, $statusCode)
    ↓ { "success": false, "error": "Unauthorized" }
```

**Regla de oro:** Nunca exponer stack traces al cliente. Solo mensajes genéricos. Los detalles van al log.

### 8.6 Formato Estándar de Respuestas API

**Éxito:**
```json
{
  "success": true,
  "data": { "userId": 1, "email": "user@parce.com" },
  "message": "Login successful"
}
```

**Error:**
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

**Error de validación:**
```json
{
  "success": false,
  "error": "Validation failed",
  "fields": {
    "email": ["Invalid email format"],
    "password": ["Password must be at least 8 characters"]
  }
}
```

**Reglas del formato:**
- Claves en `camelCase` (snake_case de DB → camelCase en JSON)
- Campos `null` se omiten (sparse JSON)
- Siempre incluye `"success": true/false`
- HTTP 200/201 para éxito, 4xx/5xx para errores
- Header `X-API-Version: 1.0.0` en todas las respuestas


---

## 9. INFRASTRUCTURE LAYER

> ⚠️ **IMPORTANTE PARA FUTUROS AGENTES:** `app/Infrastructure/` es la **implementación oficial y vigente**. Una versión anterior llamada `app/Shared/Http/` fue **eliminada en el refactor**. No existe, no debe recrearse, no debe duplicarse. Todo apunta a `App\Infrastructure\Http\`.

### 9.1 `app/Infrastructure/Http/ErrorHandler.php`

**Namespace:** `App\Infrastructure\Http\ErrorHandler`  
**Tipo:** Clase estática utilitaria  
**Propósito:** Centraliza el manejo de excepciones en el backend. Mapea cualquier `\Throwable` a un código HTTP apropiado, loguea el detalle completo al archivo de log, y retorna una respuesta JSON genérica sin exponer información interna.

**Métodos clave:**
| Método | Descripción |
|--------|-------------|
| `handleException(\Throwable $e): Response` | Punto de entrada principal. Loguea + mapea + retorna respuesta. |
| `mapExceptionToStatusCode(\Throwable $e): int` | `AuthenticationException→401`, `InvalidArgumentException→400`, `PDOException→500`, resto→500 |
| `getGenericErrorMessage(int $statusCode): string` | Retorna mensajes genéricos ("Unauthorized", "Not found", etc.) |
| `logException(\Throwable $e): void` | Escribe en `storage/logs/error-YYYY-MM-DD.log` con timestamp, clase, mensaje, archivo, línea y stack trace completo |
| `validationError(array $errors): Response` | Atajo para respuestas 400 con errores por campo |

**Cuándo se usa:** Cualquier `try-catch` en controllers que quiera retornar una respuesta HTTP estandarizada ante una excepción.

---

### 9.2 `app/Infrastructure/Http/IPValidator.php`

**Namespace:** `App\Infrastructure\Http\IPValidator`  
**Tipo:** Clase estática utilitaria  
**Propósito:** Extrae y valida la IP real del cliente HTTP. Maneja el caso de proxies (header `X-Forwarded-For`) y conexiones directas (`REMOTE_ADDR`). Esencial para rate limiting, logs de seguridad y detección de session hijacking.

**Métodos clave:**
| Método | Descripción |
|--------|-------------|
| `getClientIP(Request $request): string` | IP principal del cliente. Prioriza `X-Forwarded-For`, cae en `REMOTE_ADDR`, fallback `0.0.0.0` |
| `isValidIP(string $ip): bool` | Valida IPv4 e IPv6 usando `filter_var(FILTER_VALIDATE_IP)` |
| `getForwardedIP(Request $request): ?string` | Solo el primer IP de `X-Forwarded-For` o `null` si no existe |
| `getRemoteIP(Request $request): ?string` | IP de `REMOTE_ADDR` validada o `null` |
| `getAllForwardedIPs(Request $request): array` | Array completo de IPs del encabezado (para auditoría) |
| `getIPMetadata(Request $request): array` | Objeto completo: `ip`, `source`, `forwarded_chain`, `remote_addr` |
| `hasIPChanged(string $prev, string $current): bool` | Detecta cambio de IP entre requests (anti session hijacking) |

**Cuándo se usa:** En `AuthMiddleware` (detectar cambio de IP), en `AuthService::authenticate()` (registrar IP de login), en `RateLimiter` (clave por IP).

---

### 9.3 `app/Infrastructure/Http/RateLimiter.php`

**Namespace:** `App\Infrastructure\Http\RateLimiter`  
**Tipo:** Clase estática con estado persistido en JSON  
**Propósito:** Implementa rate limiting por IP usando **sliding window** de 15 minutos. Protege endpoints de ataques de fuerza bruta. Cada combinación `endpoint:IP` tiene su propio contador.

**Configuración hardcodeada:**
- `WINDOW_DURATION = 900` segundos (15 minutos)
- `MAX_ATTEMPTS = 5` intentos por ventana
- Persistencia: `storage/rate_limit.json`

**Métodos clave:**
| Método | Descripción |
|--------|-------------|
| `check(string $endpoint, string $ip): array` | Retorna `['allowed'=>bool, 'remaining'=>int, 'reset_at'=>int\|null]` |
| `recordAttempt(string $endpoint, string $ip): void` | Incrementa el contador de intentos |
| `reset(string $endpoint, string $ip): void` | Elimina el registro tras login exitoso |
| `getRemaining(...)`: int | Intentos restantes antes del bloqueo |
| `getResetTime(...)`: ?int | Timestamp cuando se libera el bloqueo |
| `clearAll(): void` | Limpia todo (para tests) |

**Cuándo se usa:** En `AuthController::login()` antes de llamar a `AuthService::authenticate()`. Retorna 429 con header `Retry-After` si se supera el límite.

**Limitación conocida:** Actualmente usa almacenamiento en archivo JSON (no Redis). En producción con múltiples servidores web, el rate limiting no sería compartido. **Solución futura:** Migrar a Redis o tabla de BD `login_attempts`.

---

### 9.4 `app/Infrastructure/Http/RequestValidator.php`

**Namespace:** `App\Infrastructure\Http\RequestValidator`  
**Tipo:** Clase estática utilitaria  
**Propósito:** Centraliza todas las validaciones de entrada HTTP: formato de email, longitud de password, campos requeridos, Content-Type, parsing de JSON, límite de tamaño del body.

**Configuración:**
- `MAX_BODY_SIZE = 1 MB` (1048576 bytes)
- `MIN_PASSWORD_LENGTH = 8`
- `MAX_PASSWORD_LENGTH = 128`
- `MAX_EMAIL_LENGTH = 255`

**Métodos clave:**
| Método | Descripción |
|--------|-------------|
| `isValidEmail(string $email): bool` | `filter_var + regex` `/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i` |
| `isValidPassword(string $password): bool` | 8-128 chars, sin null bytes |
| `validateRequiredFields(Request, array): array` | Retorna lista de campos ausentes |
| `validateContentType(Request, string): array` | Exige `application/json` en POST/PUT/DELETE |
| `parseJsonBody(Request): array` | Parsea, valida tamaño y verifica que sea objeto JSON (no array raíz) |
| `sanitizeString(string): string` | Elimina null bytes y trim |
| `validateLoginRequest(Request): array` | Combo: campos requeridos + email + password |
| `validateRegistrationRequest(Request): array` | Combo: todos los campos de registro + confirmación de password |

**Cuándo se usa:** Al inicio de cada método de controller que recibe datos del cliente.

---

### 9.5 `app/Infrastructure/Http/ResponseFormatter.php`

**Namespace:** `App\Infrastructure\Http\ResponseFormatter`  
**Tipo:** Clase estática utilitaria  
**Propósito:** **Clase más usada del sistema.** Estandariza el formato JSON de TODAS las respuestas API. Gestiona cookies de sesión con los atributos de seguridad correctos. Convierte snake_case a camelCase automáticamente.

**Métodos principales:**
| Método | Descripción |
|--------|-------------|
| `success($data, $message, $statusCode): Response` | Respuesta `{"success":true,"data":{...},"message":"..."}` |
| `error(string $error, ?array $fields, int $code): Response` | Respuesta `{"success":false,"error":"...","fields":{...}}` |
| `setSessionCookie(Response, string $sessionId, bool $remember): Response` | Cookie `parce_session` con HttpOnly, SameSite, Secure según env |
| `clearSessionCookie(Response): Response` | Expira la cookie (Max-Age=0) |
| `validationError(array $errors, int $code): Response` | Atajo: `error("Validation failed", $errors, 400)` |
| `unauthorized(string $msg): Response` | 401 |
| `forbidden(string $msg): Response` | 403 |
| `notFound(string $msg): Response` | 404 |
| `conflict(string $msg): Response` | 409 |
| `rateLimitExceeded(int $retryAfter): Response` | 429 + header `Retry-After` |
| `serverError(string $msg): Response` | 500 |
| `getSessionCookieName(): string` | Lee `$_ENV['SESSION_COOKIE_NAME']` o `'parce_session'` |

**Conversión camelCase:** `last_login_at` → `lastLoginAt` automáticamente.  
**Sparse JSON:** Los valores `null` se omiten del output.  
**Cookies:** Usa `CookieConfig::fromEnv()` para determinar secure/httpOnly/sameSite según entorno.


---

## 10. MIDDLEWARES

Todos los middlewares están en `app/Middleware/` bajo el namespace `App\Middleware\`. Siguen la firma estándar:

```php
public function handle(Request $request, callable $next): Response
```

### 10.1 `CORSMiddleware`

**Archivo:** `app/Middleware/CORSMiddleware.php`  
**Cuándo se ejecuta:** **Primer middleware en TODOS los requests** (registrado como global en `config/routes.php`).  
**Propósito:** Gestiona Cross-Origin Resource Sharing para permitir que el frontend React (en `localhost:3000`, `localhost:5173`) pueda llamar al backend PHP (en `localhost:80`).

**Comportamiento:**
- Si la request NO tiene header `Origin` (same-origin) → pasa sin modificar
- Si `Origin` NO está en la whitelist → pasa sin agregar headers CORS (la petición falla en el browser, no en el server)
- Si es `OPTIONS` (preflight) → retorna 204 con headers CORS inmediatamente sin ejecutar el resto del pipeline
- Si es request normal con Origin válido → ejecuta pipeline y agrega headers CORS a la respuesta

**Configuración vía `.env`:**
```
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:8080
CORS_ALLOW_CREDENTIALS=true
CORS_MAX_AGE=86400
```

**Headers que agrega:**
- `Access-Control-Allow-Origin: <origin>` (siempre específico, nunca `*` cuando hay credenciales)
- `Access-Control-Allow-Credentials: true`
- `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH`
- `Access-Control-Allow-Headers: Content-Type, Accept, Authorization, X-Requested-With, X-Request-ID`
- `Access-Control-Expose-Headers: X-Request-ID, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset`
- `Vary: Origin` (para caching correcto)

---

### 10.2 `RequestLoggerMiddleware`

**Archivo:** `app/Middleware/RequestLoggerMiddleware.php`  
**Cuándo se ejecuta:** **Segundo middleware global**, después de CORS, antes de autenticación.  
**Propósito:** Registra cada request HTTP con su resultado en formato JSON Lines. Útil para debugging, monitoreo de performance y auditoría de seguridad.

**Qué loguea** (por línea JSON en `storage/logs/requests.log`):
```json
{
  "timestamp": "2026-01-11 10:30:45",
  "requestId": "req_679b2a1d4e8f3.123456",
  "method": "POST",
  "path": "/api/auth/login",
  "status": 200,
  "durationMs": 142.50,
  "ip": "127.0.0.1",
  "userAgent": "Mozilla/5.0..."
}
```

**Qué NO loguea** (seguridad): passwords, tokens, session IDs, cuerpo del request, headers de autorización.  
**Fallo silencioso:** Si el log falla (disco lleno, permisos), la request continúa normalmente.

---

### 10.3 `AuthMiddleware`

**Archivo:** `app/Middleware/AuthMiddleware.php`  
**Cuándo se ejecuta:** En rutas protegidas (declarado por ruta en `routes.php`).  
**Propósito:** Valida que el usuario esté autenticado antes de llegar al controller. Si la sesión es válida, adjunta los datos del usuario al request.

**Flujo completo:**
1. Extrae cookie `parce_session` del request
2. Si no existe → 401 "Authentication required"
3. Llama a `SessionManager::validate($sessionId, $currentIP)`
4. Si inválida/expirada → 401 "Invalid or expired session"
5. Verifica si la sesión debe regenerarse (`shouldRegenerate`) → llama a `regenerate()` y marca para actualizar cookie
6. Hace `Database::fetchOne` del usuario por `sessionData->userId`
7. Si usuario no existe o `account_status !== 'active'` → 401/403
8. Adjunta al request: `session`, `user`, `userId`, `userRoles`, `userRole`
9. Llama a `$next($request)` y actualiza cookie si se regeneró
10. Retorna response

**Datos disponibles en request después de AuthMiddleware:**
```php
$user = $request->getAttribute('user');       // Array: id, email, first_name, last_name, account_status
$session = $request->getAttribute('session'); // SessionData DTO
$userId = $request->getAttribute('userId');   // int
$userRoles = $request->getAttribute('userRoles'); // array: ['customer', 'mechanic']
$userRole = $request->getAttribute('userRole');   // string: rol principal (por jerarquía)
```

**Jerarquía de roles para `userRole`:** `super_admin > administrator > mechanic > customer > support`

---

### 10.4 `RBACMiddleware`

**Archivo:** `app/Middleware/RBACMiddleware.php`  
**Cuándo se ejecuta:** En rutas que requieren un rol específico. **Siempre después de `AuthMiddleware`** (depende del usuario adjunto al request).  
**Propósito:** Controla acceso basado en roles. Verifica que el usuario autenticado tenga al menos uno de los roles permitidos para esa ruta.

**Uso en routes.php:**
```php
// Solo clientes pueden crear solicitudes
$router->post('/api/service-requests', [ServiceRequestController::class, 'store'])
    ->middleware([
        AuthMiddleware::class,
        [RBACMiddleware::class, ['customer']]  // array de roles permitidos
    ]);

// Mecánicos y admins pueden ver disponibles
->middleware([AuthMiddleware::class, [RBACMiddleware::class, ['mechanic', 'administrator']]])
```

**Flujo:**
1. Obtiene `user` del request (adjunto por AuthMiddleware)
2. Si no hay user → 401 (AuthMiddleware no corrió)
3. Llama a `RoleValidator::hasAnyRole($userId, $allowedRoles)`
4. Si tiene al menos un rol → `$next($request)` ✅
5. Si no tiene ningún rol → 403 con `{"requiredRoles": [...], "userRoles": [...]}`


---

## 11. AUTENTICACIÓN

### 11.1 Visión General del Sistema

El sistema de autenticación está completamente en `app/Infrastructure/Auth/` con tres capas:

```
app/Infrastructure/Auth/
├── DTO/
│   ├── AuthResult.php        # Resultado de autenticación (success/failure)
│   ├── CookieConfig.php      # Configuración de cookies de sesión
│   ├── RateLimitConfig.php   # Configuración de rate limiting
│   └── SessionData.php       # Datos de sesión validada
├── Exceptions/
│   └── AuthenticationException.php  # Excepción específica de auth
└── Services/
    ├── AuthService.php       # Orquestador principal de autenticación
    ├── PasswordHasher.php    # Hash/verificación Argon2id
    ├── RoleValidator.php     # Consulta y validación de roles RBAC
    └── SessionManager.php    # Gestión de sesiones en BD
```

### 11.2 PasswordHasher (`app/Infrastructure/Auth/Services/PasswordHasher.php`)

**Propósito:** Hashing seguro de contraseñas con Argon2id.

**Métodos:**
```php
hash(string $password): string        // Genera hash Argon2id (min 8 chars)
verify(string $password, string $hash): bool   // Verificación timing-safe
needsRehash(string $hash): bool       // Detecta hashes con algoritmo antiguo
```

**Comportamiento importante:**
- `hash()` lanza `AuthenticationException` si `strlen($password) < 8`
- `hash()` lanza `AuthenticationException` si el resultado no empieza con `$argon2id$`
- `verify()` usa `password_verify()` internamente (tiempo constante, resistente a timing attacks)
- Cada llamada a `hash()` produce un hash diferente (salt único automático)

### 11.3 SessionManager (`app/Infrastructure/Auth/Services/SessionManager.php`)

**Propósito:** Gestión completa del ciclo de vida de sesiones en la tabla `sessions` de MySQL.

**Configuración:**
- `DEFAULT_IDLE_TIMEOUT = 1800` segundos (30 minutos)
- `DEFAULT_ABSOLUTE_TIMEOUT = 7200` segundos (2 horas)
- `SESSION_REGENERATE_INTERVAL` (env, default 600s = 10 minutos)

**Métodos:**
```php
create(int $userId, array $metadata): string
// → Genera sessionId = bin2hex(random_bytes(20)) = 40 hex chars
// → metadata debe incluir: ip_address, user_agent, remember
// → Payload JSON: user_id, expires_at, max_idle_seconds, remember, created_at, ip_address, user_agent

validate(string $sessionId, ?string $currentIP, bool $autoRegenerate): ?SessionData
// → Retorna null si: no existe, expirada, idle
// → Actualiza last_activity en BD
// → Detecta cambio de IP (warning en log)

destroy(string $sessionId): bool
// → true si se eliminó, false si no existía

regenerate(string $sessionId): string
// → Genera nuevo ID, elimina el viejo, crea nuevo registro
// → Retorna '' si la sesión original no existe

destroyAllUserSessions(int $userId): int
// → Elimina TODAS las sesiones del usuario, retorna cantidad

cleanup(): int
// → Elimina sesiones idle vencidas, retorna cantidad

shouldRegenerate(string $sessionId): bool
// → true si (tiempo desde last_activity >= SESSION_REGENERATE_INTERVAL)
```

**Estructura del payload JSON en BD:**
```json
{
  "user_id": 1,
  "expires_at": 1736621045,
  "max_idle_seconds": 1800,
  "remember": false,
  "created_at": 1736613845,
  "ip_address": "127.0.0.1",
  "user_agent": "Mozilla/5.0..."
}
```

### 11.4 AuthService (`app/Infrastructure/Auth/Services/AuthService.php`)

**Propósito:** Orquestador de autenticación. Usa PasswordHasher + SessionManager + Database.

**Métodos:**
```php
authenticate(string $email, string $password, bool $remember, string $ip, string $userAgent): AuthResult
logout(string $sessionId): bool
validateSession(string $sessionId): ?SessionData
isAuthenticated(): bool        // Lee cookie parce_session del request actual
getCurrentUser(): ?array       // Cacheado en instancia (evita queries repetidas)
refreshSession(string $sessionId): bool
```

**Flujo de `authenticate()`:**
1. Valida formato de email → failure si inválido
2. Valida longitud de password → failure si < 8
3. `Database::fetchOne` users WHERE email = ? AND deleted_at IS NULL
4. Si no existe: `$hasher->hash('dummy...')` (anti timing) → failure "Invalid credentials"
5. Si `account_status !== 'active'` → failure "Account is not active"
6. `$hasher->verify($password, $hash)` → failure si false
7. Si `$hasher->needsRehash($hash)` → rehashea y actualiza BD transparentemente
8. `$sessionManager->create($userId, [...])` → sessionId
9. `Database::update` users: `last_login_at`, `last_login_ip`
10. Retorna `AuthResult::success($userId, $sessionId)`

### 11.5 Login / Logout / Session Validation

**Login (via `AuthController::login()`):**
```
POST /api/auth/login
→ RequestValidator::validateLoginRequest()
→ RateLimiter::check('login', $ip) → 429 si superado
→ AuthService::authenticate($email, $password, $remember, $ip, $userAgent)
→ Si success: ResponseFormatter::setSessionCookie($response, $sessionId, $remember)
→ 200 {success:true, data:{user, roles, sessionId}}
→ RateLimiter::reset() si éxito | RateLimiter::recordAttempt() si fallo
```

**Logout (via `AuthController::logout()`):**
```
POST /api/auth/logout  (requiere AuthMiddleware)
→ Lee sessionId del cookie
→ AuthService::logout($sessionId)  → SessionManager::destroy()
→ ResponseFormatter::clearSessionCookie($response)
→ 200 {success:true, message:"Logged out successfully"}
(idempotente: retorna 200 aunque la sesión ya no exista)
```

**Session Validation (en cada request protegida):**
```
AuthMiddleware::handle()
→ Lee cookie parce_session
→ SessionManager::validate($sessionId, $currentIP)
  → DB: SELECT FROM sessions WHERE id = ?
  → Checa expires_at (absoluto)
  → Checa last_activity + max_idle_seconds (idle)
  → UPDATE last_activity = time()
  → Retorna SessionData o null
→ Si válida: adjunta user al request y continúa
```

### 11.6 Validación de Roles (`app/Infrastructure/Auth/Services/RoleValidator.php`)

**Propósito:** Consulta los roles activos de un usuario desde la BD.

**Métodos:**
```php
getUserRoles(int $userId): array          // Retorna array de slugs: ['customer', 'mechanic']
hasRole(int $userId, string $role): bool  // Checa un rol específico
hasAnyRole(int $userId, array $roles): bool // Checa si tiene al menos uno
hasAllRoles(int $userId, array $roles): bool // Checa si tiene todos
```

**Query que usa:**
```sql
SELECT r.slug FROM roles r
INNER JOIN user_roles ur ON ur.role_id = r.id
WHERE ur.user_id = ?
  AND ur.is_active = 1
  AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
  AND r.is_active = 1
```

### 11.7 Security Hardening Implementado

| Técnica | Implementación |
|---------|---------------|
| Argon2id | `password_hash($pwd, PASSWORD_ARGON2ID)` |
| Timing-safe verify | `password_verify()` (tiempo constante) |
| Dummy hash anti-enumeration | `$hasher->hash('dummy_' . random_bytes(8))` si user no existe |
| Session regeneration | `shouldRegenerate()` cada 10 minutos → nuevo ID, anti-fixation |
| Absolute session timeout | 2 horas (payload: `expires_at`) |
| Idle timeout | 30 minutos (payload: `max_idle_seconds`) + `last_activity` en BD |
| Session destroy on logout | `DELETE FROM sessions WHERE id = ?` |
| IP change detection | Log warning si IP cambia entre validaciones |
| HttpOnly cookies | Cookie no accesible desde JS |
| SameSite=Lax | Protección CSRF básica en cookies |
| Rate limiting | 5 intentos / 15 min / IP / endpoint |
| Error messages genéricos | Nunca revelar si email existe |
| Secure flag | `true` en producción via `CookieConfig::fromEnv()` |


---

## 12. BASE DE DATOS

### 12.1 Conexión y Configuración

**Driver:** MySQL 8.0+ vía PDO  
**Charset:** `utf8mb4` (soporte emoji, caracteres especiales)  
**Collation:** `utf8mb4_unicode_ci`  
**Engine:** InnoDB (transacciones ACID, foreign keys)  
**Abstracción:** `app/Core/Database.php` con métodos estáticos

```php
Database::fetchOne(string $sql, array $params): ?array
Database::query(string $sql, array $params): array
Database::insert(string $table, array $data): int    // retorna lastInsertId
Database::update(string $table, array $data, string $where, array $params): int
Database::delete(string $table, string $where, array $params): int
Database::beginTransaction(): void
Database::commit(): void
Database::rollback(): void
```

**Configuración en `.env`:**
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=parce
DB_USERNAME=root
DB_PASSWORD=
```

### 12.2 Tabla: `users`

**Propósito:** Cuentas de usuario del sistema. Todos los actores (clientes, mecánicos, admins) son registros en esta tabla.

```sql
users (
  id               BIGINT UNSIGNED AUTO_INCREMENT PK
  email            VARCHAR(255) UNIQUE NOT NULL
  password_hash    VARCHAR(255) NOT NULL           -- Argon2id hash
  first_name       VARCHAR(100) NOT NULL
  last_name        VARCHAR(100) NOT NULL
  phone            VARCHAR(20) NULL
  profile_picture_url VARCHAR(500) NULL            -- DEPRECATED (usa tabla documents)
  account_status   ENUM('active','suspended','deactivated','pending_verification') DEFAULT 'active'
  email_verification_status ENUM('unverified','verified') DEFAULT 'unverified'
  phone_verification_status ENUM('unverified','verified') DEFAULT 'unverified'
  email_verified_at    TIMESTAMP NULL
  phone_verified_at    TIMESTAMP NULL
  last_login_at    TIMESTAMP NULL                  -- Actualizado en cada login exitoso
  last_login_ip    VARCHAR(45) NULL                -- IPv4 o IPv6
  created_at       TIMESTAMP DEFAULT NOW()
  updated_at       TIMESTAMP ON UPDATE NOW()
  deleted_at       TIMESTAMP NULL                  -- Soft delete
)
```

**Índices clave:** `email`, `account_status`, `last_login_at`, `deleted_at`, composite `(account_status, email_verification_status)`.

---

### 12.3 Tabla: `roles`

**Propósito:** Define los roles del sistema. Los 5 roles iniciales son `is_system_role = TRUE`.

```sql
roles (
  id         INT UNSIGNED AUTO_INCREMENT PK
  name       VARCHAR(50) UNIQUE NOT NULL
  slug       VARCHAR(50) UNIQUE NOT NULL    -- Clave usada en código: 'customer', 'mechanic', etc.
  description TEXT NULL
  is_system_role BOOLEAN DEFAULT FALSE
  is_active  BOOLEAN DEFAULT TRUE
  created_at TIMESTAMP
  updated_at TIMESTAMP
)
```

**Roles del sistema:**

| slug | name | Descripción |
|------|------|-------------|
| `customer` | Customer | Usuario estándar, crea service requests |
| `mechanic` | Mechanic | Presta el servicio, gestiona su disponibilidad |
| `administrator` | Administrator | Gestión operativa de la plataforma |
| `super_admin` | Super Administrator | Acceso total, configuración del sistema |
| `support` | Support Staff | Soporte read-only |

**Tabla pivote `user_roles`:**
```sql
user_roles (
  id          BIGINT UNSIGNED AUTO_INCREMENT PK
  user_id     BIGINT UNSIGNED FK → users.id (CASCADE DELETE)
  role_id     INT UNSIGNED FK → roles.id (CASCADE DELETE)
  assigned_by BIGINT UNSIGNED FK → users.id (SET NULL)
  assigned_at TIMESTAMP DEFAULT NOW()
  expires_at  TIMESTAMP NULL                -- NULL = sin expiración
  is_active   BOOLEAN DEFAULT TRUE
  UNIQUE (user_id, role_id)
)
```

---

### 12.4 Tabla: `sessions`

**Propósito:** Sesiones de usuario respaldadas por BD (no filesystem).

```sql
sessions (
  id           VARCHAR(255) PK              -- 40 chars hex (bin2hex(random_bytes(20)))
  user_id      BIGINT UNSIGNED NULL FK → users.id (CASCADE DELETE)
  ip_address   VARCHAR(45) NULL             -- IPv4 o IPv6
  user_agent   TEXT NULL
  payload      LONGTEXT NOT NULL            -- JSON con expires_at, max_idle_seconds, remember, etc.
  last_activity INT UNSIGNED NOT NULL       -- Unix timestamp, actualizado en cada validación
  created_at   TIMESTAMP DEFAULT NOW()
  INDEX (user_id), INDEX (last_activity)
)
```

---

### 12.5 Tabla: `vehicles`

**Propósito:** Vehículos registrados por los clientes. Soft delete preserva historial de service requests.

```sql
vehicles (
  id              BIGINT UNSIGNED AUTO_INCREMENT PK
  user_id         BIGINT UNSIGNED FK → users.id (RESTRICT)
  license_plate   VARCHAR(20) UNIQUE NOT NULL   -- Placa normalizada (uppercase, trimmed)
  make            VARCHAR(50) NOT NULL           -- Marca: Toyota, Chevrolet, etc.
  model           VARCHAR(50) NOT NULL
  year            SMALLINT UNSIGNED NOT NULL
  color           VARCHAR(30) NULL
  vin             VARCHAR(17) UNIQUE NULL        -- Vehicle Identification Number
  vehicle_type    VARCHAR(20) DEFAULT 'sedan'    -- sedan, suv, truck, motorcycle, van, other
  fuel_type       VARCHAR(20) DEFAULT 'gasoline' -- gasoline, diesel, electric, hybrid, other
  nickname        VARCHAR(50) NULL               -- Nombre amigable del usuario
  primary_photo_url VARCHAR(255) NULL            -- DEPRECATED (usa tabla documents)
  is_primary      BOOLEAN DEFAULT FALSE          -- ¿Es el vehículo principal del usuario?
  status          VARCHAR(20) DEFAULT 'active'   -- active, inactive
  created_at, updated_at, deleted_at
)
```

---

### 12.6 Tabla: `service_requests`

**Propósito:** Solicitudes de asistencia vehicular. Núcleo del negocio de P.A.R.C.E.

```sql
service_requests (
  id              BIGINT UNSIGNED AUTO_INCREMENT PK
  service_code    VARCHAR(20) UNIQUE NOT NULL  -- Ej: SR-2024-001234 (tracking público)
  customer_id     BIGINT UNSIGNED FK → users.id (RESTRICT)
  vehicle_id      BIGINT UNSIGNED FK → vehicles.id (RESTRICT)
  mechanic_id     BIGINT UNSIGNED NULL FK → users.id (RESTRICT)  -- null hasta asignación
  resolved_by     BIGINT UNSIGNED NULL FK → users.id (RESTRICT)
  emergency_type  VARCHAR(50) NOT NULL  -- tire, battery, fuel, lockout, tow, engine, other
  description     TEXT NOT NULL
  priority        VARCHAR(20) DEFAULT 'normal'   -- normal, urgent, critical
  latitude        DECIMAL(10,8) NOT NULL          -- GPS donde se necesita la ayuda
  longitude       DECIMAL(11,8) NOT NULL
  status          VARCHAR(20) DEFAULT 'pending'   -- pending, assigned, in_progress, completed, cancelled, expired
  requested_at    TIMESTAMP DEFAULT NOW()
  assigned_at     TIMESTAMP NULL
  started_at      TIMESTAMP NULL
  completed_at    TIMESTAMP NULL
  cancelled_at    TIMESTAMP NULL
  expired_at      TIMESTAMP NULL
  cancellation_reason TEXT NULL
  cancelled_by    BIGINT UNSIGNED NULL FK → users.id
  estimated_cost  DECIMAL(10,2) NULL
  final_cost      DECIMAL(10,2) NULL
  customer_rating TINYINT UNSIGNED NULL  -- 1-5
  customer_feedback TEXT NULL
  created_at, updated_at, deleted_at
)
```

**Reglas de negocio:**
- Un cliente solo puede tener 1 request activa (status: pending/assigned/in_progress)
- Un vehículo solo puede tener 1 request activa a la vez
- Statuses terminales: `completed`, `cancelled`, `expired`
- `ON DELETE RESTRICT` en todas las FK (integridad histórica)

### 12.7 Tablas Diseñadas (NO IMPLEMENTADAS AÚN)

| Tabla | Propósito | Ref. Documento |
|-------|-----------|----------------|
| `mechanic_profiles` | Datos específicos de mecánicos (location, rating, specialties) | `DOMAIN_MODEL_FINAL.md` §4.2 |
| `documents` | Almacén polimórfico de documentos (users, vehicles) | `DATABASE_REFINEMENT.md` §2.2 |
| `document_verifications` | Workflow de aprobación de documentos | `DATABASE_REFINEMENT.md` §2.3 |
| `document_types` | Catálogo de tipos de documentos | `DATABASE_REFINEMENT.md` §2.4 |
| `admin_access_requests` | Flujo de aprobación para roles admin | Migration 001 |
| `login_attempts` | Rate limiting en BD (reemplazo futuro de JSON) | `design.md` API layer |

### 12.8 Relaciones Principales

```
users (1) ──────────────── (N) user_roles
users (1) ──────────────── (N) sessions
users (1) ──────────────── (N) vehicles
users (1) ──────────── (0..1) mechanic_profiles  [PENDIENTE]
users (1) ──────────────── (N) service_requests (como customer)
users (1) ──────────────── (N) service_requests (como mechanic)
vehicles (1) ───────────── (N) service_requests
users (1) ──────────────── (N) documents  [PENDIENTE] (polimórfico)
vehicles (1) ───────────── (N) documents  [PENDIENTE] (polimórfico)
documents (1) ──────────── (N) document_verifications  [PENDIENTE]
```


---

## 13. FRONTEND

### 13.1 Stack Tecnológico

| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| React | 18.2.0 | UI framework |
| TypeScript | 5.2.2 | Tipado estático |
| Vite | 5.0.8 | Build tool + dev server |
| React Router DOM | 6.20.0 | Client-side routing |
| TailwindCSS | 3.3.6 | Utility-first CSS |
| PostCSS + Autoprefixer | 8.4.32 | CSS processing |

**Comandos:**
```bash
cd frontend
npm run dev      # Dev server (puerto default 5173)
npm run build    # tsc + vite build → dist/
npm run lint     # ESLint con reglas TypeScript
npm run preview  # Preview del build de producción
```

### 13.2 Estructura de Directorios

```
frontend/
├── src/
│   ├── App.tsx              # Router principal, rutas de la app
│   ├── main.tsx             # Entry point, ReactDOM.createRoot
│   ├── index.css            # Tailwind directives
│   ├── vite-env.d.ts        # Tipos de import.meta.env
│   │
│   ├── config/
│   │   └── api.ts           # BASE_URL, API_ENDPOINTS, TIMEOUT, WITH_CREDENTIALS
│   │
│   ├── services/
│   │   ├── apiClient.ts     # Fetch wrapper con credentials:'include' (cookies)
│   │   ├── authService.ts   # login(), logout(), register(), getMe()
│   │   ├── vehicleService.ts # CRUD de vehículos
│   │   └── serviceRequestService.ts # CRUD + acciones de requests
│   │
│   ├── contexts/
│   │   ├── AuthContext.tsx  # Estado global de autenticación (user, isAuth, roles)
│   │   ├── VehicleContext.tsx  # Estado global de vehículos del usuario
│   │   └── RequestContext.tsx  # Estado global de service requests
│   │
│   ├── hooks/
│   │   ├── useAuth.ts       # Acceso al AuthContext con useContext
│   │   ├── useVehicles.ts   # Acceso al VehicleContext
│   │   └── useRequests.ts   # Acceso al RequestContext
│   │
│   ├── layouts/
│   │   ├── MainLayout.tsx   # Layout autenticado (sidebar, navbar, contenido)
│   │   └── AuthLayout.tsx   # Layout no autenticado (centrado, sin sidebar)
│   │
│   ├── pages/
│   │   ├── LoginPage.tsx       # Formulario de login
│   │   ├── RegisterPage.tsx    # Formulario de registro
│   │   ├── CustomerDashboard.tsx  # Dashboard cliente
│   │   ├── MechanicDashboard.tsx  # Dashboard mecánico
│   │   ├── NotFoundPage.tsx    # 404
│   │   ├── customer/           # Páginas específicas de clientes
│   │   └── mechanic/           # Páginas específicas de mecánicos
│   │
│   ├── components/
│   │   ├── layout/             # Componentes de layout (Sidebar, Header, etc.)
│   │   └── vehicles/           # Componentes de vehículos (VehicleCard, VehicleForm, etc.)
│   │
│   ├── routes/
│   │   └── ProtectedRoute.tsx  # HOC que verifica autenticación y rol
│   │
│   └── types/
│       ├── auth.ts             # User, AuthResult, ApiResponse<T>, etc.
│       ├── vehicle.ts          # Vehicle, VehicleForm, etc.
│       └── serviceRequest.ts   # ServiceRequest, ServiceRequestStatus, etc.
│
├── dist/                    # Build de producción (generado por npm run build)
├── index.html               # Template HTML principal
├── vite.config.ts           # Config de Vite (plugins, server, alias)
├── tailwind.config.js       # Config de Tailwind
├── tsconfig.json            # Configuración TypeScript principal
└── package.json
```

### 13.3 Integración con Backend

**Punto de conexión central:** `frontend/src/services/apiClient.ts`

```typescript
// Configuración crítica: credentials: 'include'
// Esto envía y recibe cookies de sesión automáticamente
const config: RequestInit = {
  credentials: 'include',   // ← Permite que el browser envíe parce_session cookie
  headers: { 'Content-Type': 'application/json' }
};
```

**URL base:** `http://localhost:8000` (configurable via `.env` frontend)  
**Variable de entorno:** `VITE_API_BASE_URL` y `VITE_API_URL` en `frontend/.env`

**Flujo de autenticación en frontend:**
```
1. User submits login form
2. authService.login(email, password) → POST /api/auth/login
3. Backend retorna 200 + Set-Cookie: parce_session=...
4. Browser almacena cookie automáticamente (HttpOnly, no accesible desde JS)
5. AuthContext actualiza estado: {user, isAuthenticated: true, roles}
6. Router redirige a dashboard según rol
7. Requests subsiguientes envían cookie automáticamente (credentials: 'include')
8. authService.logout() → POST /api/auth/logout → backend borra sesión → clearCookie
```

**Variables de entorno frontend (`frontend/.env`):**
```
VITE_API_BASE_URL=http://localhost:8000
VITE_API_URL=http://localhost:8000/api
```

**Tipo `ApiResponse<T>` (types/auth.ts):**
```typescript
interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  fields?: Record<string, string[]>;
}
```

### 13.4 Estado de Implementación del Frontend

| Página / Componente | Estado | Notas |
|--------------------|--------|-------|
| LoginPage | ✅ Implementado | Integrado con AuthContext |
| RegisterPage | ✅ Implementado | Validaciones básicas |
| CustomerDashboard | ✅ Implementado | Vista principal cliente |
| MechanicDashboard | ✅ Implementado | Vista principal mecánico |
| ProtectedRoute | ✅ Implementado | Redirige si no autenticado |
| VehicleComponents | ✅ Implementado | CRUD de vehículos |
| ServiceRequest (customer) | 🔄 Parcial | Páginas en `pages/customer/` |
| ServiceRequest (mechanic) | 🔄 Parcial | Páginas en `pages/mechanic/` |
| DocumentUpload | ⏳ Pendiente | Requiere document management backend |
| MechanicProfile | ⏳ Pendiente | Requiere mechanic_profiles backend |
| AdminPanel | ⏳ Pendiente | Requiere admin controllers |
| NotificationsSystem | ⏳ Pendiente | Real-time (WebSocket) |

### 13.5 Build y Despliegue

**Build para producción:**
```bash
cd frontend
npm run build
# Genera frontend/dist/ con assets optimizados
# dist/index.html → punto de entrada SPA
# dist/assets/ → JS/CSS minificados con hash en nombre
```

**En desarrollo (XAMPP):**
- Backend PHP corre en `http://localhost:80` (o `http://localhost:8000` con PHP built-in server)
- Frontend Vite corre en `http://localhost:5173`
- CORS configurado para permitir `localhost:5173`


---

## 14. ESPECIFICACIONES KIRO

Las specs Kiro están en `.kiro/specs/`. Cada spec tiene `requirements.md`, `design.md`, `tasks.md` y un `.config.kiro`.

### 14.1 `mvc-folder-structure`

**Tipo:** Feature spec (Requirements-First)  
**Estado:** ✅ COMPLETADO  
**Propósito:** Definió la estructura de carpetas MVC inicial del proyecto.  
**Completado:** Toda la estructura de directorios, Router, Controller base, Model base, entry point `public/index.php`, `.htaccess`, configuración básica.  
**Pendiente:** Nada. Esta spec fue el fundamento del proyecto.

---

### 14.2 `database-architecture`

**Tipo:** Design spec  
**Estado:** ✅ COMPLETADO (diseño) / ⚠️ PARCIALMENTE IMPLEMENTADO  
**Propósito:** Definió el modelo de datos completo: tablas core, tablas de documentos, tablas de mecánicos.  
**Completado:** ERDs, análisis de dominio, decisiones arquitectónicas, SQL de referencia para todas las tablas.  
**Archivos notables:**
- `design.md`: Modelo de datos principal
- `DOMAIN_MODEL_FINAL.md`: Decisión definitiva sobre arquitectura documental
- `DATABASE_REFINEMENT.md`: Propuesta de tabla `documents` polimórfica
- `MECHANIC_DOMAIN_ANALYSIS.md`: Justificación de `mechanic_profiles` separado
- `users-roles-erd.md`: ERD para autenticación
- `services-module-erd.md`: ERD para service requests
- `services-module-refactored.sql`: SQL completo del módulo de servicios

**Pendiente de implementar:**
- `mechanic_profiles` table (migration + service)
- `documents` table (migration + service)
- `document_verifications` table
- `login_attempts` table (rate limiting robusto)

---

### 14.3 `database-infrastructure-layer`

**Tipo:** Design spec  
**Estado:** ✅ COMPLETADO  
**Propósito:** Diseño de la capa de infraestructura de BD (`app/Core/Database.php`, migrations, seeders).  
**Completado:** `Database.php` abstraction, `Migration.php` base class, `MigrationRunner`, seeders.  
**Pendiente:** Nada. Completamente implementado y en uso.

---

### 14.4 `authentication-infrastructure-layer`

**Tipo:** Feature spec (Requirements-First)  
**Estado:** 🔄 EN PROGRESO (70% completado)  
**Propósito:** Security Foundation Layer: PasswordHasher, SessionManager, DTOs, AuthService.  

**Completado (tareas con [x]):**
- Task 1: DTOs (AuthResult, CookieConfig, RateLimitConfig, SessionData, AuthenticationException) ✅
- Task 2: Checkpoint DTOs ✅
- Task 3: PasswordHasher (hash, verify, needsRehash) ✅
- Task 4: Checkpoint PasswordHasher ✅
- Task 5: SessionManager (create, validate, destroy, regenerate, destroyAll, cleanup) ✅
- Task 6: Checkpoint SessionManager ✅
- Task 7.1: AuthService::authenticate() ✅
- Task 7.3: AuthService::logout() ✅
- Task 7.4: AuthService::validateSession() ✅
- Task 7.5: AuthService::isAuthenticated() + getCurrentUser() ✅
- Task 7.6: AuthService::refreshSession() ✅

**Pendiente (tareas sin [x]):**
- Task 1.2: Property test CookieConfig ⏳
- Task 1.4: Property test RateLimitConfig ⏳
- Task 1.6: Property test SessionData ⏳
- Task 1.8: Property test AuthResult ⏳
- Task 3.2: Property test password hashing ⏳
- Task 3.4: Property test password verification timing ⏳
- Task 3.6: Unit tests PasswordHasher ⏳
- Task 5.2: Property test session creation ⏳
- Task 5.4: Property test session validation ⏳
- Task 5.7: Property test session regeneration ⏳
- Task 5.9: Property test session destruction ⏳
- Task 5.11: Unit tests SessionManager ⏳
- Task 7.2: Property test authentication timing ⏳
- Task 7.7: Unit tests AuthService ⏳
- Task 8: Checkpoint AuthService ⏳
- Task 9.1–9.4: Integration tests ⏳
- Task 10: Final checkpoint ⏳

**Archivo de spec:** `.kiro/specs/authentication-infrastructure-layer/tasks.md`

---

### 14.5 `authentication-api-layer`

**Tipo:** Feature spec (Requirements-First)  
**Estado:** ⏳ PENDIENTE (≈ 20% completado)  
**Propósito:** API Layer: AuthController, middleware pipeline completo, rate limiting integrado, rutas configuradas.

**Completado:**
- Task 1.1: RequestValidator ✅ (implementado en `app/Infrastructure/Http/`)
- Task 1.2: ResponseFormatter ✅ (implementado en `app/Infrastructure/Http/`)
- Task 2.1: AuthMiddleware ✅ (implementado en `app/Middleware/`)
- Task 3.1: RoleValidator ✅ (implementado en `app/Infrastructure/Auth/Services/`)
- Task 3.2: RBACMiddleware ✅ (implementado en `app/Middleware/`)
- Task 10.1: RateLimiter ✅ (implementado en `app/Infrastructure/Http/`)
- Task 12.1: IPValidator ✅ (implementado en `app/Infrastructure/Http/`)
- Task 13.1: Health check endpoint ✅ (en AuthController)
- Task 14.1: Routes configuradas ✅ (`config/routes.php`)
- Task 15.1: ErrorHandler ✅ (implementado en `app/Infrastructure/Http/`)
- Task 15.2: ErrorHandler integrado en AuthController ✅

**Pendiente:**
- Task 5.1: AuthController::register() endpoint completo ⏳
- Task 6.1: AuthController::login() con rate limiting integrado ⏳
- Task 7.1: AuthController::logout() ⏳
- Task 8.1: AuthController::me() ⏳
- Task 10.2: Integrar RateLimiter en login endpoint ⏳
- Task 11.1–11.2: RequestLoggerMiddleware integrado en controllers ⏳
- Task 12.2: IPValidator integrado en auth flow ⏳
- Task 17.1–17.4: Integration tests ⏳
- Todos los tests opcionales (marcados con `*`) ⏳

**Archivo de spec:** `.kiro/specs/authentication-api-layer/tasks.md`

---

### 14.6 Resumen de Estado de Specs

| Spec | Estado | Completitud |
|------|--------|-------------|
| mvc-folder-structure | ✅ Completo | 100% |
| database-architecture | ✅ Diseño completo | 60% implementado |
| database-infrastructure-layer | ✅ Completo | 100% |
| authentication-infrastructure-layer | 🔄 En progreso | 70% |
| authentication-api-layer | ⏳ En progreso | 35% |


---

## 15. DECISIONES ARQUITECTÓNICAS IMPORTANTES

> Esta sección contiene restricciones críticas que TODO agente IA debe respetar antes de realizar cambios.

### 15.1 ✅ `app/Shared/` fue ELIMINADO — `app/Infrastructure/` es la implementación oficial

**Situación:** En un refactor anterior se detectaron archivos duplicados entre `app/Shared/Http/` y `app/Infrastructure/Http/`. Se tomó la decisión de **eliminar `app/Shared/`** y consolidar todo en `app/Infrastructure/`.

**Regla para futuros agentes:**
- ❌ NO crear `app/Shared/` ni ningún subdirectorio dentro de él
- ❌ NO crear `app/Shared/Http/ErrorHandler.php` ni ningún otro archivo "Shared"
- ❌ NO mover clases de `app/Infrastructure/` a otra ubicación
- ✅ Las clases HTTP utilities están en `app/Infrastructure/Http/`
- ✅ Las clases Auth están en `app/Infrastructure/Auth/`

**Evidencia en Git:**
- Commit `5f30ae7`: "docs: Complete dependency impact analysis - Infrastructure/Http should NOT be moved"
- Commit `7c3d3c6`: "audit: Phase 1 current state - 7 duplicate files detected"
- Commit `8eda5a6`: "refactor: reorganize repository - merged Shared into Infrastructure"

---

### 15.2 ✅ NO duplicar clases de Infrastructure

**Regla:** Una clase, un lugar. Si `ResponseFormatter` existe en `App\Infrastructure\Http\ResponseFormatter`, **no crear otro** `App\Core\ResponseFormatter` ni `App\Helpers\ResponseFormatter`.

**Namespaces definitivos:**
```
App\Infrastructure\Http\ErrorHandler
App\Infrastructure\Http\IPValidator
App\Infrastructure\Http\RateLimiter
App\Infrastructure\Http\RequestValidator
App\Infrastructure\Http\ResponseFormatter
App\Infrastructure\Auth\Services\AuthService
App\Infrastructure\Auth\Services\PasswordHasher
App\Infrastructure\Auth\Services\SessionManager
App\Infrastructure\Auth\Services\RoleValidator
App\Infrastructure\Auth\DTO\AuthResult
App\Infrastructure\Auth\DTO\SessionData
App\Infrastructure\Auth\DTO\CookieConfig
App\Infrastructure\Auth\DTO\RateLimitConfig
App\Infrastructure\Auth\Exceptions\AuthenticationException
```

---

### 15.3 ✅ Mantener compatibilidad con Composer PSR-4

**Mapeo PSR-4 en `composer.json`:**
```json
"autoload": {
    "psr-4": {
        "App\\": "app/"
    }
}
```

**Regla:** El namespace `App\` mapea a la carpeta `app/`. Cualquier clase nueva debe seguir esta convención. Después de agregar una clase nueva, ejecutar `composer dump-autoload`.

---

### 15.4 ✅ Readonly Classes para todos los DTOs

**Regla:** Todos los Data Transfer Objects DEBEN ser `readonly class` con constructor property promotion.

```php
// ✅ CORRECTO
readonly class AuthResult {
    public function __construct(
        public bool $success,
        public ?int $userId,
        ...
    ) {}
}

// ❌ INCORRECTO
class AuthResult {
    public bool $success;
    public function setSuccess(bool $v) { $this->success = $v; } // mutable = mal
}
```

---

### 15.5 ✅ Todos los queries usan parámetros preparados

**Regla:** Nunca concatenar inputs del usuario directamente en queries SQL.

```php
// ✅ CORRECTO (parameterized)
Database::fetchOne('SELECT * FROM users WHERE email = ? AND deleted_at IS NULL', [$email]);

// ❌ INCORRECTO (SQL injection risk)
Database::fetchOne("SELECT * FROM users WHERE email = '$email'");
```

---

### 15.6 ✅ Soft deletes en todas las tablas core

**Regla:** No usar `DELETE` en registros de `users`, `vehicles`, `service_requests`. Usar `deleted_at = NOW()` mediante `Database::update()`.

La única tabla con hard delete es `sessions` (ciclo de vida explícito).

---

### 15.7 ✅ Branch `Angel` es la rama estable

**Regla:** `Angel` es el branch de desarrollo activo y estable del equipo. Todo trabajo nuevo debe hacerse en features branches partiendo de `Angel`, no de `main`.

**Branches del equipo:**
- `origin/Angel` — Branch principal activo
- `origin/Duvan` — Colaborador Duvan
- `origin/Juan` — Colaborador Juan
- `origin/Soto` — Colaborador Soto
- `origin/sebastian` — Colaborador Sebastian
- `origin/main` — Rama de producción (actualizar solo con PR aprobado)

---

## 16. ESTADO ACTUAL DEL PROYECTO

### 16.1 Información de Repositorio

| Ítem | Valor |
|------|-------|
| **Branch principal activo** | `Angel` |
| **Branch en producción** | `main` |
| **Último commit** | `0b752f1` |
| **Mensaje del commit** | "docs: Add merge report for refactor/modular-architecture → Angel" |
| **Último push exitoso** | `origin/Angel` |
| **Tag de hito** | `v1.0.0-pre-refactor`, `v1.0-mvp` |
| **Estado del backend** | Estable (MVP funcional) |
| **Estado del frontend** | Estable (build correcto) |
| **Composer** | Correcto (PSR-4, sin errores) |
| **Build frontend** | Correcto (`dist/` generado) |

### 16.2 Archivos de Estado en Raíz

| Archivo | Propósito |
|---------|-----------|
| `MERGE_REPORT.md` | Reporte del merge de refactor/modular-architecture → Angel |
| `FINAL_PUSH_REPORT.md` | Reporte del último push exitoso |
| `PRE_COMMIT_VALIDATION.md` | Checklist de validación pre-commit |
| `DOCUMENTATION_STRUCTURE_REPORT.md` | Estructura de documentación |
| `REPOSITORY_STRUCTURE_REPORT.md` | Estructura del repositorio |
| `backup_pre_refactor.sql` | Backup de BD antes del refactor |
| `backup_pre_refactor_20260611_204423.sql` | Backup con timestamp |

### 16.3 Validaciones para Verificar Estado

```bash
# Verificar que el autoloading funciona
composer dump-autoload

# Verificar que el frontend compila
cd frontend && npm run build

# Verificar sintaxis PHP
php -l app/Infrastructure/Auth/Services/AuthService.php

# Verificar migración pendiente en BD
php database/migrations/...

# Estado de git
git status
git log --oneline -5
```


---

## 17. PRÓXIMOS PASOS RECOMENDADOS

### 17.1 Roadmap Técnico (Prioridad Alta → Baja)

#### FASE 1: Completar Authentication Layer (1-2 semanas)

**1.1 Tests de Authentication Infrastructure** (spec: `authentication-infrastructure-layer`)
- [ ] Property tests para DTOs (CookieConfig, RateLimitConfig, SessionData, AuthResult)
- [ ] Property tests para PasswordHasher (hash, verify, timing)
- [ ] Property tests para SessionManager (create, validate, regenerate)
- [ ] Unit tests completos para AuthService
- [ ] Integration tests: login → session → validate → logout

**1.2 Completar AuthController** (spec: `authentication-api-layer`)
- [ ] Implementar `register()` endpoint completo (`POST /api/auth/register`)
- [ ] Implementar `login()` con RateLimiter integrado (`POST /api/auth/login`)
- [ ] Implementar `logout()` con limpieza de cookie (`POST /api/auth/logout`)
- [ ] Implementar `me()` endpoint (`GET /api/auth/me`)
- [ ] Integrar IPValidator en authenticate()
- [ ] Tests de los endpoints (unit + integration)

**1.3 Configurar framework de testing**
- Instalar PHPUnit: `composer require --dev phpunit/phpunit`
- Crear `phpunit.xml` en raíz
- Crear estructura `tests/Unit/`, `tests/Integration/`, `tests/Property/`
- Crear primeros tests de PasswordHasher como referencia

#### FASE 2: Document Management (2-3 semanas)

**2.1 Migrations nuevas**
- [ ] Migration: `create_documents_table` (tabla polimórfica)
- [ ] Migration: `create_document_verifications_table`
- [ ] Migration: `create_document_types_table` + seeds

**2.2 Services nuevos**
- [ ] `DocumentService` (upload, get, list, delete, checkExpiration)
- [ ] `DocumentVerificationService` (submit, approve, reject, status)
- [ ] `DocumentStorageService` (storeFile, validateType, generateHash)

**2.3 Controllers nuevos**
- [ ] `DocumentController` (CRUD de documentos)
- [ ] `Admin/DocumentVerificationController` (cola de verificación)

#### FASE 3: Mechanic Profiles (1-2 semanas)

**3.1 Migration + Service**
- [ ] Migration: `create_mechanic_profiles_table`
- [ ] `MechanicProfileService` (create, approve, updateLocation, getAvailable)
- [ ] `MechanicVerificationService` (canOperateAsMechanic)

**3.2 API endpoints**
- [ ] `MechanicController` (profile CRUD, availability, location update)
- [ ] Rutas en `config/routes.php`

#### FASE 4: Service Requests Business Logic (2 semanas)

**4.1 Completar ServiceRequestController**
- [ ] Validaciones de negocio en `store()`: 1 request activa por cliente, vehículo activo
- [ ] Implementar `accept()`, `start()`, `complete()` para mecánicos
- [ ] Implementar `cancel()` con razón
- [ ] Implementar `rate()` para feedback

**4.2 Service layer**
- [ ] `ServiceRequestService` con reglas de negocio completas
- [ ] `ServiceRequestValidator` con todas las validaciones

#### FASE 5: Endurecimiento de Seguridad (1 semana)

- [ ] Migrar RateLimiter de JSON a tabla `login_attempts` en BD
- [ ] Implementar CSRF protection middleware
- [ ] Revisar todos los endpoints con OWASP checklist
- [ ] Agregar headers de seguridad HTTP (CSP, X-Frame-Options, etc.)
- [ ] Audit de logs de autenticación

#### FASE 6: Optimización Frontend (1-2 semanas)

- [ ] Completar páginas customer (`pages/customer/`)
- [ ] Completar páginas mechanic (`pages/mechanic/`)
- [ ] Implementar DocumentUpload component
- [ ] Implementar real-time updates (polling → WebSocket)
- [ ] Optimizar bundle size (code splitting)
- [ ] Implementar error boundaries en React
- [ ] Mejorar UX con loading states y feedback

#### FASE 7: Preparación para Producción

- [ ] Configurar HTTPS (certificado SSL)
- [ ] Configurar `.env.production` con valores reales
- [ ] Configurar nginx/Apache vhost para SPA routing
- [ ] Implementar backup automático de BD
- [ ] Configurar logging centralizado
- [ ] Health checks en producción
- [ ] Monitoreo básico (uptime, error rate)
- [ ] Documentación de API (Swagger/OpenAPI)


---

## 18. INSTRUCCIONES PARA FUTUROS AGENTES IA

Si eres un agente IA tomando el proyecto por primera vez, sigue este protocolo de onboarding:

### 18.1 Protocolo de Onboarding (OBLIGATORIO)

**Paso 1: Leer este archivo completo**
```
Leer AI_CONTEXT_PARCE.md de inicio a fin.
No asumir arquitectura. No improvisar.
```

**Paso 2: Revisar la documentación arquitectónica**
```
docs/architecture/DOMAIN_MODEL_FINAL.md     ← Modelo de datos definitivo
docs/architecture/DATABASE_REFINEMENT.md    ← Propuesta de documentos
docs/architecture/MECHANIC_DOMAIN_ANALYSIS.md ← Justificación mechanic_profiles
docs/audits/MVP_AUDIT_REPORT_V2.md          ← Estado actual del MVP
```

**Paso 3: Revisar las specs Kiro activas**
```
.kiro/specs/authentication-infrastructure-layer/tasks.md  ← Tareas pendientes de tests
.kiro/specs/authentication-api-layer/tasks.md             ← AuthController pendiente
```

**Paso 4: Revisar el código implementado clave**
```
app/Infrastructure/Auth/Services/AuthService.php
app/Infrastructure/Auth/Services/SessionManager.php
app/Infrastructure/Auth/Services/PasswordHasher.php
app/Infrastructure/Http/ResponseFormatter.php
app/Middleware/AuthMiddleware.php
config/routes.php
```

**Paso 5: Verificar el entorno antes de hacer cambios**
```bash
composer dump-autoload          # Verificar autoloading PHP
cd frontend && npm run build    # Verificar build TypeScript
php -r "require 'vendor/autoload.php'; echo 'OK';"
```

---

### 18.2 Reglas Estrictas (NO VIOLAR)

| Regla | Descripción |
|-------|-------------|
| 🚫 No mover Infrastructure | `app/Infrastructure/` NO se mueve. Es la ubicación final. |
| 🚫 No crear app/Shared | `app/Shared/` fue eliminado. No recrear bajo ninguna circunstancia. |
| 🚫 No duplicar clases | Si una clase existe, USARLA. No crear duplicados en otra carpeta. |
| 🚫 No cambiar namespaces sin análisis | Cambiar un namespace rompe el autoloading. Requiere `composer dump-autoload`. |
| 🚫 No hard delete en users/vehicles | Solo soft delete (`deleted_at = NOW()`). |
| 🚫 No concatenar inputs en SQL | Siempre usar parámetros preparados (`?` en PDO). |
| 🚫 No exponer stack traces al cliente | Solo mensajes genéricos. Stack trace al log. |
| 🚫 No commitear a main directamente | Crear PR desde branch Angel o feature branch. |
| ✅ Mantener branch Angel como estable | Todo desarrollo activo va en Angel o branches derivados. |
| ✅ Validar composer antes de cambios PHP | `composer dump-autoload` después de agregar/mover clases. |
| ✅ Validar npm run build antes de commits | El frontend debe compilar sin errores TypeScript. |
| ✅ Usar ResponseFormatter para todas las respuestas | Nunca devolver arrays JSON manualmente en controllers. |
| ✅ Usar Database:: para todos los queries | Nunca instanciar PDO directamente en services/controllers. |

---

### 18.3 Patrones de Código Obligatorios

**Controllers:** Siempre usar try-catch con ErrorHandler:
```php
public function login(Request $request): Response
{
    try {
        // validar → autenticar → responder
        return ResponseFormatter::success($data, 'Login successful');
    } catch (\Exception $e) {
        return ErrorHandler::handleException($e);
    }
}
```

**Services:** Inyección de dependencias vía constructor, no `new` dentro de métodos:
```php
class AuthService {
    public function __construct(
        private PasswordHasher $passwordHasher,
        private SessionManager $sessionManager
    ) {}
}
```

**DTOs:** Siempre `readonly class` con factory methods:
```php
readonly class AuthResult {
    public static function success(int $userId, string $sessionId): self { ... }
    public static function failure(string $message): self { ... }
}
```

**Queries:** Siempre con placeholders `?`:
```php
Database::fetchOne(
    'SELECT id, email FROM users WHERE email = ? AND deleted_at IS NULL',
    [$email]
);
```

---

### 18.4 Contexto de Negocio Esencial

Para tomar decisiones técnicas correctas, recordar el contexto de negocio:

- **P.A.R.C.E** conecta conductores (customers) varados con mecánicos certificados
- Un **service request** = un cliente con un vehículo necesita ayuda en una ubicación GPS
- Un **mecánico** debe tener documentos verificados antes de atender requests
- Los **roles** son jerárquicos: `super_admin > administrator > mechanic > customer`
- La plataforma es **colombiana**: las regulaciones aplican (SOAT, licencia de conducción)
- El **MVP** corre en XAMPP local, el objetivo es llegar a producción en VPS

---

### 18.5 Contacto con el Equipo

El equipo tiene múltiples branches activos (Angel, Duvan, Juan, Soto, sebastian). Si hay conflictos entre ramas, siempre consultar antes de hacer merge. La rama `Angel` es la fuente de verdad del estado actual.

---

## RESUMEN EJECUTIVO

Estado del proyecto P.A.R.C.E al 11 de enero de 2026:

1. **El proyecto es un backend PHP 8.2 + frontend React/TypeScript/Vite** para asistencia vehicular de emergencia en Colombia.

2. **La arquitectura es MVC + Service Layer** con framework custom (sin Laravel/Symfony). Todo el código del framework está en `app/Core/`.

3. **`app/Infrastructure/` es la implementación oficial**. `app/Shared/` fue eliminado en refactor. No recrear.

4. **El backend MVP es funcional**: autenticación, sesiones, RBAC, vehículos y service requests tienen endpoints HTTP registrados con middleware pipeline.

5. **La autenticación usa Argon2id + sesiones en BD** con timing-attack protection, session regeneration anti-fixation, y absolute/idle timeouts.

6. **La principal deuda técnica** es la falta de tests: los services de autenticación tienen ~0% de cobertura de tests automatizados.

7. **Tablas pendientes de implementar**: `mechanic_profiles`, `documents`, `document_verifications`. Están diseñadas en `docs/architecture/` pero sin migrations PHP.

8. **El frontend tiene build estable** y está integrado con el backend via cookies (`credentials: 'include'`). Páginas principales implementadas.

9. **Branch estable**: `Angel` (HEAD → origin/Angel). Último commit: `0b752f1`.

10. **AuthController está incompleto**: `register()`, `login()` y `logout()` existen en routes pero la implementación completa con rate limiting integrado está pendiente.

11. **El RateLimiter actual** usa almacenamiento en archivo JSON (`storage/rate_limit.json`). En producción con múltiples servidores esto no funcionará: migrar a tabla BD.

12. **Riesgo principal**: Sin tests automatizados, los cambios pueden romper el flujo de autenticación sin detección inmediata.

13. **El sistema de sesiones** soporta "remember me" (30 días), regeneración anti-fixation cada 10 minutos, y cleanup automático de sesiones expiradas.

14. **Los DTOs son inmutables** (`readonly class` de PHP 8.2), lo que garantiza que el estado de autenticación no puede ser modificado accidentalmente.

15. **La documentación de arquitectura es exhaustiva** en `docs/architecture/` con ERDs, análisis de dominio, y justificaciones de cada decisión técnica.

16. **CORS está configurado** para desarrollo local (`localhost:3000`, `localhost:5173`, `localhost:8080`) y requiere actualización antes de producción.

17. **El próximo hito** es completar los tests de `authentication-infrastructure-layer` y los endpoints de `authentication-api-layer` (register, login, logout, me).

18. **La base de datos tiene 5 tablas activas**: `users`, `roles`, `user_roles`, `sessions`, `vehicles`, `service_requests` con foreign keys e índices apropiados.

19. **El sistema RBAC** usa tabla pivote `user_roles` con soporte para expiración de roles y múltiples roles simultáneos por usuario.

20. **Para producción**, los pasos críticos son: HTTPS, `.env.production` con APP_KEY real, migrar RateLimiter a BD, implementar CSP headers, y configurar backup automático de BD.

---

*Documento generado el 2026-01-11. Actualizar este archivo cuando cambien aspectos arquitectónicos importantes, se completen specs, o se tomen nuevas decisiones técnicas significativas.*

