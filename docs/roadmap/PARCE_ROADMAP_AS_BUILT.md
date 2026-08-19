# P.A.R.C.E — Roadmap AS-BUILT

> Este roadmap **no convierte automáticamente elementos pendientes en tareas de implementación.** Se separan en cuatro categorías con naturaleza distinta: decisiones de producto (requieren que alguien decida, no que alguien investigue), deuda técnica, funcionalidades pendientes de construir, y diseños obsoletos que primero requieren una decisión arquitectónica antes de considerarse "por implementar".
>
> Fuente: [`../architecture/PARCE_AS_BUILT_ARCHITECTURE.md`](../architecture/PARCE_AS_BUILT_ARCHITECTURE.md) y [`../architecture/AS_DESIGNED_VS_AS_BUILT.md`](../architecture/AS_DESIGNED_VS_AS_BUILT.md).

---

## A. Decisiones de producto pendientes

Ninguna de estas requiere más investigación técnica — todas requieren que el equipo/producto decida.

~~1. ¿Mecánico autodeclarado o aprobación administrativa?~~ **Resuelto e implementado.** El registro público ya solo crea `customer`; el rol `mechanic` se obtiene vía `MechanicApplicationService` (solicitud + aprobación administrativa, con `administrator`/`super_admin` explícitamente excluidos de poder solicitarlo), reutilizando `admin_access_requests` sin migraciones nuevas. Ver `PARCE_AS_BUILT_ARCHITECTURE.md` §1.17 y `AS_DESIGNED_VS_AS_BUILT.md` (fila "Admin Access", ahora "Implementado"). Movido a la sección "Funcionalidades implementadas" abajo — ya no es una decisión pendiente.
2. **¿Rating bidireccional (mecánico → cliente)?** Hoy solo existe Cliente → Mecánico (`customer_rating`, `punctuality_rating`, `service_quality_rating`). No hay columna ni endpoint en sentido inverso.
3. **Infraestructura real de subida de archivos.** Hoy `soat_document_url`, `driver_license_document_url`, `image_url` (evidencias) son `VARCHAR` validados solo como URL bien formada — el usuario pega un enlace externo manualmente. No hay integración con S3/Cloudinary/almacenamiento propio.
4. **¿Qué hacer con el diseño de `vehicle_documents`/`vehicle_maintenance_records`?** Nunca se crearon como tablas; el caso de uso que iban a cubrir (SOAT/Tecnomecánica) ya se resolvió de otra forma (columnas directas en `vehicles`). Hay que decidir si se descartan formalmente del backlog o si aún cubren algo distinto (p. ej. mantenimientos).
5. **¿Se valida el vencimiento de SOAT/Tecnomecánica como condición de bloqueo?** Hoy es puramente informativo — un vehículo con documentos vencidos puede seguir usándose en solicitudes de servicio sin restricción.

---

## Funcionalidades implementadas (desde la auditoría AS-BUILT inicial)

1. **Flujo de solicitud de rol de mecánico (resuelve A.1).** El registro público ya solo crea `customer`. El rol `mechanic` se obtiene mediante `POST /api/mechanic-applications` (solicitud, requiere licencia de conducción completa y vigente) seguido de revisión administrativa (`POST /api/admin/mechanic-applications/{id}/approve|reject`), reutilizando la tabla `admin_access_requests` ya existente — **sin migraciones nuevas**. Incluye anti-IDOR, anti-autoaprobación, exclusión explícita de `administrator`/`super_admin` como solicitantes, y los locks `SELECT ... FOR UPDATE` habituales del resto del codebase para las condiciones de carrera de aprobar/rechazar/cancelar. Cobertura: 32 tests de integración contra BD real (incl. una prueba real de concurrencia multi-proceso) + tests unitarios de `MechanicApplicationValidator`. Ver `../architecture/PARCE_AS_BUILT_ARCHITECTURE.md` §1.17, `../architecture/AS_DESIGNED_VS_AS_BUILT.md` (fila "Admin Access") y `../architecture/DECISIONS.md` (ADR-5, reemplazada).

---

## B. Deuda técnica

