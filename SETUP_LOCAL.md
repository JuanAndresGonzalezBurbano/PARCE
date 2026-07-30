# 🚀 Setup Local — Backend PHP + Frontend React

Este documento explica cómo levantar el proyecto **P.A.R.C.E** completo en localhost.

---

## 📋 Pre-requisitos

- **AMPPS** instalado en `C:\Program Files\Ampps`
- **Node.js** 18+ con npm
- MySQL corriendo (AMPPS lo inicia automáticamente)

---

## 🔧 Backend PHP (API REST)

### Ubicación
```
C:\Program Files\Ampps\www\parce-api\
```

### Paso 1: Verificar que AMPPS esté corriendo
Abre AMPPS y asegúrate de que **MySQL** y **Apache** estén activos (íconos verdes).

### Paso 2: Levantar el servidor PHP en puerto 8000
Abre PowerShell como **Administrador** y ejecuta:

```powershell
cd "C:\Program Files\Ampps\www\parce-api"
& "C:\Program Files\Ampps\php\php.exe" -S localhost:8000 -t public public/router.php
```

Deja esta ventana abierta. Verás logs como:
```
[Wed Jan 31 12:00:00 2024] PHP 8.2.31 Development Server (http://localhost:8000) started
```

### Paso 3: Verificar que la API responde
Abre un navegador y ve a:
```
http://localhost:8000/api/auth/health
```

Deberías ver:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "version": "1.0.0"
  }
}
```

---

## ⚛️ Frontend React (Vite)

### Ubicación
```
C:\Users\APRENDIZ\PARCE\
```

### Paso 1: Instalar dependencias (solo primera vez)
```powershell
cd C:\Users\APRENDIZ\PARCE
npm install
```

### Paso 2: Levantar el servidor de desarrollo
```powershell
npm run dev
```

Verás algo como:
```
VITE v5.x.x  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Paso 3: Abrir en el navegador
Abre `http://localhost:5173/`

---

## 🔐 Credenciales de Prueba

| Rol          | Email                       | Contraseña       | Acceso                 |
|--------------|----------------------------|------------------|------------------------|
| Admin        | `admin@parce.local`        | `Admin123!`      | `/dashboard`           |
| Super Admin  | `superadmin@parce.local`   | `SuperAdmin123!` | `/dashboard`           |
| Cliente      | `customer@parce.local`     | `Customer123!`   | `/home`                |
| Mecánico     | `mechanic@parce.local`     | `Mechanic123!`   | `/mechanic-home`       |

**Usuarios demo secundarios (migración 000012):**
- `cliente.demo@parcedemo.local` (rol: Customer)
- `mecanico.demo@parcedemo.local` (rol: Mechanic)
- `admin.demo@parcedemo.local` (rol: Administrator)

---

## 🗄️ Base de Datos

### Acceso a phpMyAdmin
```
http://localhost/phpmyadmin
Usuario: root
Password: (vacío)
```

### Base de datos creada
- **Nombre:** `parce`
- **Charset:** `utf8mb4_unicode_ci`
- **Tablas:** 10 (users, roles, vehicles, service_requests, etc.)
- **Registros:** 7 usuarios + datos demo

### Re-ejecutar migraciones (si es necesario)
```powershell
cd "C:\Program Files\Ampps\www\parce-api"
& "C:\Program Files\Ampps\php\php.exe" migrate_run.php status
```

---

## 🔄 Flujo Completo

1. **Arrancar MySQL** (AMPPS)
2. **Arrancar backend PHP** en puerto 8000 (PowerShell 1)
3. **Arrancar frontend Vite** en puerto 5173 (PowerShell 2)
4. **Abrir navegador** en `http://localhost:5173/`
5. **Login** con `admin@parce.local` / `Admin123!`

---

## 🐛 Troubleshooting

### El backend no arranca
- Verifica que MySQL esté corriendo en AMPPS
- Verifica que el puerto 8000 esté libre:
  ```powershell
  Get-NetTCPConnection -LocalPort 8000
  ```

### El frontend no conecta al backend
- Verifica que `http://localhost:8000/api/auth/health` responda
- Revisa la consola del navegador (F12) — debe mostrar peticiones a `/api/...`
- El proxy de Vite reenvía `/api` → `http://localhost:8000/api`

### Error "CORS blocked"
- El backend ya tiene CORS configurado para `localhost:5173`
- Verifica que el `.env` del backend tenga:
  ```
  CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
  ```

### Error "Unknown column 'name'"
- La tabla `users` usa `first_name` y `last_name`, no `name`
- El `authService.ts` ya convierte ambos en `name` para el frontend

---

## 📝 Notas Importantes

- **Nada está en git** — todo es local en tu disco
- El backend está en `C:\Program Files\Ampps\www\parce-api\` (fuera del repo)
- El frontend sigue en `C:\Users\APRENDIZ\PARCE\` (tu repo main)
- Los cambios del frontend **NO** están commiteados (trabajas local)
- Para "desconectar" el backend, simplemente para el servidor PHP (Ctrl+C)

---

## ✅ Todo OK cuando veas:

1. ✅ Backend responde en `http://localhost:8000/api/auth/health`
2. ✅ Frontend carga en `http://localhost:5173/`
3. ✅ Login con `admin@parce.local` redirige a `/dashboard`
4. ✅ Consola del navegador (F12) muestra peticiones a `/api/...` con status 200
