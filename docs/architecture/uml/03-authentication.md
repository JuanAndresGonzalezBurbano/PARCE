# UML 03 — Autenticación (AS-BUILT)

**Propósito:** representar el flujo real de registro, login, sesión, RBAC y recuperación de contraseña.

```mermaid
flowchart TD
    R["POST /auth/register\n(SIEMPRE role=customer - sin campo de rol)"] --> A1[AuthService.register]
    A1 --> S1["INSERT users + user_roles(customer)\n(transaccional)"]
    L["POST /auth/login"] --> A2[AuthService.authenticate]
    A2 --> S2[SessionManager.create]
    S2 --> COOKIE["Cookie httpOnly de sesion\n(tabla sessions)"]
    ME["GET /auth/me"] --> AM1[AuthMiddleware]
    AM1 -->|"valida"| A3[AuthService.getCurrentUser]
    AM1 -->|"401"| SE["evento parce:session-expired\n(frontend limpia user, redirige a /login)"]
    FP["POST /auth/forgot-password"] --> PR1[PasswordResetService.requestReset]
    PR1 --> TOK["password_reset_tokens\n(token_hash SHA-256, TTL 1h)"]
    PR1 --> MAIL[MailerService / Resend]
    RP["POST /auth/reset-password"] --> PR2[PasswordResetService.resetPassword]
    PR2 --> DESTROY["SessionManager.destroyAllUserSessions\n(logout global)"]
    RATE["RateLimiter\n(login, register, forgot/reset-password)"] -.-> A2
    RATE -.-> A1
    RATE -.-> PR1
    RBAC["RBACMiddleware(roles)"] -.->|"rutas protegidas por rol"| CTRL[Controllers]
```

**Explicación breve:** no se usa JWT — todo es sesión de servidor + cookie httpOnly, respaldada por la tabla `sessions`. `password_reset_tokens` almacena solo el hash SHA-256 del token, nunca el valor en claro. Un reseteo exitoso destruye todas las sesiones activas del usuario. **El registro público ya solo crea el rol `customer`** — no existe ningún campo de rol en el formulario ni en `AuthService::register()`; el rol `mechanic` ya no se autodeclara (ver diagrama de solicitud de mecánico, abajo).

**Fuente:** `app/Infrastructure/Auth/Services/{AuthService,SessionManager,PasswordResetService}.php`, `app/Middleware/{AuthMiddleware,RBACMiddleware}.php`, `app/Infrastructure/Mail/MailerService.php`, `app/Infrastructure/Http/RateLimiter.php`, migraciones `2024_01_01_000001`, `2024_01_01_000002`, `2026_07_25_000017`.

---

## Solicitud de rol de mecánico (Mechanic Application)

**Propósito:** representar cómo se obtiene realmente el rol `mechanic` desde que se eliminó la autodeclaración — solicitud del usuario, revisión de un administrador, o cancelación por el propio solicitante.

```mermaid
sequenceDiagram
    actor U as Usuario (customer)
    participant MAC as MechanicApplicationController
    participant MAS as MechanicApplicationService
    participant DB as MySQL (admin_access_requests / user_roles)
    actor Adm as Administrador

    U->>MAC: POST /mechanic-applications {justification}
    MAC->>MAS: create(userId, justification)
    MAS->>DB: SELECT users WHERE id=userId FOR UPDATE
    MAS->>MAS: cuenta activa? no admin/super_admin?\nno tiene ya mechanic? licencia completa y vigente?\nsin solicitud pending propia?
    alt alguna condicion falla
        MAS-->>MAC: DomainException (400/403/409)
        MAC-->>U: error
    else todo ok
        MAS->>DB: INSERT admin_access_requests (status=pending)
        MAS-->>MAC: application
        MAC-->>U: 201 application
    end

    Adm->>MAC: GET /admin/mechanic-applications?status=pending
    MAC->>MAS: adminList(filters, page)
    MAS->>DB: SELECT ... JOIN users (paginado)
    MAS-->>Adm: lista + datos del solicitante

    Adm->>MAC: POST /admin/mechanic-applications/{id}/approve
    MAC->>MAS: approve(id, adminUserId)
    MAS->>DB: SELECT admin_access_requests WHERE id FOR UPDATE
    MAS->>MAS: adminUserId != solicitante? (anti-autoaprobacion)\nsolicitante sigue activo y con licencia vigente?
    alt falla alguna verificacion
        MAS-->>Adm: DomainException (403/400/409)
    else ok
        MAS->>DB: INSERT user_roles (mechanic, assigned_by=adminUserId)
        MAS->>DB: UPDATE admin_access_requests SET status=approved\nWHERE id AND status=pending
        MAS-->>Adm: application actualizada
    end

    U->>MAC: POST /mechanic-applications/{id}/cancel
    MAC->>MAS: cancel(id, userId)
    MAS->>DB: UPDATE admin_access_requests SET status=cancelled\nWHERE id AND user_id AND status=pending
    MAS-->>U: application actualizada (o 409 si ya cambio de estado)
```

**Explicación breve:** reutiliza `admin_access_requests` (existente desde la migración inicial) sin ninguna migración nueva. `user_id`, `assigned_by`, `reviewed_by`, `approved_by` siempre salen de la sesión autenticada, nunca del body. `create()` bloquea la fila del propio usuario; `approve()`/`reject()` bloquean la fila de la solicitud — mismo patrón `SELECT ... FOR UPDATE` + `UPDATE` condicionado al estado usado en el resto del codebase (`ServiceRequestService`, `PQRService`). Un `administrator`/`super_admin` no puede solicitar el rol (403), y un administrador no puede aprobar su propia solicitud (403, aunque en la práctica esto ya sería imposible por la regla anterior — se mantiene como segunda barrera).

**Fuente:** `app/Infrastructure/MechanicApplication/{MechanicApplicationService,MechanicApplicationValidator}.php`, `app/Controllers/MechanicApplicationController.php`, `config/routes.php`, `tests/Integration/MechanicApplicationFlowTest.php`.
