# UML 05 — Vehículos (AS-BUILT)

**Propósito:** representar la relación usuario-vehículo y los campos documentales reales, diferenciando explícitamente de la arquitectura documental histórica (`documents` polimórfico).

```mermaid
flowchart TD
    U[users] -->|"user_id (FK RESTRICT)"| V[vehicles]
    V --> SOAT["SOAT: soat_number, soat_expiration_date,\nsoat_document_url, soat_uploaded_at\n(columnas directas - NO tabla documents)"]
    V --> TECNO["Tecnomecanica: mismos 4 campos\n(columnas directas)"]
    U --> LIC["Licencia de conduccion:\ndriver_license_* en users (no en vehicles)\ndriver_license_status ENUM calculado"]
    V --> PRIM["is_primary\n(reasignacion transaccional en create/update/delete/setPrimary)"]
    V --> UNIQ["Unicidad placa/VIN:\nGET_LOCK de MySQL + SELECT-check\nNO por UNIQUE de BD (removido en migracion 16)"]
    SR[service_requests] -->|"vehicle_id, requiere status=active"| V
    NOTE["ADVERTENCIA: sin validacion de vencimiento.\nSOAT/Tecnomecanica vencidos NO bloquean\ncrear una solicitud ni activar el vehiculo\n(a diferencia de la licencia del mecanico, que si bloquea accept())"]
```

**Explicación breve:** el diseño histórico (`DOMAIN_MODEL_FINAL.md`) proponía una tabla `documents` polimórfica con workflow de verificación (`document_verifications`, estados pending/verified/rejected). La implementación real usa campos planos sin revisión administrativa — el dato se guarda tal como el usuario lo ingresa. La licencia de conducción vive en `users`, no en `vehicles` (es un atributo del mecánico, no del vehículo).

**Fuente:** `app/Infrastructure/Vehicle/{VehicleService,VehicleValidator}.php`, migraciones `2024_01_01_000003`, `2026_01_01_000005/000006`, `2026_07_10_000013/000015`, `2026_07_16_000016`.