1. **Cobertura de tests unitarios de `*Service.php` — 0%** (con una excepción). Los 150 tests unitarios existentes (verificados en ejecución real, 0 fallos) cubren únicamente `*Validator`/DTOs. `AuthService`, `SessionManager`, `ServiceRequestService`, `VehicleService`, `PQRService`, `SurveyService`, `AdminService`, `ServiceRequestEvidenceService`, `PasswordResetService` no tienen ningún test unitario. **Excepción:** `MechanicApplicationService` sí tiene cobertura real, pero vía 32 tests de integración contra una BD MySQL aislada (`tests/Integration/`, opt-in, no conectada a `composer test` ni a CI — ver `../architecture/PARCE_AS_BUILT_ARCHITECTURE.md` §1.16.2), no vía tests unitarios con mocks.
2. **Cobertura de Controllers — 0%.**
3. **Cobertura de Middleware — 0%** (`AuthMiddleware`, `RBACMiddleware`, `CORSMiddleware`, `SecurityHeadersMiddleware`, `RequestLoggerMiddleware`).
4. **Documentación de módulos existentes sin ningún documento previo:** PQR, Encuestas, Admin dashboard real, Evidencias, Password Reset/Mail — los 5 dominios más recientes y con más código son, a la vez, los 5 con cero documentación arquitectónica hasta la creación de este set de documentos.
5. **Inconsistencias documentales activas:** ver `AS_DESIGNED_VS_AS_BUILT.md` completo — en particular, los checkboxes de `.kiro/specs/authentication-api-layer/tasks.md` y `mvc-folder-structure/tasks.md` no reflejan el estado real del código.
6. **Deriva de esquema no explicada:** las migraciones `2026_07_10_000011` y `2026_07_10_000015` existen para *restaurar* columnas (SOAT/Tecnomecánica/ratings) que en algún momento desaparecieron de una base de datos viva sin que exista, en el repositorio actual, una migración que documente quién/qué las eliminó.
7. **Dos mecanismos de sembrado de datos demo sin coordinar:** `database/seeders/*` (dominio `@parce.local`) y la migración `2026_07_10_000012` (dominio `@parcedemo.local`) — no se solapan, pero tampoco se referencian entre sí ni están documentados como dos vías intencionalmente distintas.
8. **Rol `support`** sembrado en la tabla `roles` pero sin ningún `RBACMiddleware` que lo referencie en `config/routes.php` — no se usa en ninguna ruta actual.
9. ~~Tabla `admin_access_requests` huérfana~~ **Resuelto** — activamente usada por `MechanicApplicationService` desde el flujo de solicitud de mecánico (ver "Funcionalidades implementadas" arriba).
10. **Migración `2026_07_10_000015_restore_document_fields_to_vehicles` falla sobre una BD completamente fresca** (`SQLSTATE[42S21]: Column already exists` para `soat_number`) — **deuda preexistente, sin relación con el flujo de solicitud de mecánico y no remediada por él.** La migración 5 ya crea esas columnas en una BD nueva; la migración 15 existe para *restaurar* las mismas columnas en la BD real de desarrollo, donde en algún momento no documentado desaparecieron (ver ítem 6 de esta misma lista). Al construir la base de datos de integración aislada `parce_test` (§1.16.2 de `PARCE_AS_BUILT_ARCHITECTURE.md`) para los tests de `MechanicApplicationService`, esta colisión se evidenció de forma reproducible; se documenta aquí en vez de remediarse porque corregirla implica decidir cuál de las dos migraciones es la fuente de verdad real, lo cual está fuera del alcance de esa pieza de trabajo.
11. **API key expuesta en `.env` de `main`/`Soto` — remediación PARCIAL, no cerrada.** El `.env` con una key real de Groq fue destrackeado y añadido a `.gitignore` en ambas ramas (commits `5431c23` en `main`, `ba5fd88` en `Soto`, 2026-08-18) tras confirmar que la key ya había sido rotada manualmente. **Pendiente, sin decisión de equipo tomada:** el historial de git de ambas ramas NO se reescribió — el valor histórico (ya inválido) sigue siendo recuperable en commits anteriores a la limpieza; purgarlo requiere `filter-repo`/force-push coordinado con el resto del equipo. Adicionalmente, `origin/frontend+backend` (rama fuera del equipo, explícitamente fuera de alcance de remediación) expone un `.env` completo — incluye `DB_PASSWORD` además de la misma key — como **riesgo conocido y reportado, no remediado**. Detalle completo, fechas y commits en `../architecture/DECISIONS.md` (ADR-13, sección "Registro de incidentes de seguridad") — no reportar este punto como resuelto sin leer esa distinción primero.
12. **Varios scripts de `scripts/{debugging,maintenance,validation}/` fallan por un `.env` local incompleto** (`SQLSTATE[3D000]: No database selected` / `Undefined array key`) — el `.env` real en disco de `Angel` solo contiene la línea `VITE_GROQ_API_KEY`, sin ninguna variable `DB_*`/`SESSION_*`/`APP_ENV`, y estos scripts parsean `.env` a mano con fallback a `''` en vez de `'parce'` (a diferencia de `App\Core\App.php`, que sí tiene el fallback correcto). Afecta a `check_role_assignments.php`, `check_user_roles.php`, `debug_service_requests.php`, `automated_validation.php`, `validate_database_structure.php`, `validate_service_requests.php`, `validate_vehicles.php`, `verify_final_status.php`, `test_session_hardening.php`. **Solo afecta a estos scripts de mantenimiento/depuración — ninguna ruta de la aplicación real (`config/routes.php`) pasa por este código —, por lo que no es bloqueante para la sustentación.** Detalle completo en `BACKLOG.md`.
13. **`scripts/validation/validate_vehicle_domain.php` tiene un autoloader y una carga de `.env` propios y rotos**, sin relación con el patrón `BASE_PATH` del resto de `scripts/` — su autoloader casero apunta a `__DIR__ . '/app/'` (ruta inexistente desde `scripts/validation/`) y su `.env` se busca en `__DIR__ . '/.env'` en vez de la raíz del proyecto. **Solo afecta a este script de validación — ninguna ruta de la aplicación real lo usa —, por lo que no es bloqueante para la sustentación.** Detalle completo en `BACKLOG.md`.
14. **`scripts/maintenance/fix_assign_customer_roles.php` tiene un bug real de tipo de argumento**: llama a `Database::update('user_roles', ['is_active' => 1], ['id' => $existingRole['id']])` pasando un **array** como tercer argumento (`$where`) cuando la firma real de `Database::update()` exige un **string** — mismo patrón de bug ya encontrado y corregido antes en `AuthController::profile()`. **Solo afecta a este script de mantenimiento puntual — ninguna ruta de la aplicación real lo invoca —, por lo que no es bloqueante para la sustentación.** Detalle completo en `BACKLOG.md`.

