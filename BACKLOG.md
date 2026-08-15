# P.A.R.C.E — Backlog

Ítems fuera de alcance de la sesión actual porque implican una decisión de producto,
un módulo nuevo, o un cambio de arquitectura que debe decidir el usuario antes de
construirse. No bloquean el trabajo en curso.

## 🔴 ACCIÓN URGENTE — Secreto expuesto en GitHub (2026-07-16)

**Una API key real está actualmente activa (no solo en historial) en `origin/main`**,
la rama por defecto del repositorio en GitHub (`github.com/JuanAndresGonzalezBurbano/PARCE`):

```
VITE_GROQ_API_KEY=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
```

Introducida en el commit `16b2a07` ("Add .env with API key", autor juanalba,
2026-06-02), que además removió `.env` de `.gitignore` momentáneamente.

**Dónde está confirmado presente ahora mismo** (archivo `.env` trackeado, no solo
en un commit viejo):
- `main` (local)
- `origin/main` — **la rama por defecto que ve cualquiera que visite el repo**
- `origin/Soto`

**Dónde NO está** (confirmado limpio): `Angel` (esta rama), `origin/Angel`,
`refactor/modular-architecture`, `origin/Duvan`, `origin/Juan`, `origin/sebastian`.

No se encontró ninguna referencia a `VITE_GROQ_API_KEY` en el código actual —
parece una integración abandonada, no algo que la app use hoy.

**Acciones recomendadas, en orden:**
1. **Revoca/rota la clave en tu cuenta de Groq ahora mismo** — es la única acción
   que realmente neutraliza el riesgo, sin importar qué se haga después con git.
   Ningún cambio en el historial deshace una exposición que ya ocurrió si el repo
   fue clonado, forkeado, o indexado por algún bot de escaneo de secretos de GitHub.
2. Elimina `.env` de `main` con un commit normal (`git rm .env`, luego push).
3. Decide si necesitas reescribir el historial de `main`/`origin/Soto` para
   purgar el secreto de commits viejos también — esto requiere `force-push` a
   `origin/main`, lo cual **romperá los clones locales de Duvan/Juan/Soto/sebastian**
   si tienen `main` descargado. Coordina con ellos antes de hacerlo.
4. Verifica que `.env` esté en `.gitignore` en todas las ramas (ya lo está en
   `Angel`).

No se tocó `main` ni ninguna rama de otro colaborador ni se hizo ningún push —
se dejó esta decisión completamente en tus manos por el impacto que tiene sobre
el trabajo del resto del equipo.

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

### 4. Recuperación de contraseña ("olvidé mi contraseña")
No existe ningún flujo de reseteo de contraseña — ni endpoint backend, ni
página frontend. Es una funcionalidad estándar esperada en cualquier sistema
de autenticación de producción, pero implementarla de forma real (generar
token, invalidar tras uso/expiración, enviar el enlace) requiere enviar un
correo — y el proyecto **no tiene ninguna infraestructura de email**
(sin PHPMailer/Symfony Mailer, sin configuración SMTP, sin proveedor
transaccional tipo SES/SendGrid/Mailgun en `.env.example`). Requiere decisión
del usuario sobre el proveedor/estrategia de envío de correo antes de
construirse — mismo tipo de dependencia de infraestructura que el ítem 3.

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
  migraciones.
- **Nada está commiteado a git** desde `a52cf6b` (2026-06-27). Todo el módulo
  PQR/Survey/Admin, todos los fixes de E2E, y todo lo de esta sesión de
  "modo producción" son cambios sin commitear en el working tree. Recomendado
  organizar en commits lógicos antes de seguir acumulando cambios.
- **PHPUnit**: sin tests automatizados para `AuthService`/`ServiceRequestService`/
  `VehicleService`. Cuanto más crece el backend, más valioso se vuelve tener
  cobertura de los flujos de estado (pending→assigned→in_progress→completed) y
  las reglas de negocio (una solicitud activa por cliente/vehículo, transiciones
  inválidas, etc.) que ya se rompieron una vez silenciosamente.
- **Notificaciones en tiempo real**: mecánicos ven solicitudes nuevas solo al
  recargar/hacer polling manual. Un WebSocket o polling automático es una mejora
  de UX significativa pero es una pieza de infraestructura nueva (alcance propio).
- **15 scripts en `scripts/{debugging,maintenance,testing,validation}/` están
  rotos por la misma causa que tenía `scripts/maintenance/migrate.php` (ya
  corregido, ver commit `fix(scripts): correct BASE_PATH...`)**: usan
  `require_once __DIR__ . '/vendor/autoload.php'` con `__DIR__` apuntando a su
  propia carpeta anidada en vez de la raíz del proyecto — fallan de inmediato
  al ejecutarse. Afecta a todo `scripts/debugging/*.php`, la mayoría de
  `scripts/maintenance/*.php` (excepto `migrate.php`, ya arreglado) y
  `scripts/validation/*.php`. No se corrigieron individualmente porque son
  ayudas de depuración/validación puntuales de sesiones anteriores, no parte
  del flujo de instalación/despliegue documentado en `README.md` — pero si
  alguno resulta útil, el fix es el mismo de una línea (`define('BASE_PATH',
  dirname(__DIR__, 2));` en vez de `__DIR__` directo en el `require_once`).
  `scripts/testing/test_auth_integration.php` y `scripts/testing/test_cors.php`
  no tienen este problema (no dependen del autoloader, hablan por HTTP/curl
  contra un servidor ya corriendo).
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
