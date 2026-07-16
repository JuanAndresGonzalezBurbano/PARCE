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

### 6. Expiración automática de solicitudes pendientes
La columna `expired_at` existe en `service_requests` (visible en cada respuesta
de la API) pero **ningún código la establece jamás** — ninguna solicitud
pasa nunca a estado expirado, sin importar cuánto tiempo quede "pending" sin
que un mecánico la acepte. El esquema anticipa un mecanismo de expiración que
nunca se construyó. Implementarlo requiere una decisión de negocio que no está
definida en ningún lugar del código: ¿cuánto tiempo antes de expirar (15 min,
1 hora)?, ¿se reintenta notificar a otros mecánicos primero?, ¿quién procesa
la expiración (cron job, chequeo perezoso al leer)? No construir sin definir
esto con el usuario primero.

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
- **Paginación**: corrección 2026-07-16 — verificado que el backend en realidad
  **no** implementa paginación en ningún endpoint (sin `meta`, sin LIMIT/OFFSET
  en las queries de listado); la nota anterior de este archivo era incorrecta.
  No urgente mientras los volúmenes de datos sean bajos (proyecto en
  desarrollo/demo), pero construirla (backend + frontend) será necesario antes
  de un uso con datos reales.

- ~~`node_modules` está trackeado en git~~ — Resuelto 2026-07-16. También se
  encontró y corrigió el mismo problema en `frontend/dist/` (build output) y
  `storage/rate_limit.json` (estado runtime del rate limiter). Los tres se
  desvincularon de git (`git rm --cached`, archivos intactos en disco) y se
  agregaron a `.gitignore`. Ver commit `chore(git): stop tracking
  generated/runtime files`.
