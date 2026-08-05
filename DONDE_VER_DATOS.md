# 📍 Dónde ver los datos almacenados

Ahora que **RegisterPage** y **ProfilePage** están conectados a la base de datos real, aquí te explico dónde ver los datos que guardas.

---

## 1️⃣ phpMyAdmin (Visual — Recomendado)

### Acceso
```
URL:      http://localhost/phpmyadmin
Usuario:  root
Password: (dejar vacío, solo presiona Enter)
```

### Cómo ver los datos

1. **Panel izquierdo:** Clic en `parce` (la base de datos)
2. **Verás 10 tablas:**
   - `users` ← Datos de usuarios (nombre, email, teléfono, cédula)
   - `user_roles` ← Relación usuario ↔ rol
   - `roles` ← Roles disponibles (Customer, Mechanic, Administrator)
   - `vehicles` ← Vehículos (placa, marca, modelo, SOAT, tecnomecánica)
   - `service_requests` ← Solicitudes de servicio
   - `service_request_evidences` ← Fotos de evidencias
   - `sessions` ← Sesiones activas de usuarios
   - `pqr` ← PQRs (peticiones, quejas, reclamos)
   - `surveys` ← Encuestas de satisfacción
   - `migrations` ← Control de migraciones ejecutadas

3. **Ver usuarios:** Clic en `users` → pestaña **"Examinar"**
4. **Ver roles:** Clic en `user_roles` → pestaña **"Examinar"** para ver qué rol tiene cada usuario

### Columnas importantes de `users`

| Columna | Qué es |
|---------|--------|
| `id` | ID único del usuario (auto-incrementa) |
| `email` | Correo electrónico (único) |
| `password_hash` | Contraseña encriptada con bcrypt |
| `first_name` | Nombre |
| `last_name` | Apellido |
| `phone` | Teléfono celular |
| `account_status` | Estado: `active`, `inactive`, `suspended` |
| `created_at` | Cuándo se registró |
| `updated_at` | Última modificación |
| `driver_license_number` | Número de licencia de conducción |

### Columnas importantes de `vehicles`

| Columna | Qué es |
|---------|--------|
| `id` | ID único del vehículo |
| `user_id` | ID del dueño (enlaza con `users.id`) |
| `license_plate` | Placa (ej: ABC-123) |
| `brand` | Marca (ej: Toyota) |
| `model` | Modelo (ej: Corolla) |
| `year` | Año |
| `color` | Color |
| `soat_number` | Número de SOAT |
| `soat_expiration_date` | Fecha de vencimiento del SOAT |
| `tecnomecanica_number` | Número de tecnomecánica |
| `tecnomecanica_expiration_date` | Fecha de vencimiento |
| `is_primary` | `1` si es el vehículo principal del usuario |

---

## 2️⃣ Consola MySQL (Línea de comandos)

### Conectar

```powershell
# Abre PowerShell y ejecuta:
cd "C:\Program Files\Ampps\mysql\bin"
.\mysql.exe -u root -p

# Cuando pida password, presiona Enter (está vacío)
```

### Queries útiles

```sql
-- Usar la base de datos
USE parce;

-- Ver todos los usuarios
SELECT id, email, first_name, last_name, phone, created_at 
FROM users 
ORDER BY id DESC;

-- Ver usuarios con sus roles
SELECT u.id, u.email, u.first_name, u.last_name, r.name as role
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id;

-- Ver el último usuario registrado
SELECT * FROM users ORDER BY id DESC LIMIT 1;

-- Ver vehículos
SELECT v.id, v.license_plate, v.brand, v.model, u.email as dueño
FROM vehicles v
JOIN users u ON v.user_id = u.id;

-- Contar usuarios por rol
SELECT r.name as rol, COUNT(*) as cantidad
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
GROUP BY r.name;

-- Ver sesiones activas
SELECT s.id, u.email, s.last_activity_at
FROM sessions s
JOIN users u ON s.user_id = u.id
WHERE s.expires_at > NOW();
```

---

