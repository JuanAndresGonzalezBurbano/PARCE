# UML 01 — Arquitectura general (AS-BUILT)

**Propósito:** mostrar el flujo real de una petición desde el frontend hasta la base de datos, incluyendo todas las capas de middleware realmente registradas.

```mermaid
flowchart TD
    FE["Frontend React\n(Pages -> Contexts -> Services)"] -->|"fetch, credentials: include"| RT["config/routes.php\n(46 rutas)"]
    RT --> MW1["CORSMiddleware"]
    MW1 --> MW2["SecurityHeadersMiddleware"]
    MW2 --> MW3["RequestLoggerMiddleware"]
    MW3 --> MW4{"AuthMiddleware\nsesion valida?"}
    MW4 -->|"401"| FE
    MW4 -->|"ok"| MW5{"RBACMiddleware\nrol permitido? (donde aplica)"}
    MW5 -->|"403"| FE
    MW5 --> CTRL["Controllers\napp/Controllers/*.php"]
    CTRL --> INFRA["Infrastructure Services\napp/Infrastructure/*/Service.php"]
    INFRA --> VAL["Validators\napp/Infrastructure/*/Validator.php"]
    INFRA --> DB[("Core Database\napp/Core/Database.php - PDO")]
    DB --> MYSQL[("MySQL\n11 tablas reales")]
    INFRA -.->|"solo Auth / PasswordReset"| MAIL["MailerService\n(Resend HTTP API)"]
```

**Explicación breve:** el middleware global (`CORSMiddleware` → `SecurityHeadersMiddleware` → `RequestLoggerMiddleware`) se aplica a las 46 rutas sin excepción. `AuthMiddleware` y `RBACMiddleware` se aplican por ruta/grupo según lo declarado en `config/routes.php`. No hay capa Repository/DAO: los Services llaman directamente a `Database::`. No existe `app/Modules/`.

**Fuente:** `config/routes.php`, `app/Core/Router.php`, `app/Middleware/*.php`, `app/Core/Database.php`.
