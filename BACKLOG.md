# P.A.R.C.E — Backlog

Ítems fuera de alcance de la sesión actual porque implican una decisión de producto,
un módulo nuevo, o un cambio de arquitectura que debe decidir el usuario antes de
construirse. No bloquean el trabajo en curso.

## 🟡 Secreto expuesto en GitHub — PARCIALMENTE RESUELTO (2026-07-16, remediado 2026-08-18)

~~Una API key real estaba activa en `origin/main`~~ **La key ya fue rotada por el
humano (2026-08-18) y `.env` fue destrackeado + agregado a `.gitignore` en `main`
(commit `5431c23`) y `Soto` (commit `ba5fd88`), ambos pusheados.** Detalle completo,
incluido lo que sigue **sin resolver** (el historial de git de `main`/`Soto` no se
reescribió — el valor ya inválido de la key sigue siendo recuperable en commits viejos
—, y un hallazgo nuevo: `origin/frontend+backend`, fuera del equipo, expone su propio
`.env` completo con `DB_PASSWORD` incluido, sin remediar por decisión explícita de no
tocar esa rama) está en `docs/architecture/DECISIONS.md` (ADR-13, sección "Registro de
incidentes de seguridad") — **no reportar este punto como resuelto al 100% sin leer esa
distinción primero.**

## Decisiones pendientes del usuario

### 1. `vehicle_documents` / `vehicle_maintenance_records` — ¿migrar o descartar?
Existen dos tablas bien diseñadas (`vehicle_documents`: documentos por tipo con
número/emisor/vencimiento/URL; `vehicle_maintenance_records`: historial de
mantenimiento) creadas por una sesión anterior, con FKs y índices correctos, pero
**ningún controlador las usa**. Mientras tanto `VehicleController` sigue usando
columnas planas en `vehicles` (`soat_expiration_date`, etc. — restauradas en
`2026_07_10_000015` tras encontrarlas rotas). Dos caminos:
- (a) Dejar las columnas planas como están (ya funcionan) y eventualmente eliminar
  las tablas nuevas si no se van a usar.
- (b) Migrar `VehicleController`/`VehicleForm` para usar `vehicle_documents` como
  fuente de verdad (permite múltiples documentos por vehículo, historial de
  versiones) y `vehicle_maintenance_records` para una nueva pantalla de
  mantenimiento — esto sí es un módulo nuevo con alcance propio.
Requiere decisión del usuario antes de tocar código.

### 2. Tabla `ratings` — sistema de calificación bidireccional sin usar
Existe una tabla `ratings` (rating_type: `customer_to_mechanic` / `mechanic_to_customer`,
con `punctuality_score`/`quality_score`, UNIQUE por solicitud+tipo) construida por una
sesión anterior, pero **ningún controlador la usa** — el sistema de calificación real
sigue siendo las columnas `customer_rating`/`punctuality_rating`/`service_quality_rating`
en `service_requests` (solo cliente→mecánico, ya funcional y probado end-to-end). La
tabla `ratings` sugiere que se planeó (o se empezó a construir) que el mecánico también
pudiera calificar al cliente — funcionalidad que hoy no existe en ningún flujo de UI.
Antes de construir un flujo "mecánico califica al cliente" (pantalla nueva, endpoint
nuevo, cambio en la finalización del servicio), confirmar con el usuario si es un
requisito real del alcance del proyecto.

### 3. Upload real de archivos (fotos/documentos)
Todo el proyecto usa URLs pegadas a mano (SOAT, licencia de conducción, evidencias)
en vez de subida real de archivos — es el diseño actual, consistente en toda la app,
no un bug. Construir upload real (backend de almacenamiento tipo S3/local disk +
endpoints multipart) es un módulo nuevo con implicaciones de infraestructura
(¿dónde se guardan los archivos?, ¿límites de tamaño?, ¿CDN?) — requiere decisión
del usuario sobre la estrategia de almacenamiento antes de implementarse.

### 4. ~~Recuperación de contraseña ("olvidé mi contraseña")~~ — Resuelto
Implementado por completo: `PasswordResetService` + `MailerService` (Resend HTTP API),
endpoints `POST /api/auth/forgot-password` y `POST /api/auth/reset-password`, token
aleatorio de 32 bytes con solo su hash SHA-256 persistido (`password_reset_tokens.token_hash`),
TTL de 1 hora, destrucción de todas las sesiones del usuario al completar el reset, y
respuesta anti-enumeración genérica cuando el email no existe. Cobertura: `PasswordResetServiceTest`
(4 tests unitarios, PDO mockeado, ver commit `fea948d`). Ver
`docs/architecture/PARCE_AS_BUILT_ARCHITECTURE.md` §1.8 (puntos 5-7) para el detalle completo.

### 6. ~~Expiración automática de solicitudes pendientes~~ — Resuelto 2026-07-25
Decisión de negocio ya tomada: 30 minutos, procesada por cron job dedicado
(no chequeo perezoso). Implementado en
`scripts/maintenance/expire_pending_requests.php` — marca como `expired`
toda solicitud `pending` con `requested_at` de más de N minutos, vía UPDATE
condicional atómico (mismo patrón de `accept()`/`cancel()`/etc.). Documentado
en `DEPLOYMENT.md` y `README.md`. No incluye reintento de notificación a
otros mecánicos — si eso se necesita en el futuro, es una funcionalidad
nueva, no parte de este alcance.

### 5. ~~Vista de evidencias para el cliente~~ — Resuelto 2026-07-10
Implementado: `EvidenceUpload` ahora soporta `readOnly`, y `RequestsPage.tsx`
(cliente) tiene un toggle "Ver evidencias" por solicitud. Ver commit
`feat(requests): add read-only evidence view for customers`.

## Deuda técnica documentada (no bloquea, baja prioridad)

- **Migraciones históricas no reconstruidas al 100%**: las migraciones de las
  tablas `vehicle_documents`, `vehicle_maintenance_records`, `ratings` y los
  cambios técnicos de `vehicles` (batches 9-12, corridas 2026-07-05) nunca se
  reconstruyeron como archivos — se investigó su esquema vía `SHOW CREATE TABLE`
  para diagnosticar el bug de SOAT (ver `2026_07_10_000015`), pero no se
  recrearon sus migraciones originales porque no aportan valor inmediato (las
  tablas ya existen y están correctamente creadas en la BD real). Si en algún
  momento se necesita levantar el proyecto desde cero en otra máquina, ejecutar
  un dump de esquema (`mysqldump --no-data`) como respaldo adicional a las
  migraciones. **Relacionado:** `2026_07_10_000015` además colisiona (`Column
  already exists`) sobre una BD *completamente fresca* — causa raíz y workaround
  exacto documentados en `docs/architecture/DECISIONS.md` (ADR-14).
- ~~**PHPUnit**: sin tests automatizados para `AuthService`/`ServiceRequestService`/`VehicleService`~~
  — Resuelto 2026-08-19 (commit `fea948d`). Los 4 servicios de mayor riesgo
  (`AuthService`, `ServiceRequestService`, `VehicleService`, `PasswordResetService`)
  ahora tienen 45 tests unitarios con PDO mockeado (`App\Core\Database::setConnection()`,
  seam aditivo nuevo), enfocados en invariantes de negocio: doble asignación de mecánico
  perdiendo la carrera, guards de transición de estado, unicidad de placa/VIN vía locks
  nombrados de MySQL, SOAT/Tecnomecánica vencidos confirmados como no bloqueantes, hash
  SHA-256 del token de reset, destrucción de sesiones al resetear. **Sigue sin cobertura**
  (no reclamado como resuelto): ningún Controller, ningún Middleware, ni `SessionManager`/
  `AdminService`/`PQRService`/`SurveyService`/`ServiceRequestEvidenceService` directamente.
- **Notificaciones en tiempo real**: mecánicos ven solicitudes nuevas solo al
  recargar/hacer polling manual. Un WebSocket o polling automático es una mejora
  de UX significativa pero es una pieza de infraestructura nueva (alcance propio).
- ~~**15 scripts en `scripts/{debugging,maintenance,testing,validation}/` rotos por BASE_PATH**~~
  — La causa original (`__DIR__` apuntando a la carpeta anidada en vez de la raíz)
  **ya no existe**: verificado el 2026-08-19 leyendo los 22 scripts no-HTTP uno por uno —
  los 22 ya usan `define('BASE_PATH', dirname(__DIR__, 2))` (o el equivalente inline)
  correctamente. Este ítem estaba desactualizado, probablemente arreglado en una sesión
  anterior sin actualizar este archivo.
  **Hallazgo nuevo real, sin relación con BASE_PATH**: varios de esos mismos scripts
  (`scripts/debugging/*`, `scripts/maintenance/automated_validation.php`,
  `scripts/validation/validate_database_structure.php`, `validate_service_requests.php`,
  `validate_vehicles.php`, `verify_final_status.php`, `scripts/testing/test_session_hardening.php`)
  fallan igualmente al ejecutarse hoy, pero por una causa distinta: el `.env` real en disco
  (`Angel`, sin trackear) solo contiene la línea `VITE_GROQ_API_KEY` — ninguna variable
  `DB_*`/`SESSION_*`/`APP_ENV` — y estos scripts parsean `.env` a mano con `$env['DB_DATABASE'] ?? ''`
  (cadena vacía, no `'parce'`) o leen `$_ENV[...]` directamente sin *fallback*, a diferencia de
  `App\Core\App.php` (que sí sigue funcionando porque cada `env()` tiene su propio valor por
  defecto correcto para XAMPP local). Resultado: `SQLSTATE[3D000]: No database selected` o
  `Undefined array key`. **No corregido** — mezclar esto con el fix de BASE_PATH habría sido
  exactamente el tipo de mezcla de hallazgos que no se debe hacer sin preguntar primero.
  Además, `scripts/validation/validate_vehicle_domain.php` no usa el patrón `BASE_PATH` en
  absoluto — tiene su propio autoloader `App\` casero apuntando a `__DIR__ . '/app/'` (una
  ruta que no existe desde `scripts/validation/`) y su propia carga de `.env` vía
  `__DIR__ . '/.env'` — un bug distinto y más grande que un fix de una línea, tampoco corregido.
  Sí confirmados corriendo limpio contra la BD real: `cleanup_logs.php` (borró 12 logs viejos),
  `cleanup_sessions.php` (borró 8 sesiones expiradas), `expire_pending_requests.php` (0 solicitudes
  que expirar), `migrate.php` (comando `help`), `validate_dtos.php`, `validate_password_hasher.php`.
  No se ejecutaron contra la BD real (mutan datos reales sin limpieza garantizada, o ya tenían
  un bug propio) — verificados solo por lectura de código + `php -l`: `seed_service_requests_only.php`
  (inserta filas de servicio sin limpieza), `validate_session_manager.php` (crea 5 usuarios
  `testuser1-5@example.com` permanentes sin limpieza), `test_database_integrity.php` (crea y
  borra un usuario de prueba dentro de una transacción — más cauteloso no arriesgar), y
  `fix_assign_customer_roles.php`, que además tiene un bug real separado: llama a
  `Database::update('user_roles', ['is_active' => 1], ['id' => $existingRole['id']])` pasando
  un **array** como tercer argumento (`$where`) cuando la firma real exige un **string** — el
  mismo patrón de bug ya encontrado y corregido antes en `AuthController::profile()`. No corregido
  aquí, reportado aparte.
- ~~**Paginación**~~ — Resuelto 2026-08-15 (backend + frontend). Los tres
  listados admin-wide sin acotar por usuario (`GET /api/admin/ratings`,
  `GET /api/admin/pqr`, `GET /api/admin/surveys` — los que de verdad crecen sin
  límite con el uso de la plataforma, a diferencia de los listados por-usuario
  como `getCustomerRequests`/`getUserPqrs`, naturalmente acotados a la
  actividad de una sola persona) aceptan `?page=&per_page=` (por defecto 50,
  máx 200) vía `RequestValidator::parsePagination()`, con
  `total`/`page`/`perPage`/`totalPages` en la respuesta (cambio de contrato
  aditivo). El frontend (`AdminPQRPage`, panel de calificaciones, panel de
  encuestas) ya integra un componente `Pagination` compartido
  (Anterior/Siguiente, indicador de página, total) vía `AdminContext`, con
  filtros/búsqueda conservados al cambiar de página y reseteo automático a
  página 1 al aplicar un filtro nuevo. Verificado en navegador real con 61
  tickets PQR (2 páginas). Ver commit `feat(admin): integrate backend
  pagination into ratings/PQR/surveys pages`.

- ~~`node_modules` está trackeado en git~~ — Resuelto 2026-07-16. También se
  encontró y corrigió el mismo problema en `frontend/dist/` (build output) y
  `storage/rate_limit.json` (estado runtime del rate limiter). Los tres se
  desvincularon de git (`git rm --cached`, archivos intactos en disco) y se
  agregaron a `.gitignore`. Ver commit `chore(git): stop tracking
  generated/runtime files`.

## Limpieza de higiene de repositorio en la raíz — 2026-07-16

Se encontraron y eliminaron de git varios archivos de scratch/testing que llevaban
tiempo trackeados en la raíz del repo:

- **Eliminados de git y del disco** (ruido histórico o scripts ad-hoc sin valor
  permanente, recuperables de `git log` si algún día se necesitan): `-w` (artefacto
  de curl), `DOCUMENTATION_STRUCTURE_REPORT.md`, `FINAL_PUSH_REPORT.md`,
  `MERGE_REPORT.md`, `PRE_COMMIT_VALIDATION.md`, `REPOSITORY_STRUCTURE_REPORT.md`
  (los 5 son reportes de eventos puntuales de 2025-06-19/2026-06-19 — una
  reorganización de documentación, un merge, un push, una validación pre-commit —
  ya cubiertos por el historial real de git; no son documentación viva y no están
  duplicados por nombre en `docs/`), `service_requests_validation.php` (script
  manual de validación vía curl con credenciales demo hardcodeadas, mismo patrón
  que los scripts `*_temp.php` ya usados y borrados durante esta sesión).
- **Desvinculados de git pero dejados intactos en disco** (contienen datos
  sensibles reales — tokens de sesión, hashes de contraseña Argon2id, PII — se
  prefirió no borrarlos del disco sin que el usuario lo decida explícitamente):
  `cookies.txt`, `cookies_mech.txt`, `cookies_mech_test.txt`,
  `backup_pre_refactor.sql`, `backup_pre_refactor_20260611_204423.sql`,
  `test_login.json`, `test_register.json`. **Si no los necesitas, bórralos
  manualmente del disco** — ya no se pueden volver a trackear por accidente
  gracias a los nuevos patrones en `.gitignore` (`cookies*.txt`, `backup_*.sql`,
  `test_*.json`).
- **`migrate_run.php`**: se corrigió su docblock, que decía incorrectamente
  "Temporary... Delete after use" — en realidad es la herramienta real y
  necesaria para correr migraciones (confirmada en uso durante toda la sesión,
  sin alternativa mejor disponible). Ya no se recomienda borrarlo.
- **`AI_CONTEXT_PARCE.md`** (91KB, fechado 2026-01-11, desactualizado) — se dejó
  intacto sin tocar. Es ambiguo si todavía aporta valor como contexto para
  agentes de IA o si es puro ruido histórico; queda a tu criterio decidir si
  actualizarlo, archivarlo en `docs/`, o eliminarlo.
