# UML 07 — PQR (AS-BUILT)

**Propósito:** reconstruir la arquitectura real del módulo PQR — no existe ningún documento de diseño previo para este módulo; este diagrama se generó 100% desde el código.

```mermaid
flowchart TD
    U["Cliente o Mecanico: POST /pqr\n{type, subject, description}"] --> S1["PQRService.create\n(INSERT + genera ticket_code PQR-YYYY-NNNNNN)"]
    S1 --> DB[(tabla pqr)]
    U2["GET /pqr, GET /pqr/{id}"] --> G1["Ownership check (404 si no es dueno)"]
    ADM["Admin: GET /admin/pqr?status&type&q&page&per_page"] --> S2["PQRService.adminList\nPAGINADO (LIMIT/OFFSET)"]
    ADM2["Admin: PUT /admin/pqr/{id}/status"] --> S3["PQRService.updateStatus\nvalida VALID_TRANSITIONS"]
    ADM3["Admin: POST /admin/pqr/{id}/respond"] --> S4["PQRService.respond\nsiempre fuerza status=resolved"]

    subgraph Estados
        P[pending] --> IR[in_review]
        P --> RJ[rejected]
        P --> RS[resolved]
        IR --> RJ
        IR --> RS
    end
```

**Explicación breve:** `type` es ENUM real (`peticion`, `queja`, `reclamo`, `sugerencia`). `respond()` es una acción independiente de `updateStatus()`: siempre fija `resolved` directamente (guardado solo por "aún no respondido"), sin pasar por la matriz `VALID_TRANSITIONS`. El listado admin está paginado (LIMIT/OFFSET) y soporta filtro por `status`, `type` y búsqueda de texto (`q`).

**Fuente:** `app/Infrastructure/PQR/{PQRService,PQRValidator}.php`, `app/Controllers/PQRController.php`, migración `2026_07_10_000009`.
