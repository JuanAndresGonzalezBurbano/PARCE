# Estructura MVC - PARCE (Actualizada)

## 🏗️ Arquitectura MVC Pura

### Backend (PHP) - Estructura MVC Completa

```
app/
├── Controllers/                    # 🎮 CONTROLADORES (Maneja HTTP requests)
│   ├── Auth/
│   │   └── AuthController.php     # Autenticación (login, register, logout, me)
│   ├── AdminController.php        # Panel de admin (usuarios, vehículos)
│   ├── VehicleController.php      # Gestión de vehículos
│   ├── ServiceRequestController.php # Solicitudes de servicio
│   ├── PQRController.php          # Peticiones, Quejas y Reclamos
│   ├── SurveyController.php       # Encuestas
│   └── HealthController.php       # Health check
│
├── Models/                         # 📊 MODELOS (Lógica + Acceso a Datos)
│   ├── Admin/
│   │   └── AdminService.php       # Lógica de admin (getUsers, getVehicles)
│   ├── Auth/
│   │   ├── AuthService.php        # Lógica de autenticación
│   │   ├── SessionManager.php     # Gestión de sesiones
│   │   ├── PasswordHasher.php     # Hash de contraseñas
│   │   ├── RoleValidator.php      # Validación de roles
│   │   ├── AuthResult.php         # DTO de resultado
│   │   ├── CookieConfig.php       # DTO de configuración
│   │   ├── RateLimitConfig.php    # DTO de rate limit
│   │   ├── SessionData.php        # DTO de sesión
│   │   └── AuthenticationException.php # Excepción
│   ├── Vehicle/
│   │   ├── VehicleService.php     # Lógica de vehículos
│   │   └── VehicleValidator.php   # Validación de entrada
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
├── Views/                          # 🎨 VISTAS (Formateo de Respuestas)
│   ├── ResponseFormatter.php      # Formato JSON de respuestas
│   ├── ErrorHandler.php           # Manejo y formato de errores
│   ├── RequestValidator.php       # Validación de requests
│   ├── IPValidator.php            # Validación de IPs
│   └── RateLimiter.php            # Rate limiting por IP
│
├── Core/                           # 🎯 NÚCLEO DEL FRAMEWORK
│   ├── App.php                    # Inicializador
│   ├── ConfigValidator.php        # Validación de config
│   ├── Controller.php             # Clase base
│   ├── Database.php               # Abstracción BD
│   ├── DatabaseException.php
│   ├── DomainException.php
│   ├── EnvLoader.php              # Cargador .env
│   ├── Migration.php
│   ├── MigrationRunner.php
│   ├── Request.php                # Objeto Request
│   ├── RequestContext.php         # Contexto
│   ├── Response.php               # Objeto Response
│   ├── Route.php
│   ├── Router.php                 # Router
│   ├── Session.php
│   └── Seeder.php
│
└── Middleware/                     # 🔐 MIDDLEWARES (Intercepta requests)
    ├── AuthMiddleware.php         # Autenticación
    ├── CORSMiddleware.php         # CORS
    ├── RBACMiddleware.php         # Control de roles
    ├── RequestLoggerMiddleware.php # Logging
    └── SecurityHeadersMiddleware.php # Headers de seguridad

config/
└── routes.php                      # 🛣️ Definición de rutas

database/
├── migrations/                     # 📋 Schema (CREATE TABLE, etc)
└── seeds/                          # 🌱 Datos iniciales

public/
└── index.php                       # 📍 Entry point
```

### Frontend (React/TypeScript)

```
src/
├── config/                         # ⚙️ CONFIGURACIÓN
│   └── api.ts                      # Config de API
│
├── services/                       # 🔌 SERVICIOS (API Calls)
│   ├── apiClient.ts                # Cliente HTTP base
│   ├── authService.ts              # Llamadas auth
│   ├── adminService.ts             # Llamadas admin
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
│   │   │   ├── AdminUsersPage.tsx
│   │   │   ├── AdminVehiclesPage.tsx
│   │   │   └── ...más páginas admin
│   │   ├── DashboardPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── ProfilePage.tsx
│   │   └── ...más páginas
│   │
│   └── components/                 # 🧩 COMPONENTES (Reutilizables)
│       ├── Navbar.tsx
│       ├── Sidebar.tsx
│       ├── FormFields/
│       ├── Cards/
│       └── ...más componentes
│
├── App.tsx                         # 🎯 Componente raíz
├── main.tsx                        # 📍 Entry point
└── index.css                       # Estilos globales
```

---

## 📊 Explicación del Patrón MVC

### **M - Models** (Modelos)
**Responsabilidad:** Lógica de negocio y acceso a datos

