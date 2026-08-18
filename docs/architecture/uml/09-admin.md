# UML 09 — Administración (AS-BUILT)

**Propósito:** representar el Admin Dashboard real — diferenciando explícitamente qué pasa por `AdminService` y qué no, frente al diseño histórico de un módulo RBAC de gestión de usuarios.

```mermaid
flowchart TD
    D["GET /admin/dashboard"] --> AS1["AdminService.dashboard()\ntotal_users, total_pqr, pending_pqr,\ntotal_surveys, average_rating,\nrequests_by_status (GROUP BY)"]
    R["GET /admin/ratings?filtros&page"] --> AS2["AdminService.ratings()\nPAGINADO, filtros: mechanic_id, customer_id,\nmin_rating, date_from, date_to"]
    PQR_A["GET/PUT/POST /admin/pqr/*"] -.->|"NO pasa por AdminService"| PQRSvc[PQRService directamente]
    SURV_A["GET /admin/surveys"] -.->|"NO pasa por AdminService"| SurvSvc[SurveyService directamente]
    RBAC["RBACMiddleware(administrator, super_admin)"] --> D
    RBAC --> R
    RBAC --> PQR_A
    RBAC --> SURV_A
```

**Explicación breve:** `AdminService` expone únicamente `dashboard()` y `ratings()` — ambos de solo lectura/agregados. No hay gestión de usuarios ni roles en este módulo (a diferencia del diseño de `ADMIN_DOMAIN_ANALYSIS.md`, que proponía un módulo RBAC dedicado). Las rutas administrativas de PQR y Encuestas, aunque bajo el mismo prefijo `/admin/` y el mismo middleware RBAC, invocan directamente `PQRService`/`SurveyService`.

**Fuente:** `app/Infrastructure/Admin/AdminService.php`, `app/Controllers/AdminController.php`, `config/routes.php` (rutas `/api/admin/*`).
