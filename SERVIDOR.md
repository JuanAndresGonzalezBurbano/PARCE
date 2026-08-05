# Guía de Servidores - PARCE

Este documento explica cómo iniciar los dos servidores necesarios y cómo resolver problemas comunes.

## 📋 Requisitos Previos

- **PHP 8.0+** (con extensiones: pdo, pdo_mysql, json)
- **Node.js 16+** y npm
- **MySQL 5.7+** corriendo en `localhost` sin contraseña (usuario `root`)
- Base de datos `parce` ya creada

## 🚀 Iniciar Servidores

### 1. Backend PHP (Puerto 8000)

En PowerShell, ejecuta:

```powershell
cd c:\Users\juans\PARCE
php -S localhost:8000
```

✅ Debería ver:
```
Development Server (http://localhost:8000)
Listening on http://localhost:8000
Press Ctrl-C to quit
```

**Verificar que funciona:**
- Abre en navegador: `http://localhost:8000/api/test`
- Debería devolver: `{"success":true,"data":{"message":"Test OK"}}`

---

### 2. Frontend React (Puerto 5173)

En otra ventana de PowerShell, ejecuta:

```powershell
cd c:\Users\juans\PARCE
npm run dev
```

✅ Debería ver:
```
  VITE v... ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

**Verificar que funciona:**
- Abre en navegador: `http://localhost:5173`
- Debería cargar la página de login

---

## 🔑 Credenciales de Prueba

| Rol | Email | Contraseña |
|-----|-------|-----------|
| Admin | `admin.demo@parcedemo.local` | `Demo12345` |
| Mecánico | `mecanico.demo@parcedemo.local` | `Demo12345` |
| Cliente | `cliente.demo@parcedemo.local` | `Demo12345` |

---

## 🔧 Solucionar Problemas

### Backend PHP se cae o no responde

**Problema:** Backend en puerto 8000 no responde o muestra error

**Solución:**

```powershell
# 1. Verificar que PHP está funcionando
php -v

# 2. Verificar que el puerto 8000 está disponible
netstat -ano | findstr :8000

# 3. Si algo está usando el puerto, matar el proceso
# Reemplaza 12345 con el PID mostrado arriba
taskkill /PID 12345 /F

# 4. Reiniciar el servidor PHP
cd c:\Users\juans\PARCE
php -S localhost:8000
```

**Si aún así falla:**

```powershell
# Probar en otro puerto
php -S localhost:8001

# Y en el frontend, actualizar vite.config.ts
# Cambiar 'target': 'http://localhost:8000' por 'http://localhost:8001'
```

---

### Frontend no carga o muestra errores de proxy

**Problema:** Frontend muestra errores 404 al llamar a `/api/...`

**Solución:**

```powershell
# 1. Verificar que el backend está corriendo en puerto 8000
# Ir a http://localhost:8000/api/test en navegador

# 2. Limpiar cache y node_modules
cd c:\Users\juans\PARCE
rmdir /s /q node_modules
npm install

# 3. Reiniciar Vite
# Presionar Ctrl+C en la ventana de Vite
# Luego ejecutar nuevamente
npm run dev
```

---

### Base de datos no conecta

**Problema:** Backend muestra "Error conectando a base de datos"

**Solución:**

```powershell
# 1. Verificar que MySQL está corriendo
# Ir a Servicios de Windows y buscar MySQL
# O desde PowerShell:
Get-Service | findstr MySQL

# 2. Verificar credenciales en .env
# Abrir c:\Users\juans\PARCE\.env
# Debe tener:
# DB_HOST=localhost
# DB_USER=root
# DB_PASS=
# DB_NAME=parce

# 3. Si la BD no existe, crear:
mysql -u root
CREATE DATABASE parce;
EXIT;

# 4. Ejecutar migraciones desde PHP
cd c:\Users\juans\PARCE
php public/index.php migrate:run
```

---

### Errores de autenticación (login no funciona)

**Problema:** No puede iniciar sesión o roles incorrectos

**Solución:**

```powershell
# 1. Verificar que la tabla users tiene datos
mysql -u root parce
SELECT id, email, account_status FROM users;
EXIT;

# 2. Si está vacía, ejecutar seeders
cd c:\Users\juans\PARCE
php public/index.php seed:run

# 3. Limpiar cookies del navegador
# Abrir DevTools (F12) → Application → Cookies → Delete all

# 4. Reiniciar ambos servidores
```

---

## 📊 Estructura del Proyecto

```
c:\Users\juans\PARCE\
├── app/                    # Backend PHP
│   ├── Controllers/        # Controladores (HTTP requests)
│   ├── Core/              # Núcleo de framework
│   ├── Infrastructure/    # Servicios y DTOs
│   └── Middleware/        # Auth, CORS, Rate Limiter, etc
├── config/                # Configuración (rutas, BD)
├── database/              # Migraciones y seeders
├── public/                # Entry point del backend
├── src/                   # Frontend React/TypeScript
│   ├── controllers/       # Context (Redux-like)
│   ├── services/          # API calls, business logic
│   ├── views/
│   │   ├── components/    # Componentes reutilizables
│   │   └── pages/         # Páginas principales
│   └── config/            # Configuración frontend
├── .env                   # Variables de entorno
├── composer.json          # Backend dependencies
└── package.json           # Frontend dependencies
```

---

## 🧪 Verificación Rápida

Ejecuta esto para verificar que todo funciona:

```powershell
# Terminal 1: Backend
cd c:\Users\juans\PARCE
php -S localhost:8000

# Terminal 2: Frontend
cd c:\Users\juans\PARCE
npm run dev

# Terminal 3: Pruebas
# Ir a http://localhost:5173
# Login con: admin.demo@parcedemo.local / Demo12345
# Ir a Dashboard → Gestión → Usuarios
# Debería cargar tabla de usuarios desde BD
```

---

## 📞 Contacto/Soporte

Si persisten los problemas:

1. Verificar logs en `storage/logs/` (si existen)
2. Revisar DevTools (F12) en navegador para errores JavaScript
3. Revisar consola de PHP para errores de backend
4. Asegurar que la base de datos `parce` existe y MySQL está corriendo

---

**Última actualización:** 2026-08-05
