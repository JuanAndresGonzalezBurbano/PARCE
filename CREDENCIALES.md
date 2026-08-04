# 🔐 Credenciales de Acceso — P.A.R.C.E

## Backend PHP
- **URL:** `http://localhost:8000`
- **API Base:** `http://localhost:8000/api`
- **Health Check:** `http://localhost:8000/api/auth/health`

## Frontend React
- **URL:** `http://localhost:5173`
- **Proxy:** `/api/*` → `http://localhost:8000/api/*`

---

## 👥 Usuarios de Prueba

### 🔴 Super Administrador
```
Email:    superadmin@parce.local
Password: SuperAdmin123!
Acceso:   /dashboard (admin completo)
```

### 🟠 Administrador
```
Email:    admin@parce.local
Password: Admin123!
Acceso:   /dashboard
```

### 🟢 Cliente (Usuario)
```
Email:    customer@parce.local
Password: Customer123!
Acceso:   /home (solicitar servicios)
```

### 🔧 Mecánico
```
Email:    mechanic@parce.local
Password: Mechanic123!
Acceso:   /mechanic-home (aceptar servicios)
```

---

## 📊 Usuarios Demo Secundarios

Estos fueron creados por la migración `000012_seed_demo_users_and_sample_data`:

```
cliente.demo@parcedemo.local     → Customer
mecanico.demo@parcedemo.local    → Mechanic
admin.demo@parcedemo.local       → Administrator
```

**Nota:** Estas cuentas tienen contraseñas hasheadas con los mismos valores que las principales (Admin123!, Customer123!, Mechanic123!).

---

## 🗄️ Base de Datos MySQL

```
Host:     127.0.0.1
Port:     3306
Database: parce
User:     root
Password: (vacío)
```

### phpMyAdmin
```
URL:      http://localhost/phpmyadmin
User:     root
Password: (vacío)
```

---

## 🧪 Test Login via cURL

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@parce.local","password":"Admin123!"}'
```

Respuesta esperada:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 5,
      "email": "admin@parce.local",
      "first_name": "System",
      "last_name": "Administrator",
      "roles": [{"id": 3, "name": "Administrator", "slug": "Administrator"}]
    }
  }
}
```

---

## 📝 Mapeo de Roles

| Slug en API (PHP)  | Rol en Frontend (React) | Rutas Permitidas        |
|--------------------|-------------------------|-------------------------|
| `Administrator`    | `admin`                 | `/dashboard`, `/admin/*`|
| `Mechanic`         | `mechanic`              | `/mechanic-home`, `/mechanic-*` |
| `Customer`         | `user`                  | `/home`, `/services`, `/payment` |

El mapeo lo hace `authService.ts` → `mapApiRoleToAppRole()`.

---

## 🔄 Cambiar Contraseñas

Si quieres cambiar las contraseñas de los usuarios de prueba, ejecuta en MySQL:

```sql
UPDATE users 
SET password_hash = '$2y$10$...' -- hash generado con password_hash('TuPassword', PASSWORD_BCRYPT)
WHERE email = 'admin@parce.local';
```

O usa PHP:
```php
echo password_hash('TuPassword', PASSWORD_BCRYPT);
```

---

## ⚠️ Importante

- **NO** subas este archivo a GitHub (ya está en `.gitignore` como `CREDENCIALES.md`)
- Estas son credenciales **locales de desarrollo** — en producción usa valores diferentes
- El backend tiene rate limiting y validaciones — 5 intentos de login fallidos bloquean la IP por 15 minutos
