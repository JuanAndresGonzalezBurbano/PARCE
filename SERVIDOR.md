# 🚀 Guía de Servidores - PARCE con XAMPP

Este documento explica cómo iniciar los dos servidores (Backend PHP + Frontend React) usando XAMPP y cómo resolver problemas comunes.

---

## 📋 Requisitos Previos

✅ **XAMPP 8.0+** instalado en `C:\xampp` (o ruta similar)
✅ **Node.js 16+** y npm instalados
✅ Base de datos `parce` ya creada en MySQL

---

## 🎯 Iniciar XAMPP

### Paso 1: Abrir XAMPP Control Panel

1. Abre **XAMPP Control Panel**
   - Busca en Inicio: `xampp`
   - O ve a: `C:\xampp\xampp-control.exe`

2. Debería verse así:
```
┌─ XAMPP Control Panel ─────────────────────┐
│                                           │
│  Apache     [ Start ] [ Admin ]           │
│  MySQL      [ Start ] [ Admin ]           │
│  FileZilla  [ ]                           │
│  Tomcat     [ ]                           │
│                                           │
└───────────────────────────────────────────┘
```

### Paso 2: Iniciar Apache y MySQL

Haz clic en **"Start"** para ambos:

1. **Apache** - Click en "Start" (debe quedar en verde)
2. **MySQL** - Click en "Start" (debe quedar en verde)

✅ Debería verse:
```
Apache     [Stop] [ Admin ]  ✓ Running
MySQL      [Stop] [ Admin ]  ✓ Running
```

---

## 🔧 Configurar Backend PHP

### Paso 1: Ubicar proyecto en XAMPP

El proyecto debe estar en:
```
C:\xampp\htdocs\PARCE\
```

Si **NO** está ahí:

**OPCIÓN A: Copiar proyecto**
```powershell
# Copiar carpeta PARCE a htdocs
Copy-Item -Recurse "c:\Users\juans\PARCE" "C:\xampp\htdocs\PARCE"
```

**OPCIÓN B: Crear enlace simbólico (mejor)**
```powershell
# Ejecutar como Administrador en PowerShell
New-Item -ItemType SymbolicLink -Path "C:\xampp\htdocs\PARCE" -Target "c:\Users\juans\PARCE"
```

### Paso 2: Verificar configuración PHP

Abre en navegador:
```
http://localhost/PARCE/public/index.php?page=test
```

Si ves un error, haz clic en **"Admin"** en MySQL y verifica:
- Usuario: `root`
- Sin contraseña
- Base de datos: `parce`

### Paso 3: Verificar que API funciona

Abre en navegador:
```
http://localhost/PARCE/public/index.php/api/test
```

✅ Debería devolver:
```json
{
  "success": true,
  "data": { "message": "Test OK" },
  "message": "Test"
}
```

---

## 🎨 Iniciar Frontend React

### Paso 1: Abrir PowerShell

```powershell
# Ir a la carpeta del proyecto
cd c:\Users\juans\PARCE
```

### Paso 2: Instalar dependencias (primera vez)

```powershell
npm install
```

### Paso 3: Iniciar servidor React

```powershell
npm run dev
```

✅ Debería ver:
```
  VITE v5... ready in 234 ms

  ➜  Local:   http://localhost:5173/
  ➜  Press h to show help
```

### Paso 4: Abrir en navegador

Abre: `http://localhost:5173`

Debería cargar la página de login.

---

## 🔑 Credenciales de Prueba

Usa estas para probar:

| Rol | Email | Contraseña |
|-----|-------|-----------|
| 👨‍💼 Admin | `admin.demo@parcedemo.local` | `Demo12345` |
| 🔧 Mecánico | `mecanico.demo@parcedemo.local` | `Demo12345` |
| 👤 Cliente | `cliente.demo@parcedemo.local` | `Demo12345` |

---

## 📊 Verificación Rápida (Todo Funcionando)

Cuando ambos servidores estén corriendo:

1. ✅ **Backend disponible:**
   - http://localhost/PARCE/public/index.php/api/test

2. ✅ **Frontend disponible:**
   - http://localhost:5173

3. ✅ **Login funciona:**
   - Ir a http://localhost:5173
   - Iniciar sesión con admin.demo@parcedemo.local

4. ✅ **Dashboard carga:**
   - Debería ver tabla de usuarios y vehículos

---

## 🔧 Solucionar Problemas

### ❌ Apache no inicia (error en rojo)

**Posible causa:** Puerto 80 ya está en uso

**Solución:**

```powershell
# 1. Ver qué está usando puerto 80
netstat -ano | findstr :80

# 2. Si algo está usando, matar el proceso
# Reemplaza 12345 con el PID mostrado arriba
taskkill /PID 12345 /F

# 3. En XAMPP, hacer clic nuevamente en "Start" para Apache
```

**Solución alternativa:** Cambiar puerto en XAMPP
```
1. Click en "Config" en Apache
2. Buscar "Listen 80"
3. Cambiar a "Listen 8080"
4. Reiniciar Apache
5. Backend estará en: http://localhost:8080/PARCE/public/index.php/api/...
```

---

### ❌ MySQL no inicia (error en rojo)

**Posible causa:** Puerto 3306 en uso o MySQL dañado

