# 🖥️ Guía: Clonar PARCE en Otro Computador

Esta guía explica cómo clonar **SOLO la rama de recuperación de contraseña** en otro computador y tener la misma base de datos.

---

## 📋 Requisitos en el Nuevo Computador

Instala esto primero:

- ✅ **XAMPP** (Apache, MySQL, PHP)
  - Descarga: https://www.apachefriends.org/

- ✅ **Git** (para clonar desde GitHub)
  - Descarga: https://git-scm.com/

- ✅ **Node.js 16+** y **npm**
  - Descarga: https://nodejs.org/

- ✅ **Composer** (gestor de dependencias PHP)
  - Descarga: https://getcomposer.org/

---

## 🎯 Paso 1: Preparar XAMPP en el Nuevo PC

1. Abre **XAMPP Control Panel**

2. Inicia:
   - **Apache** (click "Start")
   - **MySQL** (click "Start")

Espera a que ambos muestren: `✓ Running`

---

## 🎯 Paso 2: Clonar la Rama del Repositorio

Abre **PowerShell** en la carpeta donde quieras el proyecto:

```powershell
# Ejemplo: Carpeta del usuario
cd C:\Users\TuUsuario\

# Clonar SOLO la rama de recuperación de contraseña
git clone -b rama-recuperacion-contrasena https://github.com/juansebastian/PARCE.git PARCE

# Entrar en la carpeta
cd PARCE
```

**Espera a que termine la descarga** (puede tomar unos minutos)

---

## 🎯 Paso 3: Copiar Proyecto a XAMPP

```powershell
# Copiar a XAMPP
Copy-Item -Recurse "C:\Users\TuUsuario\PARCE" "C:\xampp\htdocs\PARCE" -Force

# O crear enlace simbólico (ejecutar como Admin):
New-Item -ItemType SymbolicLink -Path "C:\xampp\htdocs\PARCE" -Target "C:\Users\TuUsuario\PARCE"
```

---

## 🎯 Paso 4: Instalar Dependencias

### 4.1 Dependencias PHP

```powershell
cd C:\Users\TuUsuario\PARCE

# Instalar Composer (si no está en PATH, usa: php composer.phar)
composer install

# O si está en PATH:
composer install
```

### 4.2 Dependencias Node.js

```powershell
# Instalar npm packages
npm install
```

---

## 🎯 Paso 5: Obtener la Base de Datos

Hay dos formas: **A) Exportar desde tu PC** o **B) Crear nueva**

### Opción A: Importar Base de Datos (RECOMENDADO)

**En tu PC (donde ya funciona PARCE):**

1. Abre **phpMyAdmin**: `http://localhost/phpmyadmin`
2. Haz clic en base de datos `parce`
3. Pestaña **"Export"** → **"Go"**
4. Se descarga: `parce.sql`
5. Copia este archivo a: `C:\Users\TuUsuario\PARCE\database\backups\`

**En el nuevo PC:**

```powershell
# Abre phpMyAdmin: http://localhost/phpmyadmin
# Haz clic en "Import"
# Selecciona: database/backups/parce.sql
# Haz clic en "Go"
```

✅ La base de datos está importada con todos los datos

### Opción B: Crear Base de Datos Nueva

Si no tienes el backup, crea una nueva:

```powershell
cd C:\Users\TuUsuario\PARCE

# Crear tablas
php public/index.php migrate:run

# Agregar datos de demo
php public/index.php seed:run
```

⚠️ **Esto crea usuarios de DEMO, no tus datos reales**

---

## 🎯 Paso 6: Configurar .env

El archivo `.env` ya viene en la rama, pero verifica que contenga:

```
APP_NAME=P.A.R.C.E
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:5173

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=parce
DB_USERNAME=root
DB_PASSWORD=

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=juansebastianprieto29@gmail.com
SMTP_PASSWORD=ctavjalvibcowuec
SMTP_FROM_EMAIL=juansebastianprieto29@gmail.com
SMTP_FROM_NAME=P.A.R.C.E Platform
```

**Si no está configurado correctamente, cópialo desde tu PC**

---

## 🎯 Paso 7: Verificar Base de Datos

Abre **phpMyAdmin**: `http://localhost/phpmyadmin`

Haz clic en **`parce`** → Deberías ver tablas:
- users
- roles
- user_roles
- vehicles
- service_requests
- password_reset_tokens ✅ (nueva)
- pqr
- surveys
- ...

✅ Si ves todas las tablas, está correctamente importada

---

## 🎯 Paso 8: Iniciar los Servidores

### 8.1 Verificar que Apache y MySQL estén en XAMPP

XAMPP Control Panel debe mostrar:
```
Apache     [Stop] [ Admin ]  ✓ Running
MySQL      [Stop] [ Admin ]  ✓ Running
```

### 8.2 Iniciar Frontend (Vite)

En una nueva ventana de PowerShell:

```powershell
cd C:\Users\TuUsuario\PARCE

npm run dev
```

Deberías ver:
```
  VITE v5.0.0  ready in 234 ms

  ➜  Local:   http://localhost:5173/
```

