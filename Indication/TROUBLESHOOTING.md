# 🔧 TROUBLESHOOTING - Problemas Comunes

## ❌ "El usuario no aparece en phpMyAdmin después del registro"

### Posibles causas:

#### 1. **Error en el formulario de registro**
**Síntomas:**
- Haces click en "Crear cuenta" pero no pasa nada
- No te redirige al home
- No aparece mensaje de error

**Solución:**
1. Abre la consola del navegador (F12)
2. Ve a la pestaña "Network" o "Red"
3. Haz click en "Crear cuenta" de nuevo
4. Busca la llamada a `/api/auth/register`
5. Click en esa llamada → ve a "Response" o "Respuesta"
6. Copia el mensaje de error y envíamelo

---

#### 2. **Backend no está corriendo**
**Síntomas:**
- Error: "Error de conexión"
- En la consola: "Failed to fetch"

**Solución:**
```bash
# Reinicia el backend
cd "C:\Program Files\Ampps\www\parce-api"
php -S localhost:8000 -t public public/router.php
```

Verifica que muestre:
```
PHP 8.2.31 Development Server (http://localhost:8000) started
```

---

#### 3. **Problema con CORS**
**Síntomas:**
- Error: "CORS policy"
- Error: "Access-Control-Allow-Origin"

**Solución:**
Verifica que el archivo `.env` del backend tenga:
```
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
```

---

#### 4. **Formato JSON inválido**
**Síntomas:**
- Error 400: "Invalid JSON format"

**Solución:**
El problema está en cómo se envían los datos. Revisa que el `RegisterPage.tsx` esté enviando correctamente todos los campos.

---

## 🔍 Cómo debuggear paso a paso:

### 1. Verifica que el backend funciona:
```
http://localhost:8000/api/auth/health
```
Debe mostrar: `{"success":true,"data":{"status":"healthy"...}}`

### 2. Verifica que el frontend está corriendo:
```
http://localhost:5173
```
Debe cargar la página de login

### 3. Intenta registrarte con estos datos de prueba:
```
Email: test@example.com
Contraseña: Test1234
Nombre: Juan
Apellido: Pérez  
Teléfono: 300 123 4567
Cédula: 1234567890
Licencia: LIC-2024-001
Marca: Toyota
Modelo: Corolla
Placa: ABC-123
Año: 2020
Color: Blanco
SOAT: SOAT-2024-001
Tecnomecánica: TM-2024-001
```

### 4. Si sigue sin funcionar:
1. Abre consola (F12)
2. Ve a "Console" → copia todos los errores rojos
3. Ve a "Network" → busca `/api/auth/register` → copia la respuesta
4. Envíame esa información

---

## 📊 Comandos útiles para verificar:

### Ver usuarios en MySQL:
```sql
USE parce;
SELECT id, email, first_name, last_name, created_at FROM users ORDER BY created_at DESC;
```

### Ver logs del servidor PHP:
Mira la terminal donde corre el servidor PHP, verás:
```
[timestamp] Authentication successful: User X (email) logged in from IP
```
O errores si algo falla.

### Reiniciar todo desde cero:
```bash
# 1. Detener backend
Stop-Process -Name php -Force

# 2. Reiniciar backend
cd "C:\Program Files\Ampps\www\parce-api"
php -S localhost:8000 -t public public/router.php

# 3. Frontend ya debe estar corriendo en localhost:5173
```

---

## 🆘 Si nada funciona:

Envíame:
1. Captura de pantalla del formulario de registro lleno
2. Captura de pantalla de la consola del navegador (F12)
3. Texto del error que aparece

Y lo arreglaremos juntos 🚀
