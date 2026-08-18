# P.A.R.C.E.

**P**lataforma de **A**sistencia **R**ápida para **C**onductores en **E**mergencia — plataforma de asistencia vial que conecta clientes con mecánicos cercanos en tiempo real.

## Qué problema resuelve

Un conductor con una emergencia vial (batería, llanta, combustible, avería mecánica, cerrajería, remolque) hoy depende de contactos informales o de esperar en el lugar sin visibilidad de cuándo llegará ayuda. P.A.R.C.E conecta a ese cliente con mecánicos disponibles cercanos a través de una solicitud de servicio con seguimiento de estado, evidencia fotográfica del trabajo realizado y calificación posterior — reemplazando el proceso informal por un flujo estructurado y auditable.

## Funcionalidades actuales (verificadas en código, no aspiracionales)

- **Autenticación y perfiles**: registro (cliente o mecánico), login por sesión, recuperación de contraseña por email, gestión de perfil y licencia de conducción.
- **Vehículos**: alta/edición/baja, vehículo principal, campos informativos de SOAT y Tecnomecánica.
- **Solicitudes de servicio**: creación por el cliente, aceptación/inicio/finalización por el mecánico, cancelación, calificación (general y detallada por puntualidad/calidad), evidencia fotográfica antes/durante/después.
- **PQR**: peticiones, quejas, reclamos y sugerencias con flujo de revisión administrativa.
- **Encuestas de satisfacción** posteriores al servicio.
- **Panel de administración**: métricas agregadas, gestión de PQR y encuestas, listado de calificaciones (todo paginado y filtrable).

**Lo que P.A.R.C.E NO hace hoy** (para no vender de más): sin notificaciones push/email de eventos, sin tracking GPS en tiempo real (solo una captura puntual de ubicación), sin pasarela de pagos, sin aprobación administrativa de mecánicos (el rol se autodeclara al registrarse), sin infraestructura propia de almacenamiento de archivos (las URLs de documentos/evidencia se pegan manualmente). Detalle completo en [Estado actual y limitaciones](#estado-actual-y-limitaciones-conocidas) más abajo.

## Arquitectura

MVC en capas simple, sin framework: `Frontend React → Contexts → Services → config/routes.php → Middleware (CORS/Seguridad/Logging/Auth/RBAC) → Controllers → Infrastructure Services → Validators → Database (PDO) → MySQL`. Sin capa Repository/DAO, sin `app/Modules/`. Documentación completa, generada y verificada directamente contra el código:

- **[`docs/architecture/PARCE_AS_BUILT_ARCHITECTURE.md`](docs/architecture/PARCE_AS_BUILT_ARCHITECTURE.md)** — arquitectura completa (empezar aquí).
- **[`docs/architecture/ERD_AS_BUILT.md`](docs/architecture/ERD_AS_BUILT.md)** — modelo de datos real (11 tablas).
- **[`docs/architecture/uml/`](docs/architecture/uml/)** — 10 diagramas Mermaid por dominio.
- **[`docs/api/API_REFERENCE.md`](docs/api/API_REFERENCE.md)** — las 46 rutas reales, con auth/roles/body/errores.
- **[`docs/architecture/AS_DESIGNED_VS_AS_BUILT.md`](docs/architecture/AS_DESIGNED_VS_AS_BUILT.md)** — qué se diseñó originalmente vs. qué existe hoy.

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

## Estado actual y limitaciones conocidas

P.A.R.C.E es un **MVP funcional y documentado**, no un producto listo para operación comercial. Estado verificado en la auditoría más reciente (branch `Angel`):

- ✅ 134 tests PHPUnit, 0 fallos — pero cobertura exclusiva de validadores/DTOs, **0% en Services/Controllers/Middleware**.
- ✅ Build de frontend limpio; CI (GitHub Actions) corriendo tests + build en cada push.
- ✅ Seguridad de sesión/auth/RBAC/rate-limiting endurecida (ver sección Seguridad abajo).
- ❌ Sin backups automatizados de base de datos.
- ❌ Sin pentesting, sin revisión legal de privacidad, sin política de privacidad ni términos y condiciones visibles al usuario.
- ❌ Sin aprobación administrativa de mecánicos, sin notificaciones, sin tracking en tiempo real, sin pagos.

Checklist completo con evidencia punto por punto: **[`docs/release/RELEASE_READINESS.md`](docs/release/RELEASE_READINESS.md)**.

## Seguridad

- Sesión de servidor + cookie httpOnly (sin JWT); contraseñas con Argon2id; tokens de reseteo de contraseña de un solo uso, hasheados (SHA-256), expiran en 1 hora.
- RBAC por middleware en toda ruta que expone datos de otro usuario; verificación de propiedad (ownership) en cada Service.
- CORS restrictivo (sin wildcard + credenciales), cabeceras de seguridad (CSP, X-Frame-Options, HSTS condicional), rate limiting en endpoints de autenticación.
- Condiciones de carrera cerradas en operaciones concurrentes críticas (aceptar/cancelar/completar solicitud, registro, reseteo de contraseña, unicidad de placa/VIN).
- Sin secretos versionados en Git (verificado); `.env` ignorado, `.env.example` documentado sin credenciales reales.
- Detalle completo: [`docs/security/OPERATIONAL_SECURITY.md`](docs/security/OPERATIONAL_SECURITY.md) y [`docs/security/PRIVACY_AND_DATA_PROTECTION.md`](docs/security/PRIVACY_AND_DATA_PROTECTION.md) (esta última incluye consideraciones sobre la Ley 1581 de 2012 de Colombia — **pendientes de validación jurídica**, no una certificación de cumplimiento).

## Roadmap

Ver [`docs/roadmap/PARCE_ROADMAP_AS_BUILT.md`](docs/roadmap/PARCE_ROADMAP_AS_BUILT.md) — separa explícitamente decisiones de producto pendientes, deuda técnica, funcionalidades pendientes y diseños obsoletos, sin convertir nada en tarea aprobada automáticamente.

## Documentación adicional

La carpeta [`docs/`](docs/) mezcla documentación **AS-BUILT** (fuente de verdad actual — `docs/architecture/`, `docs/roadmap/`, `docs/api/`, `docs/security/`, `docs/release/`) con documentación **histórica** de arquitectura, API y auditorías generada durante el desarrollo del proyecto. La histórica es útil como referencia de contexto y decisiones pasadas, pero **no se mantiene activamente** y en varios puntos ya no corresponde al código real — ver [`docs/architecture/README.md`](docs/architecture/README.md) para el mapa completo de qué documento es cuál.

Otros documentos relevantes en la raíz: [`THIRD_PARTY.md`](THIRD_PARTY.md) (dependencias y licencias, verificadas desde los metadatos reales de los paquetes instalados), [`CHANGELOG.md`](CHANGELOG.md), [`SECURITY.md`](SECURITY.md) (política de reporte de vulnerabilidades).

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
