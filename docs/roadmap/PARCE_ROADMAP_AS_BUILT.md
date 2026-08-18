# P.A.R.C.E — Roadmap AS-BUILT

> Este roadmap **no convierte automáticamente elementos pendientes en tareas de implementación.** Se separan en cuatro categorías con naturaleza distinta: decisiones de producto (requieren que alguien decida, no que alguien investigue), deuda técnica, funcionalidades pendientes de construir, y diseños obsoletos que primero requieren una decisión arquitectónica antes de considerarse "por implementar".
>
> Fuente: [`../architecture/PARCE_AS_BUILT_ARCHITECTURE.md`](../architecture/PARCE_AS_BUILT_ARCHITECTURE.md) y [`../architecture/AS_DESIGNED_VS_AS_BUILT.md`](../architecture/AS_DESIGNED_VS_AS_BUILT.md).

---

## A. Decisiones de producto pendientes

Ninguna de estas requiere más investigación técnica — todas requieren que el equipo/producto decida.

1. **¿Mecánico autodeclarado o aprobación administrativa?** Hoy cualquier usuario puede registrarse directamente como `mechanic` (`role?: 'customer'|'mechanic'` en el registro) y, con solo cargar una fecha de licencia no vencida, empezar a aceptar solicitudes. La tabla `admin_access_requests` ya existe en la BD para soportar un flujo de aprobación, pero no está conectada a ningún Controller/Service. Es la decisión con mayor implicación de confianza/seguridad de todo el sistema.
2. **¿Rating bidireccional (mecánico → cliente)?** Hoy solo existe Cliente → Mecánico (`customer_rating`, `punctuality_rating`, `service_quality_rating`). No hay columna ni endpoint en sentido inverso.
3. **Infraestructura real de subida de archivos.** Hoy `soat_document_url`, `driver_license_document_url`, `image_url` (evidencias) son `VARCHAR` validados solo como URL bien formada — el usuario pega un enlace externo manualmente. No hay integración con S3/Cloudinary/almacenamiento propio.
4. **¿Qué hacer con el diseño de `vehicle_documents`/`vehicle_maintenance_records`?** Nunca se crearon como tablas; el caso de uso que iban a cubrir (SOAT/Tecnomecánica) ya se resolvió de otra forma (columnas directas en `vehicles`). Hay que decidir si se descartan formalmente del backlog o si aún cubren algo distinto (p. ej. mantenimientos).
5. **¿Se valida el vencimiento de SOAT/Tecnomecánica como condición de bloqueo?** Hoy es puramente informativo — un vehículo con documentos vencidos puede seguir usándose en solicitudes de servicio sin restricción.

---

## B. Deuda técnica

1. **Cobertura de tests de `*Service.php` — 0%.** Los 134 tests existentes (verificados en ejecución real, 0 fallos) cubren únicamente `*Validator`/DTOs. `AuthService`, `SessionManager`, `ServiceRequestService`, `VehicleService`, `PQRService`, `SurveyService`, `AdminService`, `ServiceRequestEvidenceService`, `PasswordResetService` no tienen ningún test automatizado.
2. **Cobertura de Controllers — 0%.**
3. **Cobertura de Middleware — 0%** (`AuthMiddleware`, `RBACMiddleware`, `CORSMiddleware`, `SecurityHeadersMiddleware`, `RequestLoggerMiddleware`).
4. **Documentación de módulos existentes sin ningún documento previo:** PQR, Encuestas, Admin dashboard real, Evidencias, Password Reset/Mail — los 5 dominios más recientes y con más código son, a la vez, los 5 con cero documentación arquitectónica hasta la creación de este set de documentos.
5. **Inconsistencias documentales activas:** ver `AS_DESIGNED_VS_AS_BUILT.md` completo — en particular, los checkboxes de `.kiro/specs/authentication-api-layer/tasks.md` y `mvc-folder-structure/tasks.md` no reflejan el estado real del código.
6. **Deriva de esquema no explicada:** las migraciones `2026_07_10_000011` y `2026_07_10_000015` existen para *restaurar* columnas (SOAT/Tecnomecánica/ratings) que en algún momento desaparecieron de una base de datos viva sin que exista, en el repositorio actual, una migración que documente quién/qué las eliminó.
7. **Dos mecanismos de sembrado de datos demo sin coordinar:** `database/seeders/*` (dominio `@parce.local`) y la migración `2026_07_10_000012` (dominio `@parcedemo.local`) — no se solapan, pero tampoco se referencian entre sí ni están documentados como dos vías intencionalmente distintas.
8. **Rol `support`** sembrado en la tabla `roles` pero sin ningún `RBACMiddleware` que lo referencie en `config/routes.php` — no se usa en ninguna ruta actual.
9. **Tabla `admin_access_requests` huérfana** — existe en la BD, no la usa ningún Controller/Service (ligado a la decisión de producto A.1).

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

El punto de partida antes de tocar cualquiera de las secciones B/C/D es resolver **A.1** (autodeclaración vs. aprobación de mecánico) — es la única decisión con implicación directa de seguridad/confianza de la plataforma, y condiciona si `admin_access_requests` se activa, se documenta como descartada, o se elimina.
