# ✅ REGISTRO COMPLETO IMPLEMENTADO

## ¿Qué funciona ahora?

El formulario de registro en `http://localhost:5173/register` ahora **guarda TODOS los datos** en la base de datos MySQL:

### Datos Personales (tabla `users`)
✅ **Correo electrónico** → `users.email`  
✅ **Contraseña** → `users.password_hash` (encriptada con bcrypt)  
✅ **Nombre** → `users.first_name`  
✅ **Apellido** → `users.last_name`  
✅ **Teléfono** → `users.phone`  
✅ **Cédula** → `users.id_number` (nuevo campo agregado hoy)  
✅ **Licencia de conducción** → `users.driver_license_number`  

### Datos del Vehículo (tabla `vehicles`)
✅ **Marca** → `vehicles.make`  
✅ **Modelo** → `vehicles.model`  
✅ **Placa** → `vehicles.license_plate`  
✅ **Año** → `vehicles.year`  
✅ **Color** → `vehicles.color`  
✅ **Código SOAT** → `vehicles.soat_number`  
✅ **Código Tecnomecánica** → `vehicles.tecnomecanica_number`  

### Certificación de Mecánico (tabla `users`, solo para rol mechanic)
✅ **Título del certificado** → `users.mechanic_cert_title` (nuevo campo agregado hoy)  
✅ **URL del documento** → `users.mechanic_cert_document_url` (nuevo campo agregado hoy)  

---

## ¿Cómo verificar que los datos se guardaron?

### Opción 1: phpMyAdmin (recomendado)
1. Abre **phpMyAdmin** en tu navegador:  
   `http://localhost/phpmyadmin/`

2. En el panel izquierdo, selecciona la base de datos **`parce`**

3. Haz click en la tabla **`users`** para ver todos los usuarios registrados:
   - Verás las columnas: `id`, `email`, `first_name`, `last_name`, `phone`, `id_number`, `driver_license_number`, `mechanic_cert_title`, etc.

4. Haz click en la tabla **`vehicles`** para ver todos los vehículos registrados:
   - Verás las columnas: `id`, `user_id`, `license_plate`, `make`, `model`, `year`, `color`, `soat_number`, `tecnomecanica_number`, etc.

### Opción 2: Línea de comandos (MySQL)
```bash
cd "C:\Program Files\Ampps\mysql\bin"
.\mysql.exe -u root --password=

USE parce;

# Ver usuarios registrados
SELECT id, email, first_name, last_name, phone, id_number FROM users WHERE deleted_at IS NULL ORDER BY created_at DESC;

# Ver vehículos registrados
SELECT id, user_id, license_plate, make, model, year, color FROM vehicles WHERE deleted_at IS NULL ORDER BY created_at DESC;
```

### Opción 3: Página de perfil (Frontend)
1. Registra un nuevo usuario en `http://localhost:5173/register`
2. Tras el registro automático, el sistema te redirige al home
3. Ve al **perfil** (click en tu avatar arriba a la derecha)
4. Los datos que ingresaste se mostrarán en la página de perfil

---

## Validaciones aplicadas

### ✅ Cédula colombiana
- Solo números
- Entre 6 y 10 dígitos
- Validación en frontend + backend

### ✅ Teléfono colombiano
- Formato: `300 123 4567` (o `+57 300 123 4567`)
- Debe empezar con 3 (celular)
- 10 dígitos totales
- Validación en frontend + backend

### ✅ Placa colombiana
- Formato: `ABC-123` o `ABC123`
- 3 letras + 3 números
- Se convierte automáticamente a mayúsculas
- Validación en frontend + backend

### ✅ Año del vehículo
- Entre 1990 y 2026
- Validación en frontend + backend

---

## Cambios realizados en el backend

### 1. Nueva migración de base de datos
- **Archivo:** `2026_07_25_000017_add_id_and_mechanic_cert_to_users.php`
- **Ejecutada:** ✅ Sí
- **Columnas agregadas:**
  - `users.id_number` → cédula
  - `users.mechanic_cert_title` → título certificación
  - `users.mechanic_cert_document_url` → URL documento certificación
  - `users.mechanic_cert_uploaded_at` → fecha subida

### 2. AuthService extendido
- **Archivo:** `app/Infrastructure/Auth/Services/AuthService.php`
- **Método:** `register()` ahora acepta un array `$additionalData` con todos los campos opcionales
- **Transacción:** Inserta usuario + vehículo + rol + sesión en una sola transacción (rollback si falla cualquier paso)

