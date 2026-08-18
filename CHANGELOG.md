# Changelog — P.A.R.C.E

> Este proyecto **no usa todavía versionado semántico formal** (`composer.json` no declara versión; `package.json` del frontend declara `1.0.0` de forma nominal, sin releases etiquetados en Git). Este changelog documenta el estado actual y los hitos reales de desarrollo agrupados por área, tomados de `git log` — no se inventan números de versión ni fechas de release que no existan.

## [Unreleased] — Baseline AS-BUILT (rama `Angel`)

### Funcionalidades completas e integradas
- Autenticación por sesión (registro, login, logout, `/me`, cambio de perfil, cambio de contraseña, recuperación de contraseña vía Resend).
- Gestión de vehículos (CRUD, vehículo principal, campos SOAT/Tecnomecánica).
- Solicitudes de servicio: ciclo de vida completo (`pending→assigned→in_progress→completed`, más `cancelled`/`expired`), evidencias fotográficas, calificación (general + detallada).
- PQR (peticiones/quejas/reclamos/sugerencias) con flujo de revisión administrativa.
- Encuestas de satisfacción post-servicio.
- Panel de administración (dashboard de métricas, gestión de PQR/encuestas/calificaciones, paginación).
- Endurecimiento de seguridad: RBAC, rate limiting, cabeceras de seguridad, CORS restrictivo, protección contra condiciones de carrera en las operaciones críticas (aceptar/cancelar/completar solicitud, registro concurrente, reseteo de contraseña, unicidad de placa/VIN).
- Suite de tests PHPUnit: 134 tests / 202 aserciones, 100% en verde (cobertura de `*Validator`/DTOs únicamente — ver limitaciones).
- CI en GitHub Actions: backend (PHPUnit) + frontend (type-check + build).
- Documentación arquitectónica AS-BUILT completa (`docs/architecture/`, `docs/roadmap/`, `docs/api/`).

### Limitaciones conocidas (no son bugs, son alcance no implementado)
- Sin notificaciones (in-app, email transaccional de eventos, o push).
- Sin tracking GPS continuo (solo captura puntual de ubicación).
- Sin pasarela de pagos.
- Sin aprobación administrativa de mecánicos (el rol se autodeclara en el registro).
- Sin infraestructura real de almacenamiento de archivos (URLs externas pegadas manualmente).
- Sin cobertura de tests para `*Service.php`, Controllers ni Middleware.

Ver [`docs/roadmap/PARCE_ROADMAP_AS_BUILT.md`](docs/roadmap/PARCE_ROADMAP_AS_BUILT.md) para el detalle completo, separado en decisiones de producto pendientes, deuda técnica, funcionalidades pendientes y diseños obsoletos.

---

## Historial de cambios recientes (agrupado, no exhaustivo — ver `git log` para el detalle commit por commit)

- **Endurecimiento y estabilización** (~80 commits más recientes): cierre de condiciones de carrera en operaciones de escritura concurrente, rate limiting, paginación en listados administrativos, flujo de recuperación de contraseña, expiración automática de solicitudes pendientes, limpieza de sesiones vía cron, corrección de fugas de información en errores/CORS.
- **PQR, Encuestas y Admin dashboard**: módulo completo agregado sin spec de diseño previo (construido de forma ad-hoc sobre el patrón `Infrastructure/{Dominio}` ya establecido).
- **Fase de datos documentales de vehículo/servicio** ("Fase 13"): SOAT, Tecnomecánica, licencia de conducción del mecánico, calificaciones detalladas (puntualidad/calidad), evidencias fotográficas — todo como columnas/tablas directas, reemplazando el diseño original de tabla `documents` polimórfica.
- **MVP inicial**: fundación MVC, autenticación, vehículos, solicitudes de servicio, integración frontend React.

## [Futuro] — sin comprometer

Los elementos de `docs/roadmap/PARCE_ROADMAP_AS_BUILT.md` secciones A (decisiones de producto), C (funcionalidades pendientes) y D (diseños obsoletos que requieren decisión) **no están planificados ni versionados** — su inclusión aquí sería inventar un roadmap que nadie ha aprobado todavía. Ver ese documento directamente.
