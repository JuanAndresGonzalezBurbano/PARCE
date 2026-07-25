# Despliegue a producción — P.A.R.C.E

Checklist específico de este proyecto, con nombres de variables y comandos verificados
contra el código actual. Para una lista más exhaustiva de infraestructura genérica
(balanceador de carga, CDN, monitoreo APM, etc.) ver también
[`docs/testing/PRODUCTION_CHECKLIST.md`](docs/testing/PRODUCTION_CHECKLIST.md) — es más
antigua y algunos nombres de variables ahí están desactualizados, así que en caso de
conflicto **este archivo manda**.

## 1. Variables de entorno (`.env`)

Partir de `.env.example` y ajustar como mínimo:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://tu-dominio.com

DB_HOST=<host-real>
DB_DATABASE=<db-real>
DB_USERNAME=<usuario-dedicado-no-root>
DB_PASSWORD=<contraseña-fuerte>

CORS_ALLOWED_ORIGINS=https://tu-frontend.com
CORS_ALLOW_CREDENTIALS=true

SESSION_COOKIE_SECURE=true
SESSION_COOKIE_SAMESITE=Strict
```

Notas importantes (ya verificadas en código, no solo documentadas):
- `APP_DEBUG` por defecto es `false` si se omite (`App::loadConfiguration()`) — pero
  **no confíes en el default, ponlo explícito**. Con `true` en producción, las respuestas
  de error incluyen mensaje, archivo, línea y traza completa (`App::handleException()`).
- Si `CORS_ALLOWED_ORIGINS` no se define, `CORSMiddleware` cae a un default de solo
  `localhost:3000/5173/8080` — el frontend de producción quedará bloqueado por CORS
  hasta que se configure esta variable explícitamente.
- `.env` **nunca** debe commitearse. Ver el incidente documentado en `BACKLOG.md`
  (API key expuesta en `origin/main`) antes de asumir que esto ya está garantizado en
  todas las ramas del repo — revísalo tú mismo antes del primer despliegue.

## 2. Base de datos

```bash
CREATE DATABASE parce CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

```bash
php migrate_run.php migrate
php database/seed.php   # Solo si necesitas roles base / cuenta admin inicial —
                          # revisa database/seeders/AdminUserSeeder.php y usa
                          # credenciales propias en producción, no las de demo.
```

`DemoUsersSeeder` crea cuentas con contraseñas conocidas (`Customer123!`,
`Mechanic123!`) — pensadas para desarrollo/QA. **No las dejes activas en producción**;
si `database/seed.php` se corrió completo, elimina o desactiva esas cuentas después.

## 3. Backend

- Servir `public/` como document root (Apache/Nginx), nunca la raíz del proyecto —
  así el resto del código (`.env`, `app/`, `vendor/`) queda fuera del alcance de
  peticiones HTTP directas.
- PHP: `display_errors=Off`, `log_errors=On`, `expose_php=Off`.
- Confirmar permisos de escritura en `storage/logs/` para el usuario del servidor web.

## 4. Frontend

```bash
cd frontend
npm install
npm run build
```

Sirve el contenido generado en `frontend/dist/` como sitio estático (Nginx, CDN, etc.),
apuntando `VITE_API_URL`/`VITE_API_BASE_URL` (variables de build de Vite, se
configuran antes de `npm run build`, no en runtime) al dominio real del backend.

## 5. Logs

La app escribe un archivo de log por día en `storage/logs/`
(`error-YYYY-MM-DD.log`, `database-YYYY-MM-DD.log`) sin rotación automática. Programa
una tarea periódica:

```bash
# Cron diario a las 3am — borra logs con más de 30 días
0 3 * * * php /ruta/a/parce/scripts/maintenance/cleanup_logs.php 30 >> /ruta/a/parce/storage/logs/cleanup.log 2>&1
```

## 5.1. Expiración automática de solicitudes pendientes

Una solicitud `pending` que nadie acepta nunca cambia de estado por sí sola —
`service_requests.expired_at` existe en el esquema pero nada lo establece salvo
que se programe esta tarea:

```bash
# Cada 5 minutos — marca como 'expired' las solicitudes pending con más de 30 min
0,5,10,15,20,25,30,35,40,45,50,55 * * * * php /ruta/a/parce/scripts/maintenance/expire_pending_requests.php 30 >> /ruta/a/parce/storage/logs/expire_requests.log 2>&1
```

## 6. Verificación post-despliegue

```bash
curl https://tu-dominio.com/api/health
curl https://tu-dominio.com/api/health/database
curl https://tu-dominio.com/api/health/system
```

Las tres deben responder `200` con `"status":"healthy"`. Estos tres endpoints son
públicos (sin autenticación, pensados para balanceadores/monitoreo) y ya están
verificados para no filtrar detalles internos (driver, host, rutas de archivo) —
solo exponen estado y tiempo de respuesta.

## 7. Fuera de alcance de este documento

Balanceo de carga, HTTPS/TLS, CDN, monitoreo APM externo, backups automatizados de
base de datos, y escalado horizontal son decisiones de infraestructura que dependen
del proveedor de hosting elegido — no están codificados en este proyecto. Ver
`docs/testing/PRODUCTION_CHECKLIST.md` para una checklist genérica de referencia sobre
esos temas.
