# UML 03 — Autenticación (AS-BUILT)

**Propósito:** representar el flujo real de registro, login, sesión, RBAC y recuperación de contraseña.

```mermaid
flowchart TD
    R["POST /auth/register\n(role: customer o mechanic - AUTODECLARADO)"] --> A1[AuthService.register]
    A1 --> S1["INSERT users + user_roles\n(transaccional)"]
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

**Explicación breve:** no se usa JWT — todo es sesión de servidor + cookie httpOnly, respaldada por la tabla `sessions`. `password_reset_tokens` almacena solo el hash SHA-256 del token, nunca el valor en claro. Un reseteo exitoso destruye todas las sesiones activas del usuario. El rol (`customer`/`mechanic`) se elige libremente en el propio formulario de registro — no hay paso de aprobación administrativa (ver `AS_DESIGNED_VS_AS_BUILT.md`, fila "Admin Access").

**Fuente:** `app/Infrastructure/Auth/Services/{AuthService,SessionManager,PasswordResetService}.php`, `app/Middleware/{AuthMiddleware,RBACMiddleware}.php`, `app/Infrastructure/Mail/MailerService.php`, `app/Infrastructure/Http/RateLimiter.php`, migraciones `2024_01_01_000001`, `2024_01_01_000002`, `2026_07_25_000017`.