---

## C. Funcionalidades pendientes

Elementos que, si se decide construirlos, no requieren primero resolver una divergencia arquitectónica — son adiciones limpias sobre el sistema actual:

1. **Notificaciones** — sin ningún código hoy (backend ni frontend).
2. **Tracking GPS continuo** — hoy solo hay captura puntual de ubicación; no hay histórico ni mapa.
3. **Cobertura de tests de Services/Controllers/Middleware** (también listado en B — es deuda técnica y funcionalidad pendiente a la vez).

---

## D. Funcionalidades diseñadas pero obsoletas

**Importante: estos elementos NO se marcan automáticamente como "por implementar".** Antes de retomar cualquiera, hace falta una decisión arquitectónica explícita sobre si el diseño original sigue vigente o si el enfoque más simple ya construido (ver `AS_DESIGNED_VS_AS_BUILT.md`) se adopta formalmente como la arquitectura objetivo.

1. **Documents polimórfico** (`documents`, `document_verifications`, `document_types`) — reemplazado funcionalmente por columnas directas en `vehicles`/`users`, sin workflow de verificación.
2. **`mechanic_profiles`** — el mecánico quedó como `user` + rol + columnas de licencia, sin perfil dedicado.
3. **`app/Modules/`** — la reestructuración modular completa (Documents/Notifications/Mechanics/Admin como módulos independientes) nunca se ejecutó; existe una decisión documentada de mantener `Infrastructure/Http` donde está, pero no una decisión explícita sobre si los módulos de dominio nuevos deberían eventualmente vivir en `Modules/` o seguir el patrón `Infrastructure/{Dominio}` ya establecido por PQR/Survey/Admin.
4. **`service_assignments`** — histórico de intentos de asignación/reasignación tras rechazo; no aplica hoy porque no existe el estado `rejected`.
5. **`service_state_history`** — auditoría de transiciones; hoy solo hay timestamps planos por transición, sin histórico intermedio.
6. **`service_locations`** — tracking GPS histórico (relacionado con C.2, pero calificado aquí como diseño obsoleto porque el ERD que lo definía ya no corresponde al esquema real de `service_requests`).

---

## Resumen de prioridad de decisión (no de implementación)

**A.1 (autodeclaración vs. aprobación de mecánico) ya está resuelta e implementada** (ver "Funcionalidades implementadas" arriba) — era la única decisión pendiente con implicación directa de seguridad/confianza de la plataforma. De las decisiones de producto restantes (A.2–A.5), ninguna tiene la misma urgencia de seguridad; el resto de prioridad queda abierto a criterio de producto.
