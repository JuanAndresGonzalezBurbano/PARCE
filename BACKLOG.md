# P.A.R.C.E — Backlog

Ítems fuera de alcance de la sesión actual porque implican una decisión de producto,
un módulo nuevo, o un cambio de arquitectura que debe decidir el usuario antes de
construirse. No bloquean el trabajo en curso.

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

### 4. Vista de evidencias para el cliente
El backend ya expone `GET /api/service-requests/{id}/evidences` (mismo control de
acceso que el mecánico), pero no existe ninguna pantalla en el frontend del cliente
para verlas. Es una extensión pequeña y de bajo riesgo (reutilizaría el patrón de
`EvidenceUpload`/lista existente) — se puede construir en cualquier momento sin
necesidad de más decisiones, solo priorización.

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
- **Paginación**: el backend soporta `meta.pagination` en varios listados pero
  ningún contexto del frontend lo consume — actualmente todo carga sin límite.
  No es urgente mientras los volúmenes de datos sean bajos (proyecto en
  desarrollo/demo), pero será necesario antes de un uso con datos reales.

- **`node_modules` está trackeado en git** (`frontend/node_modules/` no está en `.gitignore`), generando ruido constante en `git status`/diffs. Bajo riesgo pero vale la pena limpiarlo: agregar a `.gitignore` y `git rm -r --cached frontend/node_modules` en un commit dedicado cuando no haya trabajo en curso que se pueda mezclar accidentalmente.
