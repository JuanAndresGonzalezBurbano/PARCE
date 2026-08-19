# UML 02 — Componentes principales (AS-BUILT)

**Propósito:** representar los dominios de negocio reales bajo `app/Infrastructure/` y sus dependencias verificadas (no asumidas).

```mermaid
flowchart LR
    subgraph Auth["Auth (app/Infrastructure/Auth)"]
        AuthSvc[AuthService]
        SessMgr[SessionManager]
        PwdHash[PasswordHasher]
        RoleVal[RoleValidator]
        PwdReset[PasswordResetService]
    end
    subgraph Vehicles["Vehicles"]
        VehSvc[VehicleService]
    end
    subgraph SR["ServiceRequests"]
        SRSvc[ServiceRequestService]
        EvidSvc[ServiceRequestEvidenceService]
    end
    subgraph PQR["PQR"]
        PQRSvc[PQRService]
    end
    subgraph Surveys["Surveys"]
        SurvSvc[SurveyService]
    end
    subgraph Admin["Admin (solo lectura / agregados)"]
        AdmSvc[AdminService]
    end
    subgraph MechApp["MechanicApplication"]
        MechSvc[MechanicApplicationService]
    end
    Mail[MailerService / Resend]

    Auth --> Vehicles
    Auth --> SR
    Vehicles --> SR
    SR --> EvidSvc
    SR --> Surveys
    Auth --> PQR
    Auth -.-> Mail
    PwdReset -.-> Mail
    SR -.->|"lee ratings, agrega"| Admin
    PQR -.->|"lee, agrega"| Admin
    Surveys -.->|"lee, agrega"| Admin
    Auth -.->|"lee total_users"| Admin
    Auth -->|"RoleValidator: roles actuales"| MechApp
    MechApp -->|"aprobar: INSERT user_roles(mechanic)"| Auth
```

**Explicación breve:** "Ratings" no es un componente propio — vive como columnas dentro de `ServiceRequests`. `Admin` no tiene lógica de negocio propia salvo `dashboard()`/`ratings()`; la gestión de PQR/Encuestas/solicitudes de mecánico desde rutas `/admin/*` llama directamente a `PQRService`/`SurveyService`/`MechanicApplicationService`. `MechanicApplication` (nuevo) reemplaza la autodeclaración del rol `mechanic` en el registro — no existen componentes `Mechanics` (perfil formal dedicado), `Documents`, `Notifications`, `Tracking`, `Payments`.

**Fuente:** inventario completo de `app/Infrastructure/*` y `app/Controllers/*`.
