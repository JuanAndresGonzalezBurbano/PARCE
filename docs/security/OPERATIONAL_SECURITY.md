# P.A.R.C.E — Seguridad operacional (AS-BUILT)

> Documenta el estado real de backups, gestión de secretos, logs, sesiones, incidentes, recuperación y despliegue. Donde no existe infraestructura real, se documenta explícitamente como **pendiente** — no se inventan servidores, contenedores ni servicios en la nube que no existen en este repositorio.

## 1. Backups

**Estado real: no hay backups automatizados.** Se encontraron backups manuales puntuales en la raíz del repositorio (`backup_pre_refactor.sql`, `backup_pre_refactor_20260611_204423.sql`), correctamente excluidos de Git por `.gitignore` (patrón `backup_*.sql`), tomados manualmente antes de operaciones de riesgo puntuales (ej. el intento de reestructuración modular). No existe:
- Backup programado (cron/servicio) de la base de datos.
- Backup fuera de sitio (offsite) o versionado de backups.
- Prueba de restauración documentada.

**Pendiente.**

## 2. Gestión de secretos

- Los secretos (`RESEND_API_KEY`, credenciales de BD) se gestionan vía `.env` (no versionado, confirmado en esta auditoría — ver hallazgos de seguridad del informe principal).
- No hay gestor de secretos dedicado (Vault, AWS Secrets Manager, etc.) — es un `.env` de archivo plano, apropiado para el estado actual (desarrollo/demo) pero **no apto tal cual para un entorno de producción con múltiples operadores**.
- `MailerService` falla de forma segura (silenciosa, sin romper el flujo) si `RESEND_API_KEY` no está configurada — buen patrón de resiliencia ya implementado.

## 3. Logs

- `storage/logs/error-{fecha}.log`: errores de aplicación, sin argumentos de función (evita filtrar secretos/contraseñas en trazas).
- `storage/logs/requests.log`: log de peticiones HTTP (JSON Lines) — timestamp, requestId, método, path, status, duración, IP, user agent.
- `storage/logs/database-{fecha}.log`: mencionado en el diseño de infraestructura de BD (`.kiro/specs/database-infrastructure-layer/design.md`) — **no confirmado si el logging real de queries está activo en el código actual** (requiere verificación adicional, no realizada en esta pasada).
- Retención: `scripts/maintenance/cleanup_logs.php`, por defecto 30 días, ejecución manual o vía cron externo (no hay cron configurado dentro del propio repositorio, es responsabilidad del entorno de despliegue).
- Correlación de logs vía `X-Request-Id` (mencionado en `git log`, commit `3521884 feat(observability): correlate error logs, request logs, and client via X-Request-Id`) — mecanismo de trazabilidad ya implementado.

## 4. Sesiones

- Sesiones persistidas en la tabla `sessions` (no en archivos de sesión de PHP nativos para el estado de aplicación — aunque `app/Core/Session.php` sí envuelve la sesión PHP nativa para otros usos).
- Limpieza de sesiones expiradas: `scripts/maintenance/cleanup_sessions.php`, ejecución manual o cron externo — sin esto, la tabla crece indefinidamente (advertencia ya presente en el propio `README.md`).
- Regeneración anti-fijación de sesión implementada (`SessionManager::shouldRegenerate()`).
- Reseteo de contraseña y cambio de contraseña destruyen todas las sesiones activas del usuario (`destroyAllUserSessions()`).

## 5. Gestión de incidentes

**No existe un procedimiento de respuesta a incidentes documentado.** No hay:
- Runbook de incidentes de seguridad.
- Canal/proceso definido para reportar una vulnerabilidad (`SECURITY.md` no encontrado en la raíz del repositorio).
- Alertas automatizadas ante anomalías (múltiples fallos de login, picos de rate-limit, etc. — el `RateLimiter` bloquea pero no notifica).

**Pendiente.**

## 6. Recuperación ante desastres

**No existe un plan de recuperación ante desastres.** Sin backups automatizados (§1), no hay objetivo de punto de recuperación (RPO) ni objetivo de tiempo de recuperación (RTO) definidos. **Pendiente.**

## 7. Despliegue

- El repositorio incluye `DEPLOYMENT.md` (referenciado desde `README.md`) para preparar un despliegue — no auditado línea por línea en esta pasada, pero su existencia está confirmada.
- Entorno de desarrollo real: XAMPP local (PHP embebido `php -S`, MySQL/MariaDB local, Vite dev server).
- **No existe Docker, Kubernetes, ni configuración de despliegue en la nube (AWS/Azure/GCP) en este repositorio** — cualquier mención de estas tecnologías en documentación futura debe tratarse como propuesta, no como estado actual.
- CI existente (`.github/workflows/ci.yml`) ejecuta tests y build en cada push/PR, pero **no despliega** — es solo integración continua, no entrega continua.

## 8. Resumen de pendientes de seguridad operacional

| Área | Estado |
|---|---|
| Backups automatizados | ❌ Pendiente |
| Prueba de restauración | ❌ Pendiente |
| Gestor de secretos dedicado | ❌ Pendiente (uso de `.env` es aceptable para el estado actual) |
| Runbook de incidentes | ❌ Pendiente |
| Alertas de seguridad automatizadas | ❌ Pendiente |
| Plan de recuperación ante desastres | ❌ Pendiente |
| Despliegue automatizado (CD) | ❌ Pendiente (CI sí existe) |
| Infraestructura cloud/contenedores | ❌ No existe (fuera del alcance actual del repositorio) |

**Fuente:** `.gitignore`, `scripts/maintenance/*.php`, `.github/workflows/ci.yml`, `README.md`, git log, verificación directa de ausencia de Docker/CI de despliegue en el repositorio.
