# Índice de documentación de arquitectura — P.A.R.C.E

Esta carpeta mezcla documentación **AS-BUILT** (fuente de verdad actual, generada desde el código) con documentación **histórica** (planes y diseños de distintos momentos del proyecto, algunos vigentes, muchos obsoletos). Esta página existe para que sepas cuál es cuál antes de usar cualquiera de ellos como referencia.

## Fuente AS-BUILT (usar estos como referencia actual)

| Documento | Contenido |
|---|---|
| [`PARCE_AS_BUILT_ARCHITECTURE.md`](PARCE_AS_BUILT_ARCHITECTURE.md) | **Documento principal.** Arquitectura completa: stack, estructura de carpetas, autenticación, ciclo de vida de Service Requests, vehículos, evidencias, PQR, encuestas, ratings, admin, tests. |
| [`ERD_AS_BUILT.md`](ERD_AS_BUILT.md) | **ERD oficial.** Las 11 tablas reales, relaciones, PK/FK, restricciones — construido exclusivamente desde `database/migrations/`. |
| [`AS_DESIGNED_VS_AS_BUILT.md`](AS_DESIGNED_VS_AS_BUILT.md) | Tabla comparativa: qué se diseñó vs. qué existe realmente, con clasificación por fila. |
| [`uml/`](uml/) | 10 diagramas Mermaid AS-BUILT, uno por dominio (arquitectura, componentes, auth, ciclo de vida de solicitudes, vehículos, evidencias, PQR, encuestas, admin, dependencias). |
| [`DECISIONS.md`](DECISIONS.md) | Índice breve estilo ADR de las 12 decisiones arquitectónicas vigentes, con enlace a su evidencia en `AS_DESIGNED_VS_AS_BUILT.md`. |
| [`../roadmap/PARCE_ROADMAP_AS_BUILT.md`](../roadmap/PARCE_ROADMAP_AS_BUILT.md) | Roadmap AS-BUILT: decisiones de producto pendientes, deuda técnica, funcionalidades pendientes, diseños obsoletos — separados, sin mezclar. |
| [`../api/API_REFERENCE.md`](../api/API_REFERENCE.md) | Referencia de las 46 rutas reales de `config/routes.php`, con auth/roles/body/errores. |
| [`../security/OPERATIONAL_SECURITY.md`](../security/OPERATIONAL_SECURITY.md), [`../security/PRIVACY_AND_DATA_PROTECTION.md`](../security/PRIVACY_AND_DATA_PROTECTION.md) | Seguridad operacional y privacidad/protección de datos, AS-BUILT. |
| [`../release/RELEASE_READINESS.md`](../release/RELEASE_READINESS.md) | Checklist de preparación para release, con evidencia por punto (no marca nada sin verificarlo). |
| [`../../THIRD_PARTY.md`](../../THIRD_PARTY.md), [`../../CHANGELOG.md`](../../CHANGELOG.md) | Dependencias de terceros (licencias verificadas desde metadatos reales) y changelog, en la raíz del repositorio. |

## Histórico / AS-DESIGNED (referencia de decisiones pasadas — NO usar como estado actual)

