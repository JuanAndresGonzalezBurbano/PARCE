# RBAC Fix Plan - Service Request Routes

## Estado Actual

### ✅ AuthMiddleware 
- **COMPLETO**: Ya implementa `userRole` y `userRoles`
- Jerarquía de roles correcta: super_admin > administrator > mechanic > customer > support
- Compatible con código existente

### ❌ Rutas sin RBAC
Las siguientes rutas tienen **AuthMiddleware** pero NO tienen **RBACMiddleware**:

#### Customer Endpoints (deben permitir SOLO 'customer')
1. `GET /api/service-requests` - index
2. `POST /api/service-requests` - store
3. `GET /api/service-requests/{id}` - show
4. `PUT /api/service-requests/{id}` - update
5. `POST /api/service-requests/{id}/cancel` - cancel
6. `POST /api/service-requests/{id}/rate` - rate

#### Mechanic Endpoints (deben permitir SOLO 'mechanic')
7. `GET /api/mechanic/requests` - mechanicIndex
8. `GET /api/mechanic/requests/available` - availableForMechanic
9. `POST /api/mechanic/requests/{id}/accept` - accept
10. `PUT /api/mechanic/requests/{id}/start` - start
11. `PUT /api/mechanic/requests/{id}/complete` - complete

### 🔍 Validaciones Manuales Duplicadas
`ServiceRequestController` contiene 11 validaciones manuales repetidas:

```php
if ($userRole !== 'customer') {
    return ResponseFormatter::error('This endpoint is for customers only', null, 403);
}
```

Estas validaciones deben **removerse** después de aplicar RBACMiddleware.

---

## Plan de Corrección

### Paso 1: Aplicar RBACMiddleware a Rutas

**Archivo**: `config/routes.php`

#### Customer Routes
```php
// Customer endpoints - ONLY customers
$router->get('/api/service-requests', [\App\Controllers\ServiceRequestController::class, 'index'])
    ->middleware([
        \App\Middleware\AuthMiddleware::class,
        [\App\Middleware\RBACMiddleware::class, ['customer']]
    ])
    ->name('api.service-requests.index');

$router->post('/api/service-requests', [\App\Controllers\ServiceRequestController::class, 'store'])
    ->middleware([
        \App\Middleware\AuthMiddleware::class,
        [\App\Middleware\RBACMiddleware::class, ['customer']]
    ])
    ->name('api.service-requests.store');

// ... (repetir para show, update, cancel, rate)
```

#### Mechanic Routes
```php
// Mechanic endpoints - ONLY mechanics
$router->get('/api/mechanic/requests', [\App\Controllers\ServiceRequestController::class, 'mechanicIndex'])
    ->middleware([
        \App\Middleware\AuthMiddleware::class,
        [\App\Middleware\RBACMiddleware::class, ['mechanic']]
    ])
    ->name('api.mechanic.requests.index');

// ... (repetir para available, accept, start, complete)
```

### Paso 2: Remover Validaciones Manuales

**Archivo**: `app/Controllers/ServiceRequestController.php`

Remover las 11 instancias de:
```php
// REMOVER ESTO (líneas aproximadas: 45, 85, 125, 165, 205, 245, 285, 325, 365, 405, 445)
if ($userRole !== 'customer') {
    return ResponseFormatter::error('This endpoint is for customers only', null, 403);
}

// REMOVER ESTO (en mechanic endpoints)
if ($userRole !== 'mechanic') {
    return ResponseFormatter::error('This endpoint is for mechanics only', null, 403);
}
```

**Justificación**: RBACMiddleware ya valida roles antes de que el controller se ejecute.

### Paso 3: Validar Sintaxis
```bash
php -l config/routes.php
php -l app/Controllers/ServiceRequestController.php
```

### Paso 4: Validación Funcional
- Verificar que customers NO puedan acceder a `/api/mechanic/*`
- Verificar que mechanics NO puedan acceder a `/api/service-requests` (customer routes)
- Confirmar que Vehicle Domain sigue funcionando (no tiene RBAC, solo AuthMiddleware)

---

## Rutas NO Afectadas (mantener como están)

### Vehicle Routes (SIN RBAC)
- Actualmente tienen SOLO `AuthMiddleware`
- Implementan ownership check dentro del controller
- **NO MODIFICAR** - funcionan correctamente

### Auth Routes
- Public routes: register, login (sin middleware)
- Protected routes: logout, me (solo AuthMiddleware)
- **NO MODIFICAR**

---

## Beneficios Esperados

1. ✅ **Seguridad mejorada**: RBAC centralizado en middleware
2. ✅ **Código limpio**: 11 validaciones manuales eliminadas
3. ✅ **Consistencia**: Todos los endpoints protegidos uniformemente
4. ✅ **Mantenibilidad**: Cambios de roles en un solo lugar (routes.php)
5. ✅ **Compatibilidad**: Vehicle Domain no afectado

---

## Riesgos y Mitigaciones

### Riesgo 1: Breaking Change en Service Request Domain
**Mitigación**: Las validaciones manuales se remueven DESPUÉS de aplicar RBAC en rutas

### Riesgo 2: Afectar Vehicle Domain
**Mitigación**: NO tocar rutas de vehicles - ya funcionan correctamente

### Riesgo 3: Errores de sintaxis en routes.php
**Mitigación**: Validar sintaxis con `php -l` antes de ejecutar

---

## Siguiente Fase: Response Standardization

Después de RBAC fix, estandarizar respuestas JSON en controllers:
- AuthController
- VehicleController  
- ServiceRequestController

Formato estándar:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```