## 3️⃣ Logs del Backend PHP

El backend guarda logs en tiempo real:

```
C:\Program Files\Ampps\www\parce-api\storage\logs\
```

### Archivos de log

- **`database-2026-07-30.log`** — Todas las queries SQL ejecutadas
- **`app-2026-07-30.log`** — Errores de la aplicación
- **`security-2026-07-30.log`** — Intentos de login fallidos, rate limiting

### Ver logs en tiempo real

```powershell
# Ver las últimas líneas del log de base de datos
Get-Content "C:\Program Files\Ampps\www\parce-api\storage\logs\database-2026-07-30.log" -Tail 50

# Ver logs de la app
Get-Content "C:\Program Files\Ampps\www\parce-api\storage\logs\app-2026-07-30.log" -Tail 20
```

---

## 4️⃣ Consola del Navegador (Network tab)

### Ver las peticiones HTTP

1. Abre DevTools (F12)
2. Pestaña **Network**
3. Regístrate o actualiza tu perfil
4. Verás peticiones a:
   - `POST /api/auth/register` → Registro
   - `POST /api/auth/login` → Login automático tras registro
   - `GET /api/auth/me` → Cargar datos del perfil
   - `PUT /api/auth/profile` → Actualizar perfil (cuando lo implementes)

5. **Clic en cualquier petición** → pestaña **Response** para ver qué devolvió el servidor

---

## ✅ Prueba Rápida — Verificar que funciona

### 1. Registra un usuario nuevo

1. Ve a `http://localhost:5173/register`
2. Llena el formulario:
   - Email: `test@example.com`
   - Password: `Test1234`
   - Nombre: `Test`
   - Apellido: `Usuario`
   - Teléfono: `3001234567`
   - Cédula: `1234567890`
   - Placa: `TST-999`
   - etc.
3. Clic en **Crear cuenta**

### 2. Verifica en phpMyAdmin

1. Ve a `http://localhost/phpmyadmin`
2. Clic en `parce` → tabla `users` → **Examinar**
3. **Deberías ver tu usuario nuevo** con email `test@example.com`

### 3. Verifica en MySQL consola

```sql
USE parce;
SELECT * FROM users WHERE email = 'test@example.com';
```

Deberías ver toda la fila con tu información.

---

## 🔍 Qué datos se guardan actualmente

### ✅ Lo que YA se guarda en la BD

| Campo del formulario | Tabla BD | Columna |
|---------------------|----------|---------|
| Email | `users` | `email` |
| Password | `users` | `password_hash` (encriptado) |
| Nombre | `users` | `first_name` |
| Apellido | `users` | `last_name` |
| Teléfono | `users` | `phone` |
| Rol (user/mechanic) | `user_roles` + `roles` | `role_id` |

### ⚠️ Lo que AÚN NO se guarda (TODO)

| Campo del formulario | Estado |
|---------------------|--------|
| Cédula | ❌ El backend aún no tiene columna para esto |
| Licencia de conducción | ❌ Existe la columna `driver_license_number` pero no se envía |
| Placa del vehículo | ❌ Requiere endpoint `/api/vehicles` POST |
| Marca/Modelo/Año | ❌ Requiere endpoint `/api/vehicles` POST |
| SOAT / Tecnomecánica | ❌ Requiere endpoint `/api/vehicles` POST |
| Certificación mecánico | ❌ Requiere endpoint de upload de archivos |

**Nota:** El frontend ya captura todos estos datos y los valida, pero el backend aún no tiene endpoints para recibirlos. Se guardarán cuando amplíe el endpoint `/api/auth/register` o agregue `/api/vehicles`.

---

## 🚀 Siguiente paso

Si quieres que **todos** los campos del formulario se guarden (cédula, placa, SOAT, etc.), avísame y extiendo el endpoint `/api/auth/register` del backend PHP para recibirlos.

Por ahora, lo mínimo funciona: **email, nombre, teléfono, rol** → se guardan en MySQL y puedes verlos en phpMyAdmin.
