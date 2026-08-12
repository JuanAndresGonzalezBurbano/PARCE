# 🚀 Guía: Iniciar Servidores para PARCE

Esta guía te muestra cómo encender la aplicación PARCE en tu computadora local.

---

## 📋 Requisitos Previos

Asegúrate de tener instalado:

- ✅ **XAMPP** (con Apache, MySQL, PHP)
  - Descarga: https://www.apachefriends.org/
  - Debe estar instalado en: `C:\xampp`

- ✅ **Node.js 16+** y **npm**
  - Descarga: https://nodejs.org/
  - Verifica: `node --version` y `npm --version`

- ✅ **Git** (para clonar el proyecto)
  - Descarga: https://git-scm.com/

---

## 🎯 Paso 1: Verificar que XAMPP esté instalado

1. Busca en tu computadora: **XAMPP Control Panel**
2. O abre: `C:\xampp\xampp-control.exe`

Deberías ver una ventana así:

```
┌─ XAMPP Control Panel ────────────────────┐
│                                          │
│  Apache     [ Start ] [ Admin ]          │
│  MySQL      [ Start ] [ Admin ]          │
│  FileZilla  [ ]                          │
│  Tomcat     [ ]                          │
│                                          │
└──────────────────────────────────────────┘
```

---

## 🎯 Paso 2: Iniciar Apache y MySQL

1. En **XAMPP Control Panel**, haz clic en **"Start"** para:
   - **Apache** (click en "Start")
   - **MySQL** (click en "Start")

2. Espera a que ambos muestren: `✓ Running` (en verde)

```
Apache     [Stop] [ Admin ]  ✓ Running
MySQL      [Stop] [ Admin ]  ✓ Running
```

**Si algo falla:**
- Lee la sección "Solucionar Problemas" más abajo

---

## 🎯 Paso 3: Clonar o Ubicar el Proyecto

### Opción A: Si ya tienen el proyecto descargado

```powershell
# Ir a la carpeta del proyecto
cd c:\Users\juans\PARCE
```

### Opción B: Si necesitan clonar del repositorio

```powershell
# Clonar la rama con los últimos cambios
git clone -b rama-recuperacion-contrasena https://github.com/tuusuario/PARCE.git
cd PARCE
```

---

## 🎯 Paso 4: Copiar Proyecto a XAMPP (Primera Vez)

**Nota:** Si el proyecto ya está en `C:\xampp\htdocs\PARCE`, omite este paso.

```powershell
# Copiar el proyecto a XAMPP
Copy-Item -Recurse "c:\Users\juans\PARCE" "C:\xampp\htdocs\PARCE" -Force

# O crear un enlace simbólico (recomendado - ejecutar como Admin)
New-Item -ItemType SymbolicLink -Path "C:\xampp\htdocs\PARCE" -Target "c:\Users\juans\PARCE"
```

---

## 🎯 Paso 5: Instalar Dependencias Backend (Primera Vez)

```powershell
cd c:\Users\juans\PARCE

# Instalar dependencias PHP
php composer.phar install
```

---

## 🎯 Paso 6: Configurar Base de Datos (Primera Vez)

### 6.1 Crear Base de Datos

Abre **phpMyAdmin**:
- En XAMPP Control Panel, haz clic en **"Admin"** en MySQL
- O ve a: `http://localhost/phpmyadmin`

1. Haz clic en **"New"** (arriba a la izquierda)
2. Nombre: `parce`
3. Collation: `utf8mb4_unicode_ci`
4. Haz clic en **"Create"**

### 6.2 Ejecutar Migraciones

En PowerShell:

```powershell
cd c:\Users\juans\PARCE

# Crear tablas
php public/index.php migrate:run

# Llenar con datos de prueba (demo users)
php public/index.php seed:run
```

✅ La base de datos está lista

---

## 🎯 Paso 7: Instalar Dependencias Frontend (Primera Vez)

```powershell
cd c:\Users\juans\PARCE

# Instalar dependencias Node
npm install
```

---

## 🎯 Paso 8: Iniciar Frontend (Vite)

En una **nueva ventana de PowerShell**:

```powershell
cd c:\Users\juans\PARCE

# Iniciar servidor Vite
npm run dev
```

Deberías ver algo así:

```
  VITE v5.0.0  ready in 234 ms

  ➜  Local:   http://localhost:5173/
  ➜  Press h to show help
```

**Deja esta ventana abierta mientras trabajes**

---

## 🎯 Paso 9: Abrir la Aplicación

En tu navegador, ve a:

```
http://localhost:5173
```

Deberías ver la página de **Login** de PARCE.

---

