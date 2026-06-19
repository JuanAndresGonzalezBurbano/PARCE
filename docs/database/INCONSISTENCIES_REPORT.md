# 🚨 REPORTE DE INCONSISTENCIAS - P.A.R.C.E BACKEND

**Fecha**: 2024
**Estado**: Análisis completo del backend actual

---

## 1. ❌ CRÍTICO: Service Request Domain Incompleto

### Problema
La migración `2024_01_01_000004_create_service_requests_table.php` **NO ha sido ejecutada**.

### Impacto
- ❌ Tabla `service_requests` NO existe en la base de datos
- ❌ Todos los endpoints de Service Requests fallarán con errores SQL
- ❌ ServiceRequestController NO funcional
- ❌ ServiceRequestService NO funcional
- ❌ Seeder de service_requests NO puede ejecutarse
- ❌ **BLOQUEA completamente el flujo de Service Requests**

### Solución Requerida
```bash
php migrate.php migrate
```

### Archivos Afectados
- `database/migrations/2024_01_01_000004_create_service_requests_table.php`
- `app/Controllers/ServiceRequestController.php`
- `app/Infrastructure/ServiceRequest/ServiceRequestService.php`
- `database/seeders/ServiceRequestsSeeder.php`

---

## 2. ❌ CRÍTICO: `userRole` Attribute No Establecido

### Problema
`ServiceRequestController` usa `$request->getAttribute('userRole')` en 12 ubicaciones diferentes, pero **AuthMiddleware NO establece este atributo**.

### Ubicaciones del Bug
```php
// ServiceRequestController.php
Line 42:  $userRole = $request->getAttribute('userRole');  // NULL
Line 108: $userRole = $request->getAttribute('userRole');  // NULL
Line 164: $userRole = $request->getAttribute('userRole');  // NULL
Line 224: $userRole = $request->getAttribute('userRole');  // NULL
Line 308: $userRole = $request->getAttribute('userRole');  // NULL
Line 377: $userRole = $request->getAttribute('userRole');  // NULL
Line 422: $userRole = $request->getAttribute('userRole');  // NULL
Line 482: $userRole = $request->getAttribute('userRole');  // NULL
Line 524: $userRole = $request->getAttribute('userRole');  // NULL
Line 566: $userRole = $request->getAttribute('userRole');  // NULL
Line 640: $userRole = $request->getAttribute('userRole');  // NULL
```

### Atributos que SÍ Establece AuthMiddleware
```php
// AuthMiddleware.php - Lines 98-100
$request->setAttribute('session', $sessionData);
$request->setAttribute('user', $user);
$request->setAttribute('userId', (int)$user['id']);
// ❌ NO establece 'userRole'
```

### Impacto
- ❌ `$userRole` será siempre `NULL`
- ❌ Todas las verificaciones de rol fallarán
- ❌ Controllers permitirán acceso no autorizado
- ❌ Clientes podrán acceder a endpoints de mechanics
- ❌ Mechanics podrán acceder a endpoints de clientes
- ❌ **FALLA TOTAL DE RBAC en Service Requests**

### Solución Propuesta
**Opción A**: Modificar AuthMiddleware para establecer `userRole`
```php
// AuthMiddleware.php - Agregar después de línea 100
$roles = $this->roleValidator->getUserRoles((int)$user['id']);
$primaryRole = !empty($roles) ? $roles[0] : 'customer'; // Primer rol como principal
$request->setAttribute('userRole', $primaryRole);
```

**Opción B**: Modificar ServiceRequestController para obtener roles directamente
```php
// En cada método del controller
$roles = $this->roleValidator->getUserRoles($userId);
$userRole = !empty($roles) ? $roles[0] : 'customer';
```

**Recomendación**: **Opción A** - Centralizar en AuthMiddleware

### Archivos Afectados
- `app/Middleware/AuthMiddleware.php` (necesita modificación)
- `app/Controllers/ServiceRequestController.php` (usa el atributo faltante)

---

## 3. ⚠️  ARQUITECTURA: RBAC No Configurado en Routes

### Problema
Las rutas de Service Requests tienen `AuthMiddleware` pero **NO tienen `RBACMiddleware`**.

### Situación Actual
```php
// config/routes.php
$router->get('/api/service-requests', [ServiceRequestController::class, 'index'])
    ->middleware([AuthMiddleware::class])  // ✓ Auth protegido
    ->name('api.service-requests.index');   // ❌ Sin RBAC
```

### Impacto
- ⚠️  La verificación de roles se hace **manualmente** en cada método del controller
- ⚠️  Código duplicado en múltiples lugares
- ⚠️  Mayor superficie de error
- ⚠️  Inconsistente con mejores prácticas

### Solución Propuesta
```php
// Aplicar RBACMiddleware a nivel de ruta
$router->get('/api/service-requests', [ServiceRequestController::class, 'index'])
    ->middleware([
        AuthMiddleware::class,
        new RBACMiddleware(['customer'])  // Solo customers
    ])
    ->name('api.service-requests.index');
```

### Archivos Afectados
- `config/routes.php` (12 rutas de service requests)
- `app/Controllers/ServiceRequestController.php` (código duplicado puede eliminarse)

---

## 4. ⚠️  INCONSISTENCIA: getUserRoles() vs userRole

### Problema
Naming inconsistency entre:
- `RoleValidator::getUserRoles()` → Devuelve **array** de strings
- `$request->getAttribute('userRole')` → Se espera **string** singular

### Ubicaciones
```php
// RoleValidator.php
public function getUserRoles(int $userId): array  // PLURAL, array

// ServiceRequestController.php
$userRole = $request->getAttribute('userRole');   // SINGULAR, string
```

