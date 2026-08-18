# UML 08 — Encuestas (AS-BUILT)

**Propósito:** reconstruir la arquitectura real del módulo de encuestas de satisfacción — sin documento de diseño previo.

```mermaid
flowchart TD
    C["Cliente: POST /surveys\n{service_request_id, overall_satisfaction, would_recommend, comments?}"] --> S1[SurveyService.create]
    S1 --> G1{"service_request existe,\npertenece al cliente,\nstatus=completed?"}
    G1 -->|"no"| E["400 / 403"]
    G1 -->|"si"| G2{"ya tiene encuesta?\n(UNIQUE service_request_id)"}
    G2 -->|"si"| E409["409 (check previo + catch de Duplicate entry como red de seguridad)"]
    G2 -->|"no"| INS["INSERT surveys - inmutable, sin update/delete"]
    C2["Cliente: GET /surveys"] --> S2["SurveyService.getByCustomer - solo propias"]
    ADM["Admin: GET /admin/surveys?page&per_page"] --> S3["SurveyService.adminList - PAGINADO, solo lectura"]
```

**Explicación breve:** relación 1:1 estricta con `service_requests` (constraint UNIQUE real en `surveys.service_request_id`) — una solicitud completada admite como máximo una encuesta. No existen métodos de actualización/borrado: una encuesta creada es inmutable.

**Fuente:** `app/Infrastructure/Survey/{SurveyService,SurveyValidator}.php`, `app/Controllers/SurveyController.php`, migración `2026_07_10_000010`.
