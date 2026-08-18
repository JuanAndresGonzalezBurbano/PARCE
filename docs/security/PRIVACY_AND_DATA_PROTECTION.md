# P.A.R.C.E — Privacidad y protección de datos (AS-BUILT)

> Este documento describe **qué datos personales trata el sistema realmente hoy y qué controles técnicos existen** — no es una revisión jurídica ni una declaración de cumplimiento legal. Ninguna afirmación de este documento debe interpretarse como "P.A.R.C.E cumple legalmente" — eso requiere una **revisión jurídica pendiente de validación**, no realizada en esta auditoría técnica.

## 1. Datos personales tratados (verificado contra el ERD real)

| Dato | Tabla / columna | Finalidad |
|---|---|---|
| Nombre, apellido | `users.first_name`, `users.last_name` | Identificación del usuario |
| Email | `users.email` | Autenticación, comunicación (recuperación de contraseña) |
| Teléfono | `users.phone` (nullable) | Contacto entre cliente y mecánico durante un servicio |
| Contraseña | `users.password_hash` (Argon2id, nunca en claro) | Autenticación |
| Ubicación GPS | `service_requests.latitude`/`longitude` | Localizar al cliente para asignar un mecánico cercano |
| Datos de vehículo | `vehicles.*` (placa, VIN, marca, modelo) | Prestación del servicio |
| Documentos de vehículo | `vehicles.soat_*`, `vehicles.tecnomecanica_*` (números y URLs de documento) | Verificación informativa de habilitación del vehículo |
| Licencia de conducción del mecánico | `users.driver_license_*` | Verificar habilitación para operar como mecánico |
| Evidencia fotográfica | `service_request_evidences.image_url` | Documentar el estado del vehículo antes/durante/después del servicio |
| Dirección IP | `sessions.ip_address`, `password_reset_tokens.ip_address`, logs de request | Seguridad de sesión, prevención de abuso, auditoría |

## 2. Finalidad declarada

Todos los datos listados arriba se recogen exclusivamente para la operación funcional descrita en su columna "Finalidad" — no se identificó, en el código auditado, ningún uso secundario (publicidad, perfilado, venta a terceros, analítica de comportamiento más allá de las métricas agregadas de `AdminService`).

## 3. Controles de acceso técnicos existentes (verificados en código)

- **RBAC por middleware** (`RBACMiddleware`) en cada ruta que expone datos de otro usuario.
- **Verificación de propiedad (ownership)** en cada Service antes de devolver o modificar un recurso (ej. `ServiceRequestEvidenceService::getEvidences()` solo permite al cliente dueño o al mecánico asignado — prevención explícita de IDOR, ver comentarios en el propio código).
- **Ocultación de ubicación exacta**: `ServiceRequestService::getById()` reemplaza `latitude`/`longitude` exactas por valores aproximados cuando un mecánico consulta una solicitud aún `pending` — minimización de exposición de ubicación antes de la aceptación.
- **Contraseñas nunca en claro**: hash Argon2id (`PasswordHasher`).
- **Tokens de recuperación de contraseña nunca en claro**: solo se almacena su hash SHA-256 (`password_reset_tokens.token_hash`), con expiración de 1 hora y un solo uso.
- **Logs sin datos de formulario sensibles**: `ErrorHandler::logException()` está documentado en el propio código como despojado de argumentos de función al registrar trazas de excepción (evita filtrar contraseñas/tokens en logs de error).

## 4. Minimización de datos

- No se almacena historial de ubicación (solo un punto por solicitud, no tracking continuo) — ver `PARCE_AS_BUILT_ARCHITECTURE.md` §1.10/§1.9.
- No se solicitan datos no necesarios para la operación (sin fecha de nacimiento, sin documento de identidad nacional, sin datos financieros — no existe módulo de pagos).

## 5. Retención y eliminación

**Estado real, verificado en el esquema:**

- La mayoría de tablas con datos personales usan **soft delete** (`deleted_at`): `users`, `vehicles`, `service_requests`, `pqr`, `surveys`. Esto significa que **los datos no se eliminan físicamente** al "borrar" un registro desde la aplicación — quedan en la base de datos marcados como eliminados, indefinidamente, salvo intervención manual directa sobre la BD.
- No existe ningún job o proceso automatizado de purga/anonimización de registros con `deleted_at` antiguo.
- `sessions` sí tiene limpieza activa vía cron (`scripts/maintenance/cleanup_sessions.php`, referenciado en `README.md`).
- `storage/logs/*.log` tiene un script de limpieza por retención configurable (`scripts/maintenance/cleanup_logs.php`, retención por defecto 30 días).
- **No existe una política de retención de datos personales documentada ni un mecanismo de "derecho al olvido" (borrado físico bajo solicitud del titular).**

## 6. Logs que contienen datos personales

- `storage/logs/requests.log` (vía `RequestLoggerMiddleware`): registra IP y user agent por cada petición.
- `sessions.ip_address`: se conserva mientras la sesión exista.
- `password_reset_tokens.ip_address`: se conserva junto al token.

## 7. Consideraciones de cumplimiento (Colombia)

Dado que P.A.R.C.E trata datos personales de usuarios ubicados presumiblemente en Colombia (nombres, teléfono, email, ubicación, documentos vehiculares), **debe considerarse la aplicabilidad de la Ley 1581 de 2012 (protección de datos personales) y su normativa reglamentaria** (Decreto 1377 de 2013 y posteriores) — en particular:

- Autorización previa e informada del titular para el tratamiento de sus datos.
- Aviso de privacidad / política de tratamiento de datos.
- Derechos de acceso, rectificación, actualización y supresión (habeas data).
- Registro Nacional de Bases de Datos (RNBD), si aplica según el volumen/naturaleza del tratamiento.

**Estos son controles técnicos implementados, no una validación de cumplimiento legal.** No existe hoy en el proyecto: aviso de privacidad visible al usuario, mecanismo de consentimiento explícito y registrado, ni un flujo de atención de derechos ARCO/habeas data. **Esto queda pendiente de validación jurídica** antes de cualquier operación comercial real.

## 8. Pendientes explícitos (no implementados)

- Política de privacidad / aviso de tratamiento de datos visible en el frontend.
- Términos y condiciones.
- Mecanismo de consentimiento explícito en el registro.
- Flujo de solicitud de eliminación/portabilidad de datos por parte del titular.
- Política de retención formal con purga automatizada de registros con soft-delete antiguo.
- Revisión jurídica formal de cumplimiento con la Ley 1581 de 2012.

**Fuente:** `database/migrations/*` (columnas reales), `app/Infrastructure/*` (controles de acceso verificados en código), `scripts/maintenance/*` (mecanismos de limpieza existentes).
