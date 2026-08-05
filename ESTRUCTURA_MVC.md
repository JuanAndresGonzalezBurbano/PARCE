# Estructura MVC - PARCE

## 🏗️ Arquitectura del Proyecto

### Backend (PHP)

```
app/
├── Controllers/                    # 🎮 CONTROLADORES (Request Handler)
│   ├── Auth/
│   │   └── AuthController.php     # Autenticación (login, register, logout, me)
│   ├── AdminController.php        # Panel de admin (usuarios, vehículos)
│   ├── VehicleController.php      # Gestión de vehículos
│   ├── ServiceRequestController.php # Solicitudes de servicio
│   ├── PQRController.php          # Peticiones, Quejas y Reclamos
│   ├── SurveyController.php       # Encuestas
│   └── HealthController.php       # Health check
│
├── Infrastructure/                 # 🔧 SERVICIOS Y UTILIDADES
│   ├── Admin/
│   │   └── AdminService.php       # Lógica de admin (getUsers, getVehicles)
│   ├── Auth/
│   │   ├── Services/
│   │   │   ├── AuthService.php     # Lógica de autenticación
│   │   │   ├── SessionManager.php  # Gestión de sesiones
│   │   │   ├── PasswordHasher.php  # Hash de contraseñas
│   │   │   └── RoleValidator.php   # Validación de roles
│   │   ├── DTO/
│   │   │   ├── AuthResult.php
│   │   │   ├── CookieConfig.php
│   │   │   ├── RateLimitConfig.php
│   │   │   └── SessionData.php
│   │   └── Exceptions/
│   │       └── AuthenticationException.php
│   ├── Http/
│   │   ├── ErrorHandler.php        # Manejo de errores
│   │   ├── IPValidator.php         # Validación de IP
│   │   ├── RateLimiter.php         # Rate limiting
│   │   ├── RequestValidator.php    # Validación de requests
│   │   └── ResponseFormatter.php   # Formato de respuestas
│   ├── Vehicle/
│   │   ├── VehicleService.php      # Lógica de vehículos
│   │   └── VehicleValidator.php    # Validación
│   ├── ServiceRequest/
│   │   ├── ServiceRequestService.php
│   │   ├── ServiceRequestValidator.php
│   │   └── ServiceRequestEvidenceService.php
│   ├── PQR/
│   │   ├── PQRService.php
│   │   └── PQRValidator.php
│   └── Survey/
│       ├── SurveyService.php
│       └── SurveyValidator.php
│
├── Core/                           # 🎯 NÚCLEO DEL FRAMEWORK
│   ├── App.php                    # Inicializador de app
│   ├── ConfigValidator.php        # Validación de configuración
│   ├── Controller.php             # Clase base de controladores
│   ├── Database.php               # Abstracción de BD
│   ├── DatabaseException.php
│   ├── DomainException.php
│   ├── EnvLoader.php              # Cargador de .env
│   ├── Migration.php              # Base de migraciones
│   ├── MigrationRunner.php        # Ejecutor de migraciones
│   ├── Request.php                # Objeto Request
│   ├── RequestContext.php         # Contexto de request (usuario, BD)
│   ├── Response.php               # Objeto Response
│   ├── Route.php                  # Definición de ruta
│   ├── Router.php                 # Router principal
│   ├── Session.php                # Manejo de sesiones
│   └── Seeder.php                 # Base de seeders
│
└── Middleware/                     # 🔐 INTERMEDIARIOS
    ├── AuthMiddleware.php         # Autenticación
    ├── CORSMiddleware.php         # CORS
    ├── RBACMiddleware.php         # Control de roles
    ├── RequestLoggerMiddleware.php # Logging
    └── SecurityHeadersMiddleware.php # Headers de seguridad

config/
└── routes.php                      # 🛣️ DEFINICIÓN DE RUTAS

database/
├── migrations/                     # 📋 MIGRACIONES (Schema)
│   ├── 2024_01_01_000001_create_users_and_roles_tables.php
│   ├── 2024_01_01_000002_create_sessions_table.php
│   ├── 2024_01_01_000003_create_vehicles_table.php
│   ├── 2024_01_01_000004_create_service_requests_table.php
│   └── ...más migraciones
└── seeds/                          # 🌱 SEEDERS (Datos iniciales)

public/
└── index.php                       # 📍 ENTRY POINT del backend
```

### Frontend (React/TypeScript)

