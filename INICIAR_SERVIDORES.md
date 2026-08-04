# 🚀 CÓMO INICIAR LOS SERVIDORES

## 📝 Guía Rápida

Necesitas **2 terminales abiertas** (o 2 ventanas de PowerShell):

---

## 1️⃣ BACKEND PHP (Puerto 8000)

### Opción A: PowerShell/CMD
```powershell
cd "C:\Program Files\Ampps\www\parce-api"
php -S localhost:8000 -t public public/router.php
```

### Opción B: Desde AMPPS
1. Abre AMPPS
2. Asegúrate que Apache y MySQL estén corriendo
3. Abre PowerShell y ejecuta el comando de arriba

**Sabrás que funciona cuando veas:**
```
PHP 8.2.31 Development Server (http://localhost:8000) started
```

**Verifica que funciona:**
```
http://localhost:8000/api/auth/health
```
Debe mostrar: `{"success":true,"data":{"status":"healthy"...}}`

---

## 2️⃣ FRONTEND REACT (Puerto 5173)

### PowerShell/CMD (nueva ventana)
```powershell
cd c:\Users\APRENDIZ\PARCE
npm run dev
```

**Sabrás que funciona cuando veas:**
```
VITE v5.x.x  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

**Verifica que funciona:**
```
http://localhost:5173
```
Debe cargar la página de login de P.A.R.C.E

---

## 🎯 RESUMEN VISUAL

```
┌─────────────────────────────────────────┐
│  Terminal 1: BACKEND                    │
│  cd "C:\Program Files\Ampps\www\parce-  │
│  api"                                    │
│  php -S localhost:8000 -t public        │
│  public/router.php                       │
│                                          │
│  ✅ http://localhost:8000               │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Terminal 2: FRONTEND                   │
│  cd c:\Users\APRENDIZ\PARCE             │
│  npm run dev                             │
│                                          │
│  ✅ http://localhost:5173               │
└─────────────────────────────────────────┘
```

---

## ⚙️ SCRIPT AUTOMÁTICO (OPCIONAL)

Puedes crear un archivo `.bat` para iniciar ambos automáticamente:

### Archivo: `INICIAR_TODO.bat`
```batch
@echo off
echo Iniciando Backend PHP...
start "Backend PHP" cmd /k "cd /d C:\Program Files\Ampps\www\parce-api && php -S localhost:8000 -t public public/router.php"

timeout /t 3 /nobreak > nul

echo Iniciando Frontend React...
start "Frontend React" cmd /k "cd /d c:\Users\APRENDIZ\PARCE && npm run dev"

echo.
echo ============================================
echo Servidores iniciados:
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5173
echo ============================================
echo.
echo Presiona cualquier tecla para cerrar esta ventana...
pause > nul
```

**Guarda este archivo en:** `c:\Users\APRENDIZ\INICIAR_TODO.bat`

**Para usarlo:**
- Doble click en `INICIAR_TODO.bat`
- Se abrirán 2 ventanas (backend y frontend)
- ¡Listo! Ya puedes usar la aplicación

---

## 🛑 CÓMO DETENER LOS SERVIDORES

### Backend:
- En la terminal donde corre el backend, presiona: `Ctrl + C`
- O cierra la ventana

### Frontend:
- En la terminal donde corre el frontend, presiona: `Ctrl + C`
- O cierra la ventana

### O desde PowerShell:
```powershell
# Detener backend PHP
Stop-Process -Name php -Force

# Detener frontend (si usas npm run dev, detén manualmente con Ctrl+C)
```

---

## 🔍 VERIFICAR QUE ESTÁN CORRIENDO

### Backend:
```powershell
Test-NetConnection -ComputerName localhost -Port 8000
```
Debe decir: `TcpTestSucceeded : True`

### Frontend:
```powershell
Test-NetConnection -ComputerName localhost -Port 5173
```
Debe decir: `TcpTestSucceeded : True`

---

## ❗ PROBLEMAS COMUNES

### "Address already in use" (puerto ocupado)

**Backend (puerto 8000):**
```powershell
# Ver qué proceso está usando el puerto
netstat -ano | findstr :8000

# Detener ese proceso (reemplaza PID con el número que viste)
Stop-Process -Id PID -Force
```

**Frontend (puerto 5173):**
```powershell
# Ver qué proceso está usando el puerto
netstat -ano | findstr :5173

# Detener ese proceso
Stop-Process -Id PID -Force
```

---

## 📱 ACCESO DESDE OTROS DISPOSITIVOS (OPCIONAL)

Si quieres acceder desde tu celular o tablet en la misma red WiFi:

### Backend:
Cambia el inicio por:
```powershell
php -S 0.0.0.0:8000 -t public public/router.php
```

### Frontend:
```powershell
npm run dev -- --host
```

Luego accede desde tu celular a: `http://TU_IP_LOCAL:5173`

(Para saber tu IP local: `ipconfig` y busca "Dirección IPv4")

---

## 📋 CHECKLIST ANTES DE USAR

- [ ] MySQL corriendo (desde AMPPS)
- [ ] Base de datos `parce` existe
- [ ] Backend iniciado en puerto 8000
- [ ] Frontend iniciado en puerto 5173
- [ ] Navegador en `http://localhost:5173`

---

## 🎉 ¡TODO LISTO!

Ahora puedes:
- ✅ Registrar usuarios
- ✅ Hacer login
- ✅ Usar el dashboard admin
- ✅ Ver usuarios reales en la base de datos

**Credenciales admin:**
```
Email: admin@parce.local
Contraseña: Admin123!
```