**Solución 1:**
```powershell
# 1. Detener MySQL en XAMPP
# 2. En PowerShell, ejecutar:
cd C:\xampp\mysql\bin
mysql.exe

# Si se abre, escribir:
EXIT;

# 3. Volver a iniciar MySQL en XAMPP
```

**Solución 2: Reparar MySQL**
```powershell
# Ir a XAMPP y hacer clic en "Shell"
cd C:\xampp\mysql\bin
mysqld --repair-defaults

# Cerrar shell y reintentar en XAMPP
```

---

### ❌ Base de datos `parce` no existe

**Solución:**

1. Abre **phpMyAdmin** en XAMPP:
   - Click en "Admin" en MySQL
   - O ve a: http://localhost/phpmyadmin

2. Crea la base de datos:
   - Click en "New"
   - Nombre: `parce`
   - Collation: `utf8mb4_unicode_ci`
   - Click "Create"

3. Ejecuta migraciones desde PowerShell:
   ```powershell
   cd c:\Users\juans\PARCE
   php public\index.php migrate:run
   php public\index.php seed:run
   ```

---

### ❌ Frontend muestra "Cannot GET /api/admin/users"

**Posible causa:** Backend no accesible o proxy no configurado correctamente

**Solución:**

1. Verifica que Apache está corriendo (verde en XAMPP)

2. Abre DevTools (F12) en navegador
   - Pestaña "Network"
   - Intenta hacer algo en la app
   - Si ves red 404, revisar:
     - ¿Dice `/api/api/admin/users`? → Error de duplicación
     - ¿Dice `/admin/users`? → Backend no responde

3. Reinicia ambos servidores:
   ```powershell
   # En XAMPP:
   # - Stop Apache
   # - Stop MySQL
   # Esperar 2 segundos
   # - Start MySQL
   # - Start Apache
   # 
   # En PowerShell (Ctrl+C en npm run dev):
   npm run dev
   ```

---

### ❌ Error "Too many requests"

**Posible causa:** Rate limiter activado

**Solución:**

```powershell
# Limpiar rate limiter en PowerShell:
cd c:\Users\juans\PARCE
php public\index.php clear:cache

# O eliminar archivo de cache manualmente:
Remove-Item storage/cache/* -Force

# Luego reiniciar frontend:
npm run dev
```

---

### ❌ Login no funciona (error de autenticación)

**Solución:**

1. Verificar que hay usuarios en BD:
   - Abre http://localhost/phpmyadmin
   - Click en `parce` → `users`
   - Debería haber al menos 3 usuarios (admin, mechanic, customer)

2. Si no hay usuarios, ejecutar seeders:
   ```powershell
   cd c:\Users\juans\PARCE
   php public\index.php seed:run
   ```

3. Limpiar cookies del navegador:
   - DevTools (F12) → Application → Cookies
   - Eliminar todas
   - Recargar página (F5)

---

## 📂 Estructura de Carpetas

```
C:\xampp\
├── htdocs/
│   └── PARCE/
│       ├── app/              (Backend)
│       ├── config/           (Configuración)
│       ├── database/         (Migraciones)
│       ├── public/           (Entry point)
│       ├── src/              (Frontend React)
│       ├── vendor/           (PHP dependencies)
│       ├── node_modules/     (JS dependencies)
│       ├── .env              (Config)
│       └── composer.json
├── mysql/
├── apache/
└── php/
```

---

## 🎯 Flujo de Uso Diario

Cada vez que quieras trabajar:

**Mañana:**
1. Abre XAMPP Control Panel
2. Click "Start" en Apache y MySQL
3. Espera a que salga ✓ Running
4. En PowerShell: `cd c:\Users\juans\PARCE && npm run dev`
5. Abre http://localhost:5173

**Tarde (si cierras):**
1. En PowerShell: Ctrl+C para parar npm
2. En XAMPP: Click "Stop" en Apache y MySQL
3. Repetir desde "Mañana" para reencender

**Si algo falla:**
1. Lee la sección "Solucionar Problemas" arriba
2. Si no funciona, para todo:
   - XAMPP: Stop Apache y MySQL
   - PowerShell: Ctrl+C
   - Espera 5 segundos
   - Reinicia todo desde cero

---

## ✅ Checklist Final

Antes de empezar a programar:

- [ ] XAMPP Control Panel abierto
- [ ] Apache está en verde (Running)
- [ ] MySQL está en verde (Running)
- [ ] Frontend corre (`npm run dev`)
- [ ] http://localhost:5173 abre correctamente
- [ ] http://localhost/PARCE/public/index.php/api/test devuelve JSON
- [ ] Puedo iniciar sesión con admin.demo@parcedemo.local

Si todo está ✓, **¡listo para trabajar!**

---

## 📞 Contacto/Soporte

Si persisten problemas:

1. Verifica que XAMPP está corriendo (ambos en verde)
2. Verifica que npm run dev está corriendo
3. Limpia caché del navegador (Ctrl+Shift+Del)
4. Reinicia todo de cero (para Apache, MySQL, npm)
5. Si aún no funciona, revisa errores en consola PHP y DevTools

---

**Última actualización:** 2026-08-05  
**Sistema:** Windows + XAMPP + PHP 8+ + MySQL 5.7+ + Node.js 16+