### 3. AuthController extendido
- **Archivo:** `app/Controllers/Auth/AuthController.php`
- **Método:** `register()` extrae todos los campos del request y los pasa a `AuthService`

### 4. RequestValidator extendido
- **Archivo:** `app/Infrastructure/Http/RequestValidator.php`
- **Método:** `validateRegistrationRequest()` valida cédula, teléfono, placa y año del vehículo

---

## Cambios realizados en el frontend

### 1. RegisterPage.tsx
- **Ubicación:** `src/views/pages/RegisterPage.tsx`
- **Cambios:**
  - Ahora envía **todos los campos** al backend (antes solo email, password, nombre, teléfono)
  - Incluye: cédula, licencia, vehículo completo, SOAT, tecnomecánica, certificación mecánico

### 2. authService.ts
- **Ubicación:** `src/services/authService.ts`
- **Interfaz `RegisterRequest`** extendida con todos los campos opcionales

---

## Flujo completo de registro

1. **Usuario llena el formulario** (5 pasos):
   - Paso 1: Credenciales (email, contraseña)
   - Paso 2: Rol (conductor o mecánico)
   - Paso 3: Datos personales (nombre, apellido, teléfono, cédula, licencia*)
   - Paso 4: Vehículo (marca, modelo, placa, año, color, SOAT, tecnomecánica, licencia**)
   - Paso 5: Certificación (solo mecánicos)

   *La licencia se solicita en paso 3 para USUARIOS, en paso 4 para MECÁNICOS  
   **Los mecánicos ingresan datos de su vehículo de trabajo, los usuarios de su vehículo averiado

2. **Frontend envía todos los datos** a `POST /api/auth/register`

3. **Backend valida** todos los campos (RequestValidator)

4. **Backend guarda** en una transacción:
   - Crea fila en `users`
   - Crea fila en `vehicles` (si se provee)
   - Asigna rol en `user_roles`
   - Crea sesión en `sessions`

5. **Backend devuelve** el perfil completo del usuario + session_id

6. **Frontend redirige** automáticamente:
   - Usuarios → `/home`
   - Mecánicos → `/mechanic-home`

---

## Prueba completa

### Registrar un USUARIO (conductor)
1. Ve a `http://localhost:5173/register`
2. Llena todos los campos:
   - Email: `test@example.com`
   - Contraseña: `Test1234`
   - Rol: **Conductor / Usuario**
   - Nombre: `Juan`
   - Apellido: `García`
   - Teléfono: `300 123 4567`
   - Cédula: `1234567890`
   - Licencia: `LIC-2024-1234`
   - Marca vehículo: `Toyota`
   - Modelo: `Corolla`
   - Placa: `ABC-123`
   - Año: `2020`
   - Color: `Blanco`
   - SOAT: `SOAT-2024-XXXXX`
   - Tecnomecánica: `TM-2024-XXXXX`
3. Click en **Crear cuenta**
4. Verifica en phpMyAdmin → tabla `users` y `vehicles`

### Registrar un MECÁNICO
1. Igual que arriba pero en paso 2 selecciona **Mecánico**
2. En paso 3 **NO** ingresas licencia (la pides en paso 4)
3. En paso 4 ingresas licencia + datos de tu vehículo de trabajo
4. En paso 5 subes certificación de mecánico
5. Click en **Crear cuenta**
6. Verifica en phpMyAdmin → tabla `users` (mechanic_cert_title debe estar lleno)

---

## ⚠️ Pendientes (para versión producción)

### Subida real de archivos
- Actualmente `mechanic_cert_document_url` se llena con el nombre del archivo
- **Falta:** Implementar endpoint para subir PDF/imágenes a storage real (AWS S3, Cloudinary, etc.)

### Fechas de vencimiento
- Los códigos de SOAT y Tecnomecánica se guardan, pero las fechas de vencimiento aún no se calculan
- **Falta:** Agregar campos `soat_expiration_date` y `tecnomecanica_expiration_date` al formulario

### Email de verificación
- Los usuarios se crean con `email_verification_status = 'unverified'`
- **Falta:** Enviar correo de verificación tras registro

---

## 🎉 Resumen

**ANTES:** Solo se guardaba email, contraseña, nombre y teléfono  
**AHORA:** Se guarda TODO el perfil completo (datos personales + vehículo + certificación)

**¡El registro completo está funcional!** 🚀
