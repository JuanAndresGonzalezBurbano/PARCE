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
| ADR-13 | `.env` deja de estar trackeado en `main`/`Soto` tras la exposición de una API key real; el historial de git de ambas ramas **no** se reescribió | **Parcial — remediación de tracking hecha, purga de historial pendiente de decisión de equipo** | Ver "Registro de incidentes de seguridad" abajo |

**Regla de uso:** cualquier decisión futura que contradiga una fila de esta tabla debe documentarse explícitamente como una nueva decisión (con su propio ADR-N), no como una corrección silenciosa — para no repetir el problema que motivó la reconstrucción AS-BUILT de esta misma carpeta.

---

## Registro de incidentes de seguridad

### 2026-08-18 — API key de Groq expuesta en `.env` trackeado (`main`, `Soto`)

**Hallazgo:** una API key real de Groq (`VITE_GROQ_API_KEY`) quedó expuesta en `.env`,
trackeado en git desde el commit `16b2a07` ("Add .env with API key", autor `juanalba`,
2026-06-02), presente en la punta de `origin/main` y `origin/Soto` — las ramas por
defecto/de equipo del repositorio en GitHub. No se encontró ninguna referencia a esta
variable en el código de la aplicación; parece una integración abandonada, no algo que
la app use en runtime.

**Acción del humano (confirmada antes de tocar cualquier archivo):** la key fue rotada
manualmente en la cuenta de Groq — el valor histórico expuesto en git ya no es válido.

**Remediación aplicada** (alcance: únicamente `main` y `Soto`, sin tocar ninguna otra rama):
- `main`: commit `5431c23` ("security: remove tracked .env with exposed API key, add to
  .gitignore") — `git rm --cached .env` + se agregó la línea `.env` a `.gitignore`
  (que solo tenía `.env.local`). Pusheado a `origin/main`.
- `Soto`: commit `ba5fd88`, mismo mensaje y mismo cambio exacto (mismo commit `16b2a07`
  era el responsable del `.env` trackeado en ambas ramas). Pusheado a `origin/Soto`.
- En ambos casos el archivo `.env` **permanece en disco, local, sin trackear** — el
  proyecto sigue funcionando en ambas ramas, solo se sacó del control de versiones.
- Verificado post-push: `.env` ya no aparece en `git ls-tree` de la punta de ninguna de
  las dos ramas remotas.

**Explícitamente NO hecho, pendiente de decisión de equipo:**
- **No se reescribió el historial de git** (`filter-repo`, force-push) en ninguna de las
  dos ramas. El commit `16b2a07` y todos los posteriores hasta la limpieza siguen
  conteniendo el valor de la key (ya inválida) en el historial de ambas ramas. Purgarlo
  requeriría force-push, lo cual rompería los clones locales de otros colaboradores
  (Duvan/Juan/Soto/sebastian si tienen `main`/`Soto` descargados) — es una decisión de
  coordinación de equipo, no una decisión técnica unilateral, y no se tomó en esta sesión.
- **No se tocó `origin/frontend+backend`**, por instrucción explícita del usuario ("no es
  una rama de nuestro equipo"). Se deja registrado aquí como **riesgo conocido, no
  remediado**: esa rama expone (commit `b6c6a25`, 2026-08-05, autor `sebastian`) un `.env`
  completo del proyecto (37 líneas) que incluye tanto `VITE_GROQ_API_KEY` como
  `DB_PASSWORD` y el resto de configuración de sesión/cookies/CORS — sin detallar
  valores aquí. Si en algún momento se decide que esa rama sí es responsabilidad del
  equipo, este mismo procedimiento (rm --cached + `.gitignore`) es aplicable, más una
  revisión de si `DB_PASSWORD` también necesita rotarse.

**Por qué queda como ADR/incidente y no se cierra sin más:** la remediación de tracking
neutraliza que el `.env` siga circulando en nuevos clones/PRs a partir de ahora, pero no
borra la exposición histórica ya ocurrida (mitigada porque la key fue rotada, no porque
el historial esté limpio). No debe reportarse este punto como "resuelto al 100%" en
ningún roadmap o resumen de estado sin esa distinción.