---

## 🎯 Paso 9: Abrir la Aplicación

En el navegador, ve a:

```
http://localhost:5173
```

Deberías ver la página de **Login**.

---

## 🔑 Iniciar Sesión

Usa las credenciales del PC original:

| Rol | Email | Contraseña |
|-----|-------|-----------|
| Admin | `admin.demo@parcedemo.local` | `Demo12345` |
| Mecánico | `mecanico.demo@parcedemo.local` | `Demo12345` |
| Cliente | `cliente.demo@parcedemo.local` | `Demo12345` |

**O si creaste usuarios nuevos, úsalos también**

---

## ✅ Verificar que la BD Esté Sincronizada

1. Inicia sesión como cualquier usuario
2. Ve a Dashboard
3. Deberías ver:
   - ✅ Usuarios (con los datos del PC original)
   - ✅ Vehículos registrados
   - ✅ Solicitudes de servicio
   - ✅ PQR y encuestas

4. Prueba **Recuperación de Contraseña**:
   - Click en "Olvidé mi contraseña"
   - Ingresa un email
   - Deberías recibir correo ✅

---

## 🔄 Mantener Sincronizado

Si haces cambios en el PC original y quieres que aparezcan en el nuevo PC:

**En el PC original:**
```powershell
# Hacer cambios en la BD
# Luego exportar:
# phpMyAdmin → Export → Go
# Guardar como: parce.sql
```

**En el nuevo PC:**
```powershell
# Importar: 
# phpMyAdmin → Import → Seleccionar parce.sql → Go
```

---

## 🐛 Solucionar Problemas

### ❌ "fatal: could not read Username for 'https://github.com/...'"

**Causa:** Git no tiene credenciales

**Solución:**

```powershell
# Usar HTTPS con token (más seguro)
git clone https://TOKEN@github.com/juansebastian/PARCE.git PARCE

# O usar SSH
git clone git@github.com:juansebastian/PARCE.git PARCE
```

---

### ❌ "Cannot GET /api/test"

**Causa:** Proyecto no está en la carpeta correcta de XAMPP

**Solución:**

1. Verifica: `C:\xampp\htdocs\PARCE` existe
2. Contiene carpetas: `app/`, `src/`, `public/`
3. Recarga: `http://localhost/PARCE/public/index.php/api/test`

---

### ❌ "No hay base de datos 'parce'"

**Causa:** No importaste el backup

**Solución:**

Abre phpMyAdmin e importa el archivo `.sql`:
1. phpMyAdmin → Import → Selecciona archivo → Go

---

### ❌ "npm: El término no se reconoce"

**Causa:** Node.js no instalado o no en PATH

**Solución:**

1. Descarga Node.js: https://nodejs.org/
2. Instala
3. Reinicia PowerShell
4. Verifica: `node --version`

---

### ❌ Los correos no se envían

**Causa:** `.env` con credenciales Gmail incorrectas

**Solución:**

1. Verifica `.env`:
   ```
   SMTP_USERNAME=juansebastianprieto29@gmail.com
   SMTP_PASSWORD=ctavjalvibcowuec
   ```

2. Si necesitas cambiar email:
   - Ve a: https://myaccount.google.com/apppasswords
   - Genera nueva contraseña de app
   - Actualiza en `.env`

---

## 📋 Checklist Final

Antes de considerarlo completo:

- [ ] XAMPP Control Panel: Apache ✓ Running, MySQL ✓ Running
- [ ] Frontend corre: `npm run dev` ✓
- [ ] Acceso a: `http://localhost:5173` ✓
- [ ] Login funciona con admin.demo@... ✓
- [ ] Base de datos contiene usuarios y datos ✓
- [ ] Recuperación de contraseña envía correos ✓
- [ ] Puedes crear nuevos usuarios ✓
- [ ] Los nuevos usuarios reciben correos de recuperación ✓

---

## 📁 Estructura en el Nuevo PC

```
C:\Users\TuUsuario\PARCE\
├── app/                 (Backend PHP)
├── src/                 (Frontend React)
├── database/
│   └── backups/
│       └── parce.sql    (Backup para importar)
├── .env                 (Configuración - NO SUBIR A GIT)
├── composer.json
├── package.json
└── ...
```

---

## 💡 Tips

- Siempre haz `npm install` después de clonar
- Siempre haz `composer install` después de clonar
- El `.env` **NO se sube a Git** (ya está en `.gitignore`)
- Si cambias credenciales, actualiza `.env` en ambos PCs
- Los datos de la BD se sincronizan exportando/importando `.sql`

---

## ✅ Resumen Rápido

1. `git clone -b rama-recuperacion-contrasena https://github.com/juansebastian/PARCE.git`
2. `composer install && npm install`
3. Importar `parce.sql` en phpMyAdmin
4. `npm run dev`
5. Abre: `http://localhost:5173`

---

**¿Preguntas?** Contacta al equipo de desarrollo.

**Última actualización:** 12 de Agosto de 2026