## 🔑 Credenciales de Prueba

Usa estas para iniciar sesión:

| Rol | Email | Contraseña |
|-----|-------|-----------|
| 👨‍💼 Admin | `admin.demo@parcedemo.local` | `Demo12345` |
| 🔧 Mecánico | `mecanico.demo@parcedemo.local` | `Demo12345` |
| 👤 Cliente | `cliente.demo@parcedemo.local` | `Demo12345` |

---

## ✅ Verificar que Todo Funcione

1. ✅ **Backend disponible:**
   - Abre: `http://localhost/PARCE/public/index.php/api/test`
   - Deberías ver: `{"success":true,...}`

2. ✅ **Frontend disponible:**
   - Ya abierto en: `http://localhost:5173`

3. ✅ **Login funciona:**
   - Intenta iniciar sesión con admin.demo@parcedemo.local

4. ✅ **Recuperación de contraseña:**
   - Ve a "Olvidé mi contraseña"
   - Ingresa un email
   - Verifica que llegue el correo

---

## 🛑 Detener Todo

Cuando termines de trabajar:

**En PowerShell (Frontend):**
```powershell
# Presiona: Ctrl + C
```

**En XAMPP Control Panel:**
1. Haz clic en **"Stop"** para Apache
2. Haz clic en **"Stop"** para MySQL

---

## 🔧 Solucionar Problemas

### ❌ Apache no inicia (rojo)

**Causa:** Puerto 80 ya está en uso

**Solución:**

```powershell
# Ver qué está usando puerto 80
netstat -ano | findstr :80

# Detener el proceso (reemplaza 12345 con el PID)
taskkill /PID 12345 /F

# Reintentar en XAMPP
```

---

### ❌ MySQL no inicia (rojo)

**Causa:** Base de datos dañada

**Solución:**

1. Abre **XAMPP Shell** (botón "Shell")
2. Ejecuta:
   ```
   cd C:\xampp\mysql\bin
   mysqld --repair-defaults
   ```
3. Cierra y reinicia XAMPP

---

### ❌ "Cannot GET /api/test"

**Causa:** Archivo .env no está configurado correctamente

**Solución:**

1. Verifica que exista: `c:\Users\juans\PARCE\.env`
2. Contiene:
   ```
   APP_NAME=P.A.R.C.E
   DB_HOST=127.0.0.1
   DB_DATABASE=parce
   SMTP_HOST=smtp.gmail.com
   ```
3. Recarga: `http://localhost/PARCE/public/index.php/api/test`

---

### ❌ "npm: El término no se reconoce"

**Causa:** Node.js no está instalado o no en PATH

**Solución:**

1. Descarga Node.js: https://nodejs.org/
2. Instala (incluye npm automáticamente)
3. Reinicia PowerShell
4. Verifica: `node --version`

---

## 📚 Estructura de Carpetas

```
C:\xampp\htdocs\PARCE\
├── app/                      (Backend PHP - Controladores, Modelos)
│   ├── Controllers/         (Lógica de negocio)
│   ├── Models/              (Acceso a datos)
│   │   └── Mail/            (Servicios de correo)
│   ├── Core/                (Framework base)
│   ├── Middleware/          (Filtros de seguridad)
│   └── Views/               (Helpers de respuesta)
├── src/                      (Frontend React - TypeScript)
│   ├── views/               (Páginas)
│   ├── components/          (Componentes reutilizables)
│   ├── services/            (API client)
│   └── controllers/         (Auth, contexto)
├── config/                  (Rutas, configuración)
├── database/                (Migraciones, seeders)
├── public/                  (Punto de entrada)
├── vendor/                  (Dependencias PHP - Composer)
├── node_modules/            (Dependencias JS - npm)
├── .env                     (Variables de entorno - NO SUBIR A GIT)
└── package.json / composer.json
```

---

## 💡 Tips Útiles

- **Limpiar caché del navegador:** `Ctrl + Shift + Del` → Limpiar todo
- **Ver logs:** `C:\xampp\apache\logs\error.log`
- **Reiniciar servidores:** Stop → Esperar 3 seg → Start
- **Cambiar puerto frontend:** `npm run dev -- --port 3000`

---

## ✅ Resumen Rápido (Para Siguientes Veces)

1. Abre **XAMPP Control Panel**
2. Click "Start" en Apache y MySQL
3. En PowerShell: `cd c:\Users\juans\PARCE && npm run dev`
4. Abre: `http://localhost:5173`
5. ¡Listo!

---

**¿Necesitas ayuda?** Revisa la sección "Solucionar Problemas" arriba.

**Última actualización:** 12 de Agosto de 2026