### Impacto
- ⚠️  Confusión en el código
- ⚠️  Necesita lógica para extraer rol principal de array
- ⚠️  No hay convención clara para usuarios con múltiples roles

### Solución Propuesta
**Decidir estrategia para múltiples roles:**

**Opción 1**: Usar primer rol como principal
```php
$roles = $this->roleValidator->getUserRoles($userId);
$userRole = $roles[0] ?? 'customer';
```

**Opción 2**: Usar rol más privilegiado
```php
$rolePriority = ['super_admin', 'administrator', 'mechanic', 'customer', 'support'];
$roles = $this->roleValidator->getUserRoles($userId);
foreach ($rolePriority as $role) {
    if (in_array($role, $roles)) {
        return $role;
    }
}
```

**Opción 3**: Requerir rol único por usuario
```php
// Validar que usuario tenga exactamente 1 rol activo
```

---

## 5. ⚠️  ARQUITECTURA: ENUMs en Migraciones Antiguas

### Problema
Las migraciones antiguas usan `ENUM` pero las especificaciones indicaron **NO usar ENUMs**.

### ENUMs Detectados
```sql
-- users table
account_status ENUM('active', 'suspended', 'deactivated', 'pending_verification')
email_verification_status ENUM('unverified', 'verified')
phone_verification_status ENUM('unverified', 'verified')

-- admin_access_requests table
status ENUM('pending', 'approved', 'rejected', 'cancelled')
```

### Migraciones Nuevas (Correctas)
```sql
-- vehicles table
status VARCHAR(20) NOT NULL DEFAULT 'active'  // ✓ Correcto

-- service_requests table (pendiente)
status VARCHAR(20) NOT NULL DEFAULT 'pending'  // ✓ Correcto
```

### Impacto
- ⚠️  Inconsistencia arquitectónica
- ⚠️  Dificulta agregar nuevos estados en producción
- ⚠️  ENUMs requieren ALTER TABLE para modificar

### Solución
**NO corregir ahora** - Las tablas con ENUM ya están en producción y funcionan.
- ✅ Mantener ENUMs en `users` y `admin_access_requests`
- ✅ Usar VARCHAR en todas las tablas nuevas
- ✅ Documentar la inconsistencia

---

## 6. ⚠️  CÓDIGO DUPLICADO: Validaciones de Rol Manual

### Problema
ServiceRequestController repite la misma lógica de verificación de rol en múltiples métodos.

### Código Duplicado (12 veces)
```php
// Patrón repetido en: index(), store(), show(), update(), cancel(), rate(), etc.
if ($userRole !== 'customer') {
    return ResponseFormatter::error(
        'This endpoint is for customers only',
        null,
        403
    );
}
```

### Impacto
- ⚠️  Violación DRY (Don't Repeat Yourself)
- ⚠️  Mayor superficie para bugs
- ⚠️  Dificulta mantenimiento

### Solución
Usar `RBACMiddleware` en routes (ver #3)

---

## 7. ℹ️ INFO: Imports No Utilizados

### Problema Menor
Algunos archivos pueden tener imports no utilizados.

### Impacto
- ℹ️  Mínimo - No afecta funcionalidad
- ℹ️  Aumenta ligeramente el tamaño del código

### Solución
Limpiar cuando se hagan otras modificaciones.

---

## 8. ℹ️ INFO: Archivo Extraño en Raíz

### Problema
Archivo `-w` en la raíz del proyecto sin contenido conocido.

### Solución
```bash
rm -w  # Eliminar si no es necesario
```

---

## RESUMEN EJECUTIVO

### 🔴 CRÍTICO (Bloquea funcionalidad)
1. ❌ Migration service_requests NO ejecutada
2. ❌ userRole attribute faltante en AuthMiddleware

### 🟡 ALTO (Afecta arquitectura)
3. ⚠️  RBAC no configurado en routes
4. ⚠️  getUserRoles() vs userRole inconsistency

### 🟠 MEDIO (Deuda técnica)
5. ⚠️  ENUMs en tablas antiguas vs VARCHAR en nuevas
6. ⚠️  Código duplicado en validaciones

### 🟢 BAJO (Cosmético)
7. ℹ️  Imports no utilizados
8. ℹ️  Archivo `-w` extraño

---

## ORDEN DE CORRECCIÓN RECOMENDADO

1. **PRIMERO**: Ejecutar migration service_requests
   ```bash
   php migrate.php migrate
   ```

2. **SEGUNDO**: Corregir AuthMiddleware para establecer `userRole`
   - Modificar `app/Middleware/AuthMiddleware.php`
   - Agregar líneas para establecer `$request->setAttribute('userRole', $primaryRole)`

3. **TERCERO**: Ejecutar seeders
   ```bash
   php database/seed.php
   ```

4. **CUARTO**: Validar Service Request Domain
   ```bash
   php validate_service_requests.php
   ```

5. **QUINTO** (Opcional): Refactor RBAC en routes
   - Configurar RBACMiddleware en `config/routes.php`
   - Eliminar validaciones manuales de controllers

6. **SEXTO** (Opcional): Documentar estrategia de múltiples roles

---

## BLOQUEOS ACTUALES

### Para Continuar Desarrollo:
✅ Vehicles Domain - **LISTO**
❌ Service Requests Domain - **BLOQUEADO** (necesita migration + userRole fix)
❌ Frontend Integration - **BLOQUEADO** (Service Requests no funcional)

### Para Testing:
✅ Auth endpoints - **LISTO**
✅ Vehicle endpoints - **LISTO**
❌ Service Request endpoints - **BLOQUEADO**

---

**FIN DEL REPORTE**
