# 🔒 ANÁLISIS RBAC EN ROUTES - P.A.R.C.E

## ESTADO ACTUAL

### Service Request Routes (12 endpoints)

#### Customer Endpoints (6)
```php
✓ Auth Protected | ❌ RBAC Missing | ⚠️  Manual Check in Controller

1. GET  /api/service-requests              → index()
2. POST /api/service-requests              → store()
3. GET  /api/service-requests/{id}         → show()
4. PUT  /api/service-requests/{id}         → update()
5. POST /api/service-requests/{id}/cancel  → cancel()
6. POST /api/service-requests/{id}/rate    → rate()
```

**Protección Actual**:
- ✅ `AuthMiddleware` aplicado
- ❌ `RBACMiddleware` NO aplicado
- ⚠️  Validación manual en controller:
  ```php
  if ($userRole !== 'customer') {
      return ResponseFormatter::error('This endpoint is for customers only', null, 403);
  }
  ```

#### Mechanic Endpoints (6)
```php
✓ Auth Protected | ❌ RBAC Missing | ⚠️  Manual Check in Controller

7.  GET  /api/mechanic/requests                  → mechanicIndex()
8.  GET  /api/mechanic/requests/available        → availableForMechanic()
9.  POST /api/mechanic/requests/{id}/accept      → accept()
10. PUT  /api/mechanic/requests/{id}/start       → start()
11. PUT  /api/mechanic/requests/{id}/complete    → complete()
```

**Protección Actual**:
- ✅ `AuthMiddleware` aplicado
- ❌ `RBACMiddleware` NO aplicado
- ⚠️  Validación manual en controller:
  ```php
  if ($userRole !== 'mechanic') {
      return ResponseFormatter::error('This endpoint is for mechanics only', null, 403);
  }
  ```

---

## PROBLEMAS DETECTADOS

### 1. ⚠️  Código Duplicado (CRÍTICO)

**Problema**: La misma validación de rol se repite 12 veces en ServiceRequestController.

**Ubicaciones del Código Duplicado**:
```php
// ServiceRequestController.php

// index() - Line 45
if ($userRole !== 'customer') {
    return ResponseFormatter::error('This endpoint is for customers only', null, 403);
}

// store() - Line 111
if ($userRole !== 'customer') {
    return ResponseFormatter::error('Only customers can create service requests', null, 403);
}

// show() - No tiene validación de rol específica (accesible por ambos)

// update() - Line 227
if ($userRole !== 'customer') {
    return ResponseFormatter::error('Only customers can update service requests', null, 403);
}

// cancel() - Line 311
if ($userRole !== 'customer') {
    return ResponseFormatter::error('Only customers can cancel service requests', null, 403);
}

// rate() - Line 380
if ($userRole !== 'customer') {
    return ResponseFormatter::error('Only customers can rate service requests', null, 403);
}

// availableForMechanic() - Line 425
if ($userRole !== 'mechanic') {
    return ResponseFormatter::error('This endpoint is for mechanics only', null, 403);
}

// accept() - Line 485
if ($userRole !== 'mechanic') {
    return ResponseFormatter::error('Only mechanics can accept service requests', null, 403);
}

// start() - Line 527
if ($userRole !== 'mechanic') {
    return ResponseFormatter::error('Only mechanics can start service requests', null, 403);
}

// complete() - Line 569
if ($userRole !== 'mechanic') {
    return ResponseFormatter::error('Only mechanics can complete service requests', null, 403);
}

// mechanicIndex() - Line 643
if ($userRole !== 'mechanic') {
    return ResponseFormatter::error('This endpoint is for mechanics only', null, 403);
}
```