Archivos:
- `AuthService.php` - Métodos de login, register, logout
- `VehicleService.php` - Métodos CRUD de vehículos
- `PQRValidator.php` - Validación de reglas de negocio
- `SessionManager.php` - Gestión de sesiones

```php
// Ejemplo: Models/Auth/AuthService.php
public function authenticate($email, $password): AuthResult {
    // Validar credenciales en BD
    // Hash de contraseña
    // Crear sesión
    // Devolver resultado
}
```

### **V - Views** (Vistas)
**Responsabilidad:** Formateo y presentación de datos

Archivos:
- `ResponseFormatter.php` - Formatea respuestas JSON
- `ErrorHandler.php` - Formatea errores
- `RequestValidator.php` - Valida entrada HTTP
- `RateLimiter.php` - Valida rate limits

```php
// Ejemplo: Views/ResponseFormatter.php
public static function success($data, $message = null): Response {
    return [
        'success' => true,
        'data' => $data,
        'message' => $message
    ];
}
```

### **C - Controllers** (Controladores)
**Responsabilidad:** Orquestar request → Model → View

```php
// Ejemplo: Controllers/Auth/AuthController.php
public function login(Request $request): Response {
    // 1. Validar request (View)
    $email = $request->input('email');
    $password = $request->input('password');
    
    // 2. Llamar modelo (Model)
    $result = $this->authService->authenticate($email, $password);
    
    // 3. Formatear respuesta (View)
    return ResponseFormatter::success(
        ['token' => $result->token],
        'Login successful'
    );
}
```

---

## 🔄 Flujo MVC Completo

### Request HTTP: `POST /api/auth/login`

```
1. REQUEST → Router
   POST /api/auth/login { email, password }

2. Router → Controller
   config/routes.php mapea a AuthController::login()

3. Controller → Model (Lógica)
   AuthController::login() 
   → AuthService::authenticate($email, $password)

4. Model → Database
   AuthService busca usuario, valida password, crea sesión

5. Model → Return Result
   Devuelve AuthResult con token

6. Controller → View (Formateo)
   ResponseFormatter::success(['token' => ...])

7. View → Response HTTP
   { success: true, data: { token }, message: "..." }

8. Frontend recibe y procesa
```

---

## ✅ Principios MVC Implementados

| Principio | ¿Cómo? |
|-----------|--------|
| **M - Lógica centralizada** | En Models/, no en Controllers |
| **V - Formato centralizado** | En Views/ResponseFormatter.php |
| **C - Orquestación** | Controllers solo coordinan M y V |
| **Separación de responsabilidades** | Cada carpeta una responsabilidad |
| **Reutilizable** | Puedo usar AuthService desde CLI, API, Cron |
| **Testeable** | Cada componente se prueba aislado |
| **Mantenible** | Cambios en lógica = solo Models/* |

---

## 🚀 Agregar Nueva Funcionalidad - Ejemplo

### Crear endpoint `GET /api/admin/reports`

#### 1. Crear Model (Models/Admin/AdminService.php)
```php
public function getReports(array $filters = []): array {
    // Lógica de negocio
    // Queries a BD
    // Mapeo de datos
    return $reports;
}
```

#### 2. Crear Controller (Controllers/AdminController.php)
```php
public function reports(Request $request): Response {
    $filters = [
        'date_from' => $request->query('date_from'),
        'date_to' => $request->query('date_to'),
    ];
    $reports = $this->adminService->getReports($filters);
    return ResponseFormatter::success(
        ['reports' => $reports],
        'Reports retrieved'
    );
}
```

#### 3. Registrar Route (config/routes.php)
```php
$router->get('/api/admin/reports', [AdminController::class, 'reports']);
```

#### 4. Frontend Service (src/services/adminService.ts)
```typescript
async getReports(filters) {
    return apiClient.get('/admin/reports', { params: filters });
}
```

#### 5. Frontend Component (src/views/pages/admin/AdminReportsPage.tsx)
```typescript
useEffect(() => {
    const response = await adminService.getReports(filters);
    setReports(response.data.reports);
}, [filters]);
```

---

## 📋 Verificación - Todo Sigue en Funcionamiento

✅ Backend en `localhost/PARCE/public/index.php/api/...`  
✅ Frontend en `localhost:5173`  
✅ Login funcional  
✅ Admin panel con usuarios y vehículos  
✅ Toda la lógica en Models/  
✅ Respuestas formateadas en Views/  
✅ Controllers solo orquestan  

---

**Versión:** MVC Puro  
**Última actualización:** 2026-08-05  
**Estado:** ✅ Funcional y Productivo
