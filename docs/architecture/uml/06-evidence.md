# UML 06 — Evidencias (AS-BUILT)

**Propósito:** representar el flujo real de subida y consulta de evidencia fotográfica de un servicio.

```mermaid
flowchart TD
    MR["Mecanico: POST /mechanic/requests/{id}/evidence"] --> C1[ServiceRequestController.addEvidence]
    C1 --> S1[ServiceRequestEvidenceService.addEvidence]
    S1 --> G1{"Solicitud existe?"}
    G1 -->|"no"| E404[404]
    G1 -->|"si"| G2{"mechanic_id == usuario autenticado?"}
    G2 -->|"no"| E403[403]
    G2 -->|"si"| G3{"status IN assigned/in_progress/completed?"}
    G3 -->|"no"| E400[400]
    G3 -->|"si"| G4["Validar evidence_type (before/during/after),\nimage_url (http/https, <=500 chars, extension jpg/jpeg/png/webp),\nfile_size <=5MB"]
    G4 --> TX["Transaccion: SELECT ... FOR UPDATE\nre-valida status (cierra TOCTOU)"]
    TX --> INS["INSERT service_request_evidences"]
    CR["Cliente o Mecanico: GET .../evidences"] --> S2[ServiceRequestEvidenceService.getEvidences]
    S2 --> G5{"usuario = customer_id\nO usuario = mechanic_id asignado?"}
    G5 -->|"no"| E403b["403 - prevencion IDOR"]
    G5 -->|"si"| LIST[Lista de evidencias]
```

**Explicación breve:** `evidence_type` es un ENUM real a nivel de base de datos (`before`, `during`, `after`). La re-validación del estado dentro de una transacción con `SELECT ... FOR UPDATE` justo antes del `INSERT` cierra una condición de carrera (TOCTOU) donde la solicitud podría cancelarse entre la validación inicial y la escritura.

**Fuente:** `app/Infrastructure/ServiceRequest/ServiceRequestEvidenceService.php`, migraciones `2026_01_01_000008`, `2026_07_10_000014`.
