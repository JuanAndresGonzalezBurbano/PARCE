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
| ADR-14 | La migración `2026_07_10_000015_restore_document_fields_to_vehicles` colisiona (`Column already exists`) sobre una BD completamente fresca; se instala marcándola como ya aplicada en la tabla `migrations`, sin ejecutar su `up()` — nunca editando el archivo de migración | Vigente — deuda técnica documentada, no un bug a corregir en el código de la migración | Ver "Migración `2026_07_10_000015` sobre una BD fresca" abajo |

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

---

## Migración `2026_07_10_000015` sobre una BD fresca (ADR-14)

**Causa raíz.** `database/migrations/2026_01_01_000005_add_document_fields_to_vehicles.php`
crea `soat_number`/`soat_expiration_date`/`soat_document_url`/`soat_uploaded_at` y sus 4
equivalentes `tecnomecanica_*` en `vehicles`. En algún momento no documentado, esas 8
columnas desaparecieron de la base de datos real de desarrollo (`parce`) — el propio
docblock de `2026_07_10_000015_restore_document_fields_to_vehicles.php` registra que
fueron aparentemente eliminadas por una migración de batch 9
(`2026_01_01_000009_add_technical_fields_to_vehicles`) cuyo archivo ya no existe en
disco, mientras esa misma migración agregaba otras columnas técnicas que sí siguen
presentes (`engine_displacement_cc`, `transmission_type`, etc.). La migración `000015`
existe para *restaurar* esas 8 columnas en `parce` — y de hecho es la migración
responsable de que existan hoy en la base de datos real de desarrollo, porque las
originales de `000005` fueron borradas.

**El conflicto.** Sobre una base de datos que **nunca pasó** por ese evento de borrado
(cualquier instalación nueva, incluida `parce_test`, la BD aislada de
`tests/Integration/` — ver `docs/testing/INTEGRATION_TESTING.md` §11), las 17
migraciones corren en orden: `000005` ya crea las 8 columnas con normalidad, y cuando
le toca el turno a `000015`, su `ALTER TABLE ... ADD COLUMN soat_number ...` intenta
crear columnas que ya existen → `SQLSTATE[42S21]: Column already exists`.

**Cuál migración es la fuente de verdad real — depende de qué base de datos.** No hay
una respuesta única de "esta migración es la buena, la otra se descarta":
- Sobre la **BD real `parce`** (la que efectivamente ha estado en uso), `000015` es la
  migración que realmente puso esas columnas donde están hoy — `000005` originalmente
  las creó, pero ese estado ya no existe; fue sobrescrito por el borrado no documentado
  y la posterior restauración. Quitar `000015` del historial de `parce` sería falsificar
  cómo llegó su esquema al estado actual.
- Sobre una **BD nueva sin ese historial**, `000005` es autosuficiente y `000015` es
  pura colisión redundante.

Por eso el archivo de migración `000015` **no se edita** (cambiar su `up()` alteraría
retroactivamente lo que documenta sobre `parce`) — el problema se resuelve en el
**procedimiento de instalación**, no en el código de la migración.

**Workaround exacto para instalar el proyecto desde una BD completamente fresca:**

```sql
-- 1. Crear la base de datos
CREATE DATABASE IF NOT EXISTS parce CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE parce;

-- 2. Crear la tabla de seguimiento de migraciones (mismo esquema exacto que
--    App\Core\MigrationRunner::ensureMigrationsTableExists() crea automáticamente
--    — se crea aquí a mano solo para poder insertar el marcador ANTES del primer
--    `migrate`, en el mismo paso):
CREATE TABLE IF NOT EXISTS `migrations` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `migration` VARCHAR(255) NOT NULL,
    `batch` INT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `unique_migration` (`migration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Marcar 000015 como ya aplicada, SIN ejecutar su up() — su efecto (las 8
--    columnas SOAT/Tecnomecánica) ya lo satisface la migración 000005, que
--    todavía no corrió en este punto:
INSERT INTO `migrations` (`migration`, `batch`)
VALUES ('2026_07_10_000015_restore_document_fields_to_vehicles', 0);
```

```bash
# 4. Ahora sí, correr las migraciones normalmente — MigrationRunner ve que
#    "2026_07_10_000015_restore_document_fields_to_vehicles" ya está en la
#    tabla `migrations` y la salta; las otras 16 corren sin tocar (incluida
#    000005, que crea las 8 columnas con normalidad):
php scripts/maintenance/migrate.php migrate
```

El esquema resultante es **idéntico** al que se obtendría si `000015` hubiera podido
ejecutar sin colisión — su `up()` es un `ADD COLUMN` puro de las mismas 8 columnas que
`000005` ya crea, sin ningún otro efecto secundario (confirmado leyendo el archivo
completo). El `batch => 0` es arbitrario (nunca se usó para un `migrate()` real) y no
interfiere con el conteo de `rollback`/`status` del resto de migraciones, que siguen
recibiendo sus propios números de batch normalmente a partir de 1.

**Ya aplicado en la práctica:** este es exactamente el procedimiento usado para crear
`parce_test` (la base de datos de `tests/Integration/`), documentado también en
`docs/testing/INTEGRATION_TESTING.md` §11. No se documenta aquí un comando distinto —
es el mismo workaround, generalizado como procedimiento estándar de instalación desde
cero.
