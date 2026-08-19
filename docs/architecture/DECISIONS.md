# P.A.R.C.E — Decisiones arquitectónicas AS-BUILT (índice)

> Registro breve, estilo ADR, de las decisiones arquitectónicas que efectivamente rigen el código actual. El detalle completo de cada una (con evidencia de código/commit) vive en [`AS_DESIGNED_VS_AS_BUILT.md`](AS_DESIGNED_VS_AS_BUILT.md) — este documento es solo el índice de referencia rápida. Ninguna de estas decisiones se cambia como parte de esta auditoría.

| # | Decisión | Estado | Evidencia |
|---|---|---|---|
| ADR-1 | `Infrastructure/Http` permanece en su ubicación actual; NO se crea `app/Shared/` | Vigente | `docs/decisions/DEPENDENCY_IMPACT_ANALYSIS.md`, commit `5f30ae7` |
| ADR-2 | `app/Modules/` no se implementa; los dominios de negocio viven como carpetas bajo `app/Infrastructure/` | Vigente (de facto — PQR/Survey/Admin lo confirman, construidos así sin spec previo) | Ausencia verificada de `app/Modules/`; estructura real en `app/Infrastructure/{8 dominios}` |
| ADR-3 | Documentos de vehículo/mecánico (SOAT, Tecnomecánica, licencia) como columnas directas en `vehicles`/`users`, no como tabla polimórfica `documents` | Vigente — reemplaza la decisión original de `DOMAIN_MODEL_FINAL.md` | Migraciones `2026_01_01_000005/000006`; `AS_DESIGNED_VS_AS_BUILT.md` fila "Documents" |
| ADR-4 | Sin tabla `mechanic_profiles` — el mecánico es `user` + rol + columnas de licencia | Vigente | Ausencia verificada en migraciones; `AS_DESIGNED_VS_AS_BUILT.md` fila "Mechanic Profiles" |
| ADR-5 | Rol de mecánico autodeclarado en el registro, sin flujo de aprobación vía `admin_access_requests` | **Reemplazada.** El registro público ya solo crea `customer`; el rol `mechanic` se obtiene vía `MechanicApplicationService` (solicitud + aprobación administrativa) reutilizando `admin_access_requests`, sin migraciones nuevas. Incluye una regla adicional: `administrator`/`super_admin` no pueden solicitar `mechanic`. | `AuthService::register()` (ya no acepta parámetro de rol); `RequestValidator::validateRegistrationRequest()` (rechaza `role`≠`customer` con 400); `app/Infrastructure/MechanicApplication/*`; `PARCE_AS_BUILT_ARCHITECTURE.md` §1.17; `AS_DESIGNED_VS_AS_BUILT.md` fila "Admin Access" |
| ADR-6 | `service_requests` con 6 estados planos (`pending/assigned/in_progress/completed/cancelled/expired`), sin tabla de asignaciones ni historial de transiciones | Vigente — simplificación respecto al ERD histórico de 9 estados | `ServiceRequestValidator::VALID_STATUSES`; `AS_DESIGNED_VS_AS_BUILT.md` filas "Service States/Assignments/History" |
| ADR-7 | Ratings (`customer_rating`, `punctuality_rating`, `service_quality_rating`) como columnas de `service_requests`, no como tabla `ratings` independiente | Vigente | Migraciones `2024_01_01_000004`, `2026_01_01_000007` |
| ADR-8 | Sin tabla `notifications` ni sistema de eventos — ningún módulo emite eventos internos | Vigente — pendiente si se decide construir (roadmap C.1) | Ausencia verificada en `app/Infrastructure/*` y `frontend/src` |
| ADR-9 | `AdminService` como fachada de solo lectura/agregados; gestión de PQR/Encuestas vía sus propios Services, no proxied a través de Admin | Vigente | `AdminController` solo expone `dashboard()`/`ratings()` |
| ADR-10 | Sin capa Repository/DAO — los `*Service.php` llaman directamente a `App\Core\Database` | Vigente | Inventario completo de `app/Infrastructure/*` |
| ADR-11 | Unicidad de placa/VIN aplicada en capa de aplicación (locks nombrados MySQL), no por `UNIQUE` de BD | Vigente — decisión explícita para permitir reutilizar placas de vehículos borrados | Migración `2026_07_16_000016` |
| ADR-12 | Sesión de servidor + cookie httpOnly; sin JWT | Vigente | `SessionManager`, tabla `sessions` |

**Regla de uso:** cualquier decisión futura que contradiga una fila de esta tabla debe documentarse explícitamente como una nueva decisión (con su propio ADR-N), no como una corrección silenciosa — para no repetir el problema que motivó la reconstrucción AS-BUILT de esta misma carpeta.
