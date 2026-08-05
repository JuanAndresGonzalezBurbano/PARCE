# Restaurar Base de Datos en Otro Computador

Este documento explica cómo restaurar tu BD (con todos tus usuarios y vehículos) en otro computador.

---

## 📋 Requisitos

- XAMPP instalado (con MySQL)
- Git instalado
- PowerShell o Terminal

---

## 🚀 Pasos para Restaurar la BD

### Paso 1: Clonar el Proyecto

```powershell
cd C:\
git clone https://github.com/JuanAndresGonzalezBurbano/PARCE.git
cd PARCE
```

✅ Ahora tienes el proyecto con el backup en: `database/backups/parce_backup.sql`

---

### Paso 2: Iniciar XAMPP

1. Abre **XAMPP Control Panel**
2. Haz clic en **"Start"** en **MySQL**
3. Espera a que salga verde (✓ Running)

---

### Paso 3: Restaurar la BD

```powershell
cd C:\PARCE

# Restaurar el backup
mysql -u root parce < database/backups/parce_backup.sql
```

✅ Si no hay errores, la BD se restauró correctamente

---

### Paso 4: Verificar que se Importó

```powershell
# Ver cuántos usuarios hay
mysql -u root -e "SELECT COUNT(*) as total_usuarios FROM parce.users;"

# Ver usuarios específicos
mysql -u root -e "SELECT id, email, first_name FROM parce.users;"
```

✅ Deberías ver tus usuarios (admin, mechanic, customer, etc)

---

### Paso 5: Iniciar Servidores

**Terminal 1 - Backend:**
```powershell
cd C:\PARCE
php -S localhost:8000
```

**Terminal 2 - Frontend:**
```powershell
cd C:\PARCE
npm install  # (primera vez)
npm run dev
```

---

### Paso 6: Acceder a la Aplicación

Abre en navegador:
```
http://localhost:5173
```

**Login con:**
- Email: `admin.demo@parcedemo.local`
- Contraseña: `Demo12345`

✅ **¡Listo!** Verás todos tus usuarios y vehículos

---

## 🔍 Verificación Completa

| Verificación | Comando/Acción |
|--------------|---|
| BD creada | `mysql -u root -e "SHOW DATABASES;"` |
| Tablas existen | `mysql -u root -e "SHOW TABLES;" parce` |
| Usuarios importados | `mysql -u root -e "SELECT * FROM parce.users;"` |
| Vehículos importados | `mysql -u root -e "SELECT * FROM parce.vehicles;"` |
| Backend responde | Abrir http://localhost:8000/api/test |
| Frontend carga | Abrir http://localhost:5173 |
| Login funciona | Iniciar sesión con admin.demo@parcedemo.local |

---

## ⚠️ Si Hay Problemas

### Error: "La BD parce no existe"

```powershell
# Crear la BD primero
mysql -u root -e "CREATE DATABASE parce CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Luego restaurar
mysql -u root parce < database/backups/parce_backup.sql
```

### Error: "mysqldump: command not found"

Usar la ruta completa:
```powershell
& 'C:\xampp\mysql\bin\mysql.exe' -u root parce < database/backups/parce_backup.sql
```

### Usuarios no aparecen en Admin Panel

Limpiar cookies del navegador:
- DevTools (F12) → Application → Cookies
- Delete all
- Recargar página (F5)

---

## 📝 Resumen

| Paso | Acción |
|------|--------|
| 1 | Clonar proyecto: `git clone ...` |
| 2 | Iniciar MySQL en XAMPP |
| 3 | Restaurar BD: `mysql -u root parce < database/backups/parce_backup.sql` |
| 4 | Verificar: `SELECT COUNT(*) FROM parce.users;` |
| 5 | Iniciar servidores: `php -S localhost:8000` + `npm run dev` |
| 6 | Abrir http://localhost:5173 |

---

**¡Listo para trabajar en otro computador!** 🎉