```
src/
├── config/                         # ⚙️ CONFIGURACIÓN
│   └── api.ts                      # Config de API (endpoints, timeouts)
│
├── services/                       # 🔌 SERVICIOS (API Calls)
│   ├── apiClient.ts                # Cliente HTTP base
│   ├── authService.ts              # Llamadas auth (/login, /register, /me)
│   ├── adminService.ts             # Llamadas admin (/users, /vehicles)
│   ├── vehicleService.ts           # Llamadas vehículos
│   ├── serviceRequestService.ts    # Llamadas solicitudes
│   ├── pqrService.ts               # Llamadas PQR
│   └── surveyService.ts            # Llamadas encuestas
│
├── controllers/                    # 🧠 CONTEXTO (Redux-like)
│   ├── AuthContext.tsx             # Estado de autenticación
│   └── MechanicContext.tsx         # Estado de mecánico
│
├── views/
│   ├── pages/                      # 📄 PÁGINAS (Rutas principales)
│   │   ├── admin/
│   │   │   ├── AdminUsersPage.tsx       # Tabla de usuarios
│   │   │   ├── AdminVehiclesPage.tsx    # Tabla de vehículos
│   │   │   ├── AdminMechanicsPage.tsx
│   │   │   └── ...más páginas admin
│   │   ├── DashboardPage.tsx       # Dashboard principal
│   │   ├── LoginPage.tsx           # Login
│   │   ├── RegisterPage.tsx        # Registro
│   │   ├── ProfilePage.tsx         # Perfil de usuario
│   │   └── ...más páginas
│   │
│   └── components/                 # 🧩 COMPONENTES (Reutilizables)
│       ├── Navbar.tsx              # Barra de navegación
│       ├── Sidebar.tsx             # Menú lateral
│       ├── FormFields/             # Inputs, selects, etc
│       ├── Cards/                  # Cards reutilizables
│       └── ...más componentes
│
├── App.tsx                         # 🎯 Componente raíz
├── main.tsx                        # 📍 ENTRY POINT frontend
└── index.css                       # Estilos globales
```

---

## 🔄 Flujo MVC

### 1️⃣ REQUEST LLEGA (Frontend)
```
Usuario → React Component → apiClient.get('/admin/users')
```

### 2️⃣ SERVICIO LLAMA API (Frontend Service)
```
adminService.getUsers() → fetch('/api/admin/users')
```

### 3️⃣ ROUTER RECIBE (Backend)
```
GET /api/admin/users → config/routes.php → AdminController::users()
```

### 4️⃣ CONTROLADOR PROCESA (Backend Controller)
```
AdminController::users() → AdminService::getUsers() → Database
```

### 5️⃣ SERVICIO EJECUTA LÓGICA (Backend Service)
```
AdminService::getUsers($filters) → Queries SQL → Mapeo de datos
```

### 6️⃣ RESPUESTA FORMATEADA (Backend)
```
ResponseFormatter::success(['users' => [...], 'count' => 6])
```

### 7️⃣ FRONTEND RECIBE Y RENDERIZA
```
adminService.getUsers() → setUsers() → <AdminUsersPage> renderiza tabla
```

---

## 📝 Tipos de Archivos por Carpeta

| Carpeta | Responsabilidad | Ejemplo |
|---------|-----------------|---------|
| **Controllers/** | HTTP Request → Lógica → Response | Recibir POST /login, validar, llamar AuthService |
| **Services/** | Lógica de negocio, queries complejas | Autenticar usuario, validar credenciales |
| **Infrastructure/** | Detalles técnicos, utilidades, DTOs | Formateo HTTP, validación, excepciones |
| **Middleware/** | Interceptar requests antes de Controllers | Verificar token, validar CORS, rate limit |
| **Core/** | Framework base, abstracciones genéricas | Router, Database, Request, Response |
| **Config/** | Configuración estática de rutas | Mapeo URL → Controller::method |
| **Database/** | Schema (migraciones) y datos iniciales (seeders) | CREATE TABLE users, INSERT INTO roles |

---

## 🚀 Cómo Agregar Nueva Funcionalidad

### Ejemplo: Crear endpoint "GET /api/admin/reports"

1. **Crear método en Service** (`app/Infrastructure/Admin/AdminService.php`)
   ```php
   public function getReports(): array { ... }
   ```

2. **Crear método en Controller** (`app/Controllers/AdminController.php`)
   ```php
   public function reports(Request $request): Response { ... }
   ```

3. **Registrar ruta** (`config/routes.php`)
   ```php
   $router->get('/api/admin/reports', [AdminController::class, 'reports']);
   ```

4. **Crear servicio frontend** (`src/services/adminService.ts`)
   ```typescript
   async getReports() { return apiClient.get('/admin/reports'); }
   ```

5. **Usar en componente** (`src/views/pages/admin/AdminReportsPage.tsx`)
   ```typescript
   const response = await adminService.getReports();
   setReports(response.data.reports);
   ```

---

## ✅ Checklist de Estructura

- ✅ Controllers manejan HTTP (entrada/salida)
- ✅ Services contienen lógica de negocio
- ✅ Infrastructure maneja detalles técnicos
- ✅ Middleware intercepta requests
- ✅ Core proporciona abstracciones base
- ✅ Routes centralizadas en config/
- ✅ Database con migraciones versionadas
- ✅ Frontend services llaman a endpoints
- ✅ Pages son contenedores de lógica
- ✅ Components son UI reutilizable

---

**Última actualización:** 2026-08-05
