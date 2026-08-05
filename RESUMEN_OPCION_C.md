# ✅ Opción C Completada — Registro + Perfil Conectados a BD Real

## 🎯 Lo que funciona ahora

### ✅ Login
- **Ruta:** `/login`
- **Conectado al API:** `POST /api/auth/login`
- **Guarda en BD:** Crea sesión en tabla `sessions`
- **Credenciales de prueba:** Ver `CREDENCIALES.md`

### ✅ Registro (RegisterPage)
- **Ruta:** `/register`
- **Conectado al API:** `POST /api/auth/register`
- **Guarda en BD:**
  - Tabla `users`: email, password_hash, first_name, last_name, phone
  - Tabla `user_roles`: asigna rol Customer o Mechanic
  - Tabla `sessions`: login automático tras registro
- **Flujo:**
  1. Usuario llena formulario completo
  2. Al hacer clic en "Crear cuenta", envía petición al backend PHP
  3. Backend valida email único, crea usuario, hashea password
  4. Backend asigna rol según si eligió "Usuario" o "Mecánico"
  5. Backend crea sesión automáticamente
  6. Frontend hace login automático y redirige a `/home` o `/mechanic-home`

### ✅ Perfil (ProfilePage)
- **Ruta:** `/profile`
- **Conectado al API:** `GET /api/auth/me`
- **Carga datos reales de BD:**
  - Nombre completo (first_name + last_name)
  - Email
  - Teléfono
  - Foto de perfil (si existe)
- **Estado:** Carga datos al montar el componente
- **Guardar cambios:** Aún no implementado (TODO: endpoint `PUT /api/auth/profile`)

### ✅ Logout
- **Conectado al API:** `POST /api/auth/logout`
- **Destruye sesión en BD**

---

## 📊 Datos que se guardan en MySQL

### Tabla `users`
| Columna | Valor del formulario | Ejemplo |
|---------|---------------------|---------|
| `id` | Auto-incrementa | 8 |
| `email` | Campo "Correo electrónico" | `nuevo@example.com` |
| `password_hash` | Campo "Contraseña" (encriptado bcrypt) | `$2y$10$...` |
| `first_name` | Campo "Nombre" | `Juan` |
| `last_name` | Campo "Apellido" | `Pérez` |
| `phone` | Campo "Teléfono celular" | `3001234567` |
| `account_status` | Por defecto | `active` |
| `created_at` | Timestamp automático | `2026-07-30 01:00:00` |

### Tabla `user_roles`
| Columna | Valor |
|---------|-------|
| `user_id` | ID del usuario recién creado |
| `role_id` | 2 (Customer) o 3 (Mechanic) según elección |

### Tabla `sessions`
| Columna | Valor |
|---------|-------|
| `id` | ID de sesión (cookie PHP) |
| `user_id` | ID del usuario |
| `ip_address` | IP del cliente |
| `user_agent` | Navegador |
| `last_activity_at` | Timestamp última actividad |

---

## 🔍 Dónde ver los datos guardados

### 1️⃣ phpMyAdmin (Recomendado)
```
URL: http://localhost/phpmyadmin
Usuario: root
Password: (vacío)
```

**Pasos:**
1. Clic en `parce` en el panel izquierdo
2. Clic en tabla `users`
3. Pestaña **"Examinar"**
4. **Verás todos los usuarios registrados**

### 2️⃣ MySQL Consola
```powershell
cd "C:\Program Files\Ampps\mysql\bin"
.\mysql.exe -u root -p
# Password: Enter (vacío)

USE parce;
SELECT id, email, first_name, last_name, phone, created_at FROM users ORDER BY id DESC LIMIT 5;
```

### 3️⃣ DevTools del navegador
1. F12 → pestaña **Network**
2. Regístrate
3. Verás petición `POST /api/auth/register` con status 200
4. Clic en la petición → pestaña **Response** para ver la respuesta del servidor

---

## ⚠️ Campos que AÚN NO se guardan

El formulario de registro captura **todos** estos datos, pero el backend aún no tiene endpoints para recibirlos:

| Campo del formulario | Estado |
|---------------------|--------|
| Cédula | ❌ Frontend captura, backend no tiene columna |
| Licencia de conducción | ❌ Columna existe (`driver_license_number`) pero endpoint no la recibe |
| Placa del vehículo | ❌ Requiere `POST /api/vehicles` |
| Marca/Modelo/Año/Color | ❌ Requiere `POST /api/vehicles` |
| SOAT / Tecnomecánica | ❌ Requiere `POST /api/vehicles` |
| Certificación mecánico (archivo) | ❌ Requiere endpoint de upload |

**Nota:** Estos campos se validarán en el frontend (ya lo hacen) pero no llegarán al servidor hasta que extiendas el backend.

---

## 🚀 Cómo probar

### 1. Asegúrate de que todo esté corriendo