**Impacto**:
- ⚠️  Violación principio DRY (Don't Repeat Yourself)
- ⚠️  Mayor superficie para bugs
- ⚠️  Dificulta mantenimiento
- ⚠️  Inconsistente con mejores prácticas MVC
- ⚠️  Si se necesita cambiar lógica, hay que modificar 11 lugares

---

### 2. ⚠️  RBACMiddleware No Utilizado

**Problema**: Existe `RBACMiddleware` funcional pero NO se usa en Service Requests.

**RBACMiddleware Disponible**:
```php
// app/Middleware/RBACMiddleware.php - EXISTE Y FUNCIONA
class RBACMiddleware
{
    private array $allowedRoles;
    
    public function __construct(array $allowedRoles) {
        $this->allowedRoles = $allowedRoles;
        $this->roleValidator = new RoleValidator();
    }
    
    public function handle(Request $request, callable $next): Response {
        // Valida roles automáticamente
        // Retorna 403 si no tiene permiso
    }
}
```

**Por qué no se usa**:
- ⚠️  Routes solo tienen `AuthMiddleware`
- ⚠️  No hay configuración de `RBACMiddleware` en ninguna ruta de Service Requests
- ⚠️  La validación se hace manualmente en controllers

---

### 3. ℹ️ show() Endpoint Inconsistente

**Problema**: El endpoint `show()` NO valida rol explícitamente.

**Código Actual**:
```php
// ServiceRequestController.php - show()
public function show(Request $request, int $id): Response
{
    $userId = $request->getAttribute('userId');
    $userRole = $request->getAttribute('userRole');  // Se obtiene pero NO se valida
    
    $serviceRequest = $this->serviceRequestService->getById($id, $userId, $userRole);
    
    if ($serviceRequest === null) {
        return ResponseFormatter::notFound('Service request not found');
    }
    
    return ResponseFormatter::success(...);
}
```

**Lógica Actual**:
- La validación está en `ServiceRequestService::getById()`
- El service verifica ownership basado en rol
- NO hay validación explícita en controller

**¿Es correcto?**:
- ✅ SÍ - La lógica es correcta
- ✅ SÍ - El service maneja la autorización
- ✅ SÍ - Customers solo ven sus requests, Mechanics solo sus asignados

**Observación**:
- ℹ️  Inconsistente con otros métodos que validan en controller
- ℹ️  Pero arquitectónicamente más correcto (lógica en service)

---

## RECOMENDACIONES

### Opción A: Aplicar RBACMiddleware en Routes (RECOMENDADO)

**Ventajas**:
- ✅ Elimina código duplicado
- ✅ Centraliza autorización
- ✅ Usa middleware existente
- ✅ Más mantenible
- ✅ Consistente con mejores prácticas

**Desventajas**:
- ⚠️  Requiere modificar routes.php
- ⚠️  Requiere eliminar validaciones manuales de controllers

**Implementación**:
```php
// Customer endpoints
$router->get('/api/service-requests', [ServiceRequestController::class, 'index'])
    ->middleware([
        AuthMiddleware::class,
        new RBACMiddleware(['customer'])  // ← AGREGAR
    ])
    ->name('api.service-requests.index');

// Mechanic endpoints
$router->get('/api/mechanic/requests', [ServiceRequestController::class, 'mechanicIndex'])
    ->middleware([
        AuthMiddleware::class,
        new RBACMiddleware(['mechanic'])  // ← AGREGAR
    ])
    ->name('api.mechanic.requests.index');

// show() endpoint - Accesible por customer O mechanic
$router->get('/api/service-requests/{id}', [ServiceRequestController::class, 'show'])
    ->middleware([
        AuthMiddleware::class,
        new RBACMiddleware(['customer', 'mechanic'])  // ← AMBOS
    ])
    ->name('api.service-requests.show');
```

**Cambios en Controller**:
```php
// ELIMINAR validaciones manuales:
// if ($userRole !== 'customer') { ... }

// La validación ya se hace en RBACMiddleware
```

---

### Opción B: Mantener Validaciones Manuales (NO RECOMENDADO)

**Ventajas**:
- ✅ No requiere cambios en routes
- ✅ Validación explícita y visible

**Desventajas**:
- ❌ Código duplicado (11 veces)
- ❌ Mayor superficie de error
- ❌ Difícil de mantener
- ❌ Inconsistente con mejores prácticas

---

## INCONSISTENCIAS CON VEHICLE DOMAIN

### Vehicle Routes
```php
// NO tienen RBACMiddleware configurado
$router->get('/api/vehicles', [VehicleController::class, 'index'])
    ->middleware([AuthMiddleware::class])  // Solo Auth
    ->name('api.vehicles.index');
```

### VehicleController
```php
// NO valida roles manualmente
public function index(Request $request): Response
{
    $userId = $request->getAttribute('userId');
    // No valida $userRole
    
    $vehicles = $this->vehicleService->getUserVehicles($userId);
    return ResponseFormatter::success(...);
}
```

**Observación**:
- ℹ️  Vehicle endpoints confían en ownership checks en service
- ℹ️  NO validan roles explícitamente
- ℹ️  Asumen que cualquier usuario autenticado puede gestionar sus vehículos
- ℹ️  Esto es arquitectónicamente correcto para el dominio de vehículos

**¿Deberían tener RBAC?**:
- ⚠️  Depende de reglas de negocio
- ℹ️  Si solo customers tienen vehículos → Aplicar RBACMiddleware(['customer'])
- ℹ️  Si mechanics también tienen vehículos → Permitir ambos

---

## LÓGICA DUPLICADA DETECTADA

### 1. Error Messages Duplicados

**Patrón Repetido**:
```php
return ResponseFormatter::error(
    'This endpoint is for customers only',  // Mensaje 1
    null,
    403
);

return ResponseFormatter::error(
    'Only customers can create service requests',  // Mensaje 2
    null,
    403
);

return ResponseFormatter::error(
    'Only customers can update service requests',  // Mensaje 3
    null,
    403
);
```

**Observación**:
- ⚠️  3 mensajes diferentes para el mismo error (falta de permiso)
- ⚠️  Inconsistente
- ⚠️  RBACMiddleware usa mensaje estandarizado: "Insufficient permissions"

---

### 2. Validación de userRole

**Patrón Repetido (11 veces)**:
```php
$userRole = $request->getAttribute('userRole');

if ($userRole !== 'customer') {
    return ResponseFormatter::error(..., 403);
}
```

**Solución con RBACMiddleware**:
- ✅ Elimina esta duplicación
- ✅ Validación automática antes de llegar al controller

---

## RUTAS SIN PROTECCIÓN RBAC

### Auth Routes (Correctas)
```php
✅ POST /api/auth/register  - Public (no auth needed)
✅ POST /api/auth/login     - Public (no auth needed)
✅ POST /api/auth/logout    - Auth only (any authenticated user)
✅ GET  /api/auth/me        - Auth only (any authenticated user)
```

**Observación**: Correcto, no necesitan RBAC específico.

---

### Vehicle Routes (Revisar)
```php
⚠️  GET    /api/vehicles           - Auth only
⚠️  POST   /api/vehicles           - Auth only
⚠️  GET    /api/vehicles/{id}      - Auth only
⚠️  PUT    /api/vehicles/{id}      - Auth only
⚠️  DELETE /api/vehicles/{id}      - Auth only
⚠️  PUT    /api/vehicles/{id}/primary - Auth only
```

**Pregunta**: ¿Deberían restringirse a `customer` role?
- ℹ️  Actualmente cualquier usuario autenticado puede gestionar vehículos
- ℹ️  Ownership checks en service previenen acceso a vehículos ajenos
- ⚠️  Mechanics podrían crear vehículos propios (¿es correcto?)

**Recomendación**: 
- Si solo customers deben tener vehículos → Aplicar `RBACMiddleware(['customer'])`
- Si mechanics también pueden tener vehículos → Mantener como está

---

### Service Request Routes (Requiere RBAC)
```php
❌ Todos los endpoints - Solo Auth, sin RBAC configurado
```

**Estado**: CRÍTICO - Necesitan RBACMiddleware

---

## RESUMEN EJECUTIVO

### Problemas Encontrados
1. ❌ CRÍTICO: 11 validaciones manuales duplicadas
2. ⚠️  ALTO: RBACMiddleware no utilizado
3. ⚠️  MEDIO: Mensajes de error inconsistentes
4. ℹ️  BAJO: show() endpoint maneja autorización diferente

### Estado Actual
- ✅ Auth funciona correctamente
- ✅ userRole ahora disponible (Paso 1 completado)
- ❌ RBAC no aplicado en routes
- ⚠️  Código duplicado en controllers

### Recomendación
**APLICAR RBACMiddleware EN ROUTES** (Opción A)

**Beneficios**:
- Elimina 11 bloques de código duplicado
- Centraliza autorización
- Usa infraestructura existente
- Más mantenible
- Consistente con mejores prácticas

**Esfuerzo**: 
- 30 minutos para modificar routes.php
- 15 minutos para limpiar controllers
- 10 minutos para testing

**Riesgo**: BAJO (agregar capa de protección)

---

## PRÓXIMOS PASOS

### Ahora (Paso 2 completado)
- ✅ Análisis de RBAC completado
- ✅ Inconsistencias documentadas
- ℹ️  Esperando aprobación para aplicar RBACMiddleware

### Después (Pasos 3-6)
- Ejecutar migration service_requests
- Ejecutar seeders
- Validar business rules
- Testing completo

---

**FIN DEL ANÁLISIS**
