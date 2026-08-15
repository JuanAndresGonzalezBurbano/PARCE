# P.A.R.C.E.

**P**lataforma de **A**sistencia **R**ápida para **C**onductores en **E**mergencia — plataforma de asistencia vial que conecta clientes con mecánicos cercanos en tiempo real.

## Stack

- **Backend**: PHP 8.2, MVC propio (sin framework), MySQL/MariaDB, sesiones por cookie httpOnly.
- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS.
- **Roles**: cliente, mecánico, administrador/super-administrador (RBAC por middleware de rutas).

## Requisitos previos

- PHP >= 8.2 con la extensión PDO MySQL habilitada (soporte para Argon2id: `password_hash()` con `PASSWORD_ARGON2ID`, viene incluido en PHP 8.2 por defecto).
- MySQL/MariaDB (XAMPP funciona bien en desarrollo).
- [Composer](https://getcomposer.org/).
- Node.js 18+ y npm (para el frontend).

## Instalación desde cero

```bash
# 1. Clonar e instalar dependencias del backend
git clone <url-del-repo>
cd PARCE
composer install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env: como mínimo, confirmar DB_DATABASE/DB_USERNAME/DB_PASSWORD.
# En XAMPP con configuración por defecto, los valores de .env.example ya sirven
# (usuario root, sin contraseña) — solo hace falta crear la base de datos:
```
```sql
CREATE DATABASE parce CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```
```bash
# 3. Ejecutar migraciones
php migrate_run.php migrate
# (alternativa con más funciones — rollback, reset, status con colores):
# php scripts/maintenance/migrate.php migrate

# 4. Poblar datos base (roles + cuentas demo)
php database/seed.php

# 5. Levantar el backend
php -S localhost:8000 -t public public/router.php

# 6. Levantar el frontend (en otra terminal)
cd frontend
npm install
npm run dev
```

El frontend queda en `http://localhost:5173` (Vite) y consume la API en `http://localhost:8000/api` por defecto (configurable vía `VITE_API_URL`/`VITE_API_BASE_URL` en `frontend/.env.local` si se necesita otro backend — no hace falta para desarrollo local estándar). El backend ya acepta CORS desde `localhost:3000`, `5173` y `8080` sin configuración adicional.

### Cuentas de prueba (creadas por `database/seed.php`)

| Email | Contraseña | Rol |
|---|---|---|
| `superadmin@parce.local` | `SuperAdmin123!` | Super Administrador |
| `admin@parce.local` | `Admin123!` | Administrador |
| `customer@parce.local` | `Customer123!` | Cliente |
| `mechanic@parce.local` | `Mechanic123!` | Mecánico |

## Verificar la instalación

```bash
curl http://localhost:8000/api/health
# {"success":true,"data":{"status":"healthy",...}}
```

## Comandos útiles

```bash
# Estado de migraciones
php migrate_run.php status

# Rollback / reset (solo con la herramienta completa)
php scripts/maintenance/migrate.php rollback [pasos]
php scripts/maintenance/migrate.php reset

# Limpieza de logs antiguos (retención por defecto: 30 días)
php scripts/maintenance/cleanup_logs.php [dias]

# Expirar solicitudes pending sin atender (por defecto: 30 minutos)
php scripts/maintenance/expire_pending_requests.php [minutos]

# Limpiar sesiones expiradas (sin esto, la tabla `sessions` crece sin límite)
php scripts/maintenance/cleanup_sessions.php

# Tests del backend (PHPUnit)
composer test

# Lint del frontend
cd frontend && npm run lint

# Build de producción del frontend
cd frontend && npm run build
```

## Documentación adicional

La carpeta [`docs/`](docs/) contiene documentación histórica de arquitectura, API, seguridad y auditorías generada durante el desarrollo del proyecto (organizada por tema: `api/`, `architecture/`, `security/`, `testing/`, etc.). Es útil como referencia de contexto y decisiones pasadas, pero **no se mantiene activamente** — para el estado actual del proyecto, confía primero en el código y en este README.

Para preparar un despliegue de producción, ver [`DEPLOYMENT.md`](DEPLOYMENT.md).

Para deuda técnica conocida y decisiones pendientes del producto, ver [`BACKLOG.md`](BACKLOG.md).

## Estructura del proyecto

```
PARCE/
├── app/
│   ├── Controllers/        # Controladores HTTP
│   ├── Core/                # App, Router, Database, Migration, Seeder, ConfigValidator...
│   ├── Infrastructure/      # Servicios de dominio (Auth, ServiceRequest, Vehicle, Http...)
│   └── Middleware/          # RBAC, CORS, RateLimiter, RequestLogger...
├── config/routes.php        # Definición de rutas
├── database/
│   ├── migrations/          # Migraciones (php migrate_run.php migrate)
│   └── seeders/              # Seeders (php database/seed.php)
├── public/
│   ├── index.php             # Punto de entrada real
│   └── router.php            # Router para el servidor embebido de PHP en desarrollo
├── scripts/
│   ├── maintenance/          # migrate.php, seed_*.php, cleanup_logs.php
│   ├── debugging/, validation/, testing/  # herramientas puntuales de sesiones anteriores
│   └── ...                   # (ver BACKLOG.md — varias tienen rutas rotas, no usadas por el flujo estándar)
├── frontend/                 # React + TypeScript + Vite
├── storage/logs/             # Logs de errores y base de datos, un archivo por día
├── .env.example               # Plantilla de variables de entorno documentada
└── migrate_run.php            # CLI de migraciones (versión simple)
```