**Terminal 1 — Backend PHP:**
```powershell
cd "C:\Program Files\Ampps\www\parce-api"
& "C:\Program Files\Ampps\php\php.exe" -S localhost:8000 -t public public/router.php
```

**Terminal 2 — Frontend Vite:**
```powershell
cd C:\Users\APRENDIZ\PARCE
npm run dev
```

### 2. Registra un usuario nuevo

1. Abre `http://localhost:5173/register`
2. Llena el formulario:
   - Email: `test123@example.com`
   - Password: `Test1234`
   - Confirmar: `Test1234`
   - Clic "Siguiente"
   - Elige: **"Conductor / Usuario"**
   - Nombre: `Pedro`
   - Apellido: `Gómez`
   - Teléfono: `3009876543`
   - Cédula: `987654321`
   - Licencia: `LC-2024-001`
   - Clic "Siguiente"
   - Placa: `TST-777`
   - Marca: `Mazda`
   - Modelo: `3`
   - Año: `2022`
   - Color: `Rojo`
   - SOAT: `SOAT-2024-12345`
   - Tecnomecánica: `TM-2024-67890`
   - Clic **"Crear cuenta"**

3. **Deberías ser redirigido automáticamente a `/home`**

### 3. Verifica en phpMyAdmin

1. Ve a `http://localhost/phpmyadmin`
2. Base de datos `parce` → tabla `users` → **Examinar**
3. **Deberías ver tu usuario nuevo:**
   - Email: `test123@example.com`
   - Nombre: `Pedro`
   - Apellido: `Gómez`
   - Teléfono: `3009876543`

4. Tabla `user_roles` → **Examinar**
5. **Deberías ver una fila con:**
   - `user_id`: (el ID de tu usuario)
   - `role_id`: `2` (Customer)

### 4. Verifica el perfil

1. Ya logueado, ve a `/profile`
2. **Deberías ver tus datos cargados automáticamente:**
   - Nombre: `Pedro Gómez`
   - Email: `test123@example.com`
   - Teléfono: `3009876543`

---

## 🐛 Si algo no funciona

### Error: "Email already exists"
- Ya existe un usuario con ese email
- Usa otro email o borra el usuario en phpMyAdmin

### Error: "Error de conexión"
- Verifica que el backend PHP esté corriendo en `localhost:8000`
- Prueba: `curl http://localhost:8000/api/auth/health`

### El registro no guarda nada
- Abre DevTools (F12) → Network
- Busca la petición `POST /api/auth/register`
- Si no aparece: el frontend no está enviando la petición
- Si aparece con 500: el backend tiene un error (revisa logs en `C:\Program Files\Ampps\www\parce-api\storage\logs\`)

### El perfil no carga datos
- Verifica que estés logueado (debería haber una cookie `parce_session`)
- Abre DevTools → Application → Cookies → `http://localhost:5173`
- Debería haber una cookie con nombre `parce_session`

---

## 📝 Próximos pasos sugeridos

### A corto plazo (backend PHP)
1. Extender `POST /api/auth/register` para recibir cédula, licencia, vehículo
2. Crear `PUT /api/auth/profile` para actualizar datos del usuario
3. Crear `PUT /api/auth/password` para cambiar contraseña
4. Crear `POST /api/vehicles` para registrar vehículos

### A mediano plazo (frontend + backend)
5. Conectar AdminUsersPage al CRUD real (`GET/POST/PUT/DELETE /api/admin/users`)
6. Conectar AdminMechanicsPage igual
7. Conectar AdminVehiclesPage igual
8. Conectar módulo de servicios (`/api/service-requests`)
9. Conectar módulo de pagos

---

## ✅ Resumen

**Lo que YA funciona con datos reales:**
- ✅ Login → lee de MySQL
- ✅ Logout → destruye sesión en MySQL
- ✅ Registro → guarda usuario + rol en MySQL
- ✅ Perfil → carga datos desde MySQL

**Lo que FALTA:**
- ❌ Guardar campos adicionales del registro (cédula, vehículo, etc.)
- ❌ Actualizar perfil (guardar cambios)
- ❌ CRUD admin (usuarios, mecánicos, vehículos)
- ❌ Servicios, pagos, PQR

**Archivos modificados (TODO LOCAL, nada en git):**
- `src/views/pages/RegisterPage.tsx` → conectado a API
- `src/views/pages/LoginPage.tsx` → conectado a API
- `src/views/pages/ProfilePage.tsx` → carga datos reales
- `src/controllers/AuthContext.tsx` → maneja sesión real
- `src/services/authService.ts` → cliente del API PHP
- `src/services/apiClient.ts` → fetch con credentials
- `src/config/api.ts` → endpoints
- `vite.config.ts` → proxy /api → localhost:8000

---

¿Quieres que conecte algún otro módulo o te explico algo específico? 🚀