| Documento | Por qué es histórico |
|---|---|
| `AI_CONTEXT_PARCE.md` (raíz del repo) | Congelado en 2026-01-11; describe Service Requests, Frontend y Fase 13 como "pendientes" — todos completos hoy. |
| `DOMAIN_MODEL_FINAL.md` | Su decisión central ("no agregar columnas a `users`/`vehicles`") fue revertida en la implementación real. Ver fila "Documents" en `AS_DESIGNED_VS_AS_BUILT.md`. |
| `ADMIN_DOMAIN_ANALYSIS.md` | Propone un módulo RBAC de gestión de usuarios; el `AdminService` real es solo `dashboard()`/`ratings()`. |
| `MECHANIC_DOMAIN_ANALYSIS.md` | Propone `mechanic_profiles` (23 campos); no implementado — el mecánico real es `user` + rol + licencia. |
| `NOTIFICATION_DOMAIN_ANALYSIS.md` | Diseño completo de un módulo sin ningún código implementado todavía. |
| `DATABASE_REFINEMENT.md` | Antecesor de `DOMAIN_MODEL_FINAL.md`, misma naturaleza histórica. |
| `../roadmap/IMPLEMENTATION_ROADMAP_V1.md`, `../roadmap/ROADMAP_V2_CHANGES.md` | Roadmap modular (`app/Modules/`, Documents/Notifications/Mechanics/Admin como fases) — sus Fases 2-5 nunca se ejecutaron tal como están descritas. |
| `../roadmap/FASE_12.6_COMPLETION_SUMMARY.md` | Reporte histórico puntual de una fase concreta del proyecto. |
| `.kiro/specs/mvc-folder-structure/` (raíz del repo) | Estructura MVC descrita (`app/core/` minúscula, sin namespaces, con `views/`) no coincide con la real (`App\Core` PSR-4, sin `views/`). |
| `.kiro/specs/authentication-api-layer/`, `.kiro/specs/authentication-infrastructure-layer/` | Diseño mayormente vigente en cuanto a componentes, pero **los checkboxes de `tasks.md` no reflejan el estado real** — ver nota en `AS_DESIGNED_VS_AS_BUILT.md`. Válido como referencia de diseño, no como tracker de progreso. |
| `.kiro/specs/vehicle-service-data-model/` | Requirements.md describe correctamente el comportamiento implementado (Fase 13: SOAT/Tecnomecánica/licencia/ratings/evidencias); los checkboxes de `tasks.md` (`[~]`) subestiman el avance real. |
| `.kiro/specs/database-architecture/` (ERDs de `users-roles-erd.md`, `services-module-erd.md`) | `users-roles-erd.md` coincide en `users`/`roles`/`user_roles` pero no en el workflow de aprobación de mecánico (`admin_access_requests` sin uso real). `services-module-erd.md` usa nombres de tabla y estados que no existen (`services`, `service_statuses`, `service_assignments`, `service_state_history`, `service_locations`, estado `rejected`). |
| `.kiro/specs/database-infrastructure-layer/design.md` | Describe clases `DatabaseHealth`/`DatabaseValidator`/`DatabaseLogger`/`DatabaseMigrator` dedicadas; el código real resuelve lo mismo de forma más simple, dentro de `Database.php`/`MigrationRunner.php`. |
| Resto de archivos en `docs/api/` y `docs/security/` (ej. `API_DOCUMENTATION.md`, `API_ENDPOINTS_SUMMARY.md`, `RBAC_FIX_PLAN.md`, `SESSION_HARDENING_REPORT.md`, etc.) | Documentación histórica preexistente en esas mismas carpetas, distinta de los archivos AS-BUILT (`API_REFERENCE.md`, `OPERATIONAL_SECURITY.md`, `PRIVACY_AND_DATA_PROTECTION.md`) listados en la tabla de arriba — no auditada exhaustivamente en esta reconstrucción, tratar como histórica por defecto. |
| Resto de `docs/` (audits/, backend/, database/, execution/, frontend/, reports/, testing/) | No auditado exhaustivamente en esta reconstrucción — tratar como histórico por defecto según la propia advertencia del `README.md` raíz del proyecto ("no se mantiene activamente"). |

## Qué NO debe usarse como fuente de estado actual

- **Ningún checkbox `[x]`/`[ ]`/`[~]` de `.kiro/specs/*/tasks.md`** por sí solo — verificado repetidamente como no confiable frente al código real.
- **`AI_CONTEXT_PARCE.md`** en su totalidad — es un snapshot de enero 2026, muy anterior al estado actual.
- **Cualquier mención a `app/Modules/`, `documents`, `mechanic_profiles`, `notifications`, `service_assignments`, `service_state_history`, `service_locations`** como si ya existieran — ninguna existe en el código actual (ver `ERD_AS_BUILT.md` §7).

## Mantenimiento de esta documentación

Cuando el código cambie de forma que afecte a alguno de los documentos AS-BUILT listados arriba, ese documento debe actualizarse junto con el cambio de código — de lo contrario, esta misma carpeta reproduce el problema que motivó su creación.
