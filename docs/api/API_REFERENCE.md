# P.A.R.C.E — API Reference (AS-BUILT)

> Generado exclusivamente desde `config/routes.php` y los Controllers/Validators reales. No se documenta ningún endpoint que no exista en el código. Todas las respuestas siguen el sobre estándar de `ResponseFormatter`: éxito `{"success": true, "data": {...}, "message"?: string}`, error `{"success": false, "error": string, "fields"?: {...}}`. Las claves de `data` se convierten automáticamente a camelCase.
>
> Base URL por defecto (desarrollo): `http://localhost:8000/api`. Todas las rutas listadas abajo son relativas a `/api` salvo la ruta web raíz.
>
> Middleware global aplicado a **todas** las rutas (no repetido por fila): `CORSMiddleware` → `SecurityHeadersMiddleware` → `RequestLoggerMiddleware`.

---

## Autenticación (`/auth`)

| Método | Ruta | Auth | Rol | Body / Params | Notas |
|---|---|---|---|---|---|
| GET | `/health` | No | — | — | Health check general |
| GET | `/health/database` | No | — | — | Health check de BD |
| GET | `/health/system` | No | — | — | Health check integral |
| GET | `/auth/health` | No | — | — | Health check del módulo Auth |
| POST | `/auth/register` | No | — | `{email, password, password_confirmation, first_name, last_name, phone?, role?: 'customer'\|'mechanic'}` | Rate-limited. El rol se autodeclara — sin aprobación admin (ver `AS_DESIGNED_VS_AS_BUILT.md`) |
| POST | `/auth/login` | No | — | `{email, password, remember?}` | Rate-limited. Fija cookie httpOnly de sesión |
| POST | `/auth/forgot-password` | No | — | `{email}` | Rate-limited. Respuesta siempre genérica (anti-enumeración) |
| POST | `/auth/reset-password` | No | — | `{token, new_password, new_password_confirmation}` | Rate-limited. Destruye todas las sesiones del usuario al completar |
| POST | `/auth/logout` | Sí | cualquiera | — | Invalida la sesión actual |
| GET | `/auth/me` | Sí | cualquiera | — | Perfil del usuario autenticado (incl. `driverLicense` si aplica) |
| PUT | `/auth/profile` | Sí | cualquiera | `{driver_license_number?, driver_license_expiration_date?, driver_license_document_url?}` | Errores de validación por campo devueltos como array de strings |
| PUT | `/auth/password` | Sí | cualquiera | `{current_password, new_password, new_password_confirmation}` | Destruye todas las sesiones al completar |

**Errores comunes:** `400` validación, `401` no autenticado / credenciales inválidas, `403` cuenta no activa, `409` email duplicado (registro concurrente), `429` rate limit excedido.

---

## Vehículos (`/vehicles`) — requiere sesión, cualquier rol autenticado

| Método | Ruta | Body / Params | Notas |
|---|---|---|---|
| GET | `/vehicles?active_only=true` | — | Lista los vehículos del usuario autenticado |
| POST | `/vehicles` | `{license_plate, make, model, year, vehicle_type, fuel_type, color?, vin?, nickname?, primary_photo_url?, is_primary?, soat_expiration_date?, tecnomecanica_expiration_date?}` | — |
| GET | `/vehicles/{id}` | — | 404 si no pertenece al usuario |
| PUT | `/vehicles/{id}` | mismos campos, todos opcionales, + `status?` | — |
| DELETE | `/vehicles/{id}` | — | Soft delete (`status='inactive'`) |
| PUT | `/vehicles/{id}/primary` | — | Reasignación transaccional de vehículo principal |

**Nota de seguridad conocida:** SOAT/Tecnomecánica vencidos no bloquean ninguna de estas operaciones (ver `PARCE_AS_BUILT_ARCHITECTURE.md` §1.10).

---

## Solicitudes de servicio — Cliente (`/service-requests`) — rol `customer`

| Método | Ruta | Body / Params | Notas |
|---|---|---|---|
| GET | `/service-requests?status=` | — | Lista propias, filtrable por estado |
| POST | `/service-requests` | `{vehicle_id, emergency_type, description, latitude, longitude, priority?}` | — |
| GET | `/service-requests/{id}` | — | Solo dueño |
| PUT | `/service-requests/{id}` | campos parciales | Solo si `status='pending'` |
| POST | `/service-requests/{id}/cancel` | `{cancellation_reason}` | Solo si `pending`/`assigned` |
| POST | `/service-requests/{id}/rate` | `{customer_rating, punctuality_rating, service_quality_rating, customer_feedback?}` | Solo si `completed` y sin calificación previa |
| GET | `/service-requests/{id}/evidences` | — | Solo cliente dueño o mecánico asignado |

## Solicitudes de servicio — Mecánico (`/mechanic/*`) — rol `mechanic`

| Método | Ruta | Body / Params | Notas |
|---|---|---|---|
| GET | `/mechanic/requests?status=` | — | Solicitudes asignadas al mecánico |
| GET | `/mechanic/requests/available?latitude=&longitude=&radius=` | — | Solicitudes `pending` cercanas (Haversine); ubicación exacta ocultada, solo aproximada |
| GET | `/mechanic/requests/{id}` | — | Registrada después de `/available` — el orden en `routes.php` importa |
| POST | `/mechanic/requests/{id}/accept` | — | `pending→assigned`. 403 si licencia vencida/vacía, 409 si ya la tomó otro |
| PUT | `/mechanic/requests/{id}/start` | — | `assigned→in_progress`. Solo el mecánico asignado |
| PUT | `/mechanic/requests/{id}/complete` | `{final_cost}` | `in_progress→completed`. Solo el mecánico asignado |
| POST | `/mechanic/requests/{id}/evidence` | `{evidence_type: before\|during\|after, image_url, original_filename?, description?, file_size?}` | Solo si `assigned/in_progress/completed` |
| GET | `/mechanic/requests/{id}/evidences` | — | Solo mecánico asignado |
| GET | `/mechanic/stats` | — | Promedios de calificación, total ganado, servicios completados |

**Errores comunes:** `400` transición de estado inválida / body inválido, `403` no es el dueño/asignado o licencia vencida, `404` no existe, `409` condición de carrera (ya tomada/cancelada/calificada).

---

## PQR (`/pqr`, `/admin/pqr`)

| Método | Ruta | Auth/Rol | Body / Params | Notas |
|---|---|---|---|---|
| GET | `/pqr` | customer o mechanic | — | Tickets propios |
| POST | `/pqr` | customer o mechanic | `{type: peticion\|queja\|reclamo\|sugerencia, subject, description}` | Genera `ticket_code` |
| GET | `/pqr/{id}` | customer o mechanic | — | Solo dueño |
| GET | `/admin/pqr?status=&type=&q=&page=&per_page=` | administrator/super_admin | — | Paginado, filtrable |
| PUT | `/admin/pqr/{id}/status` | administrator/super_admin | `{status}` | Valida contra la matriz de transiciones |
| POST | `/admin/pqr/{id}/respond` | administrator/super_admin | `{admin_response}` | Fuerza `status=resolved` |

## Encuestas (`/surveys`, `/admin/surveys`)

| Método | Ruta | Auth/Rol | Body / Params | Notas |
|---|---|---|---|---|
| POST | `/surveys` | customer | `{service_request_id, overall_satisfaction, would_recommend, comments?}` | Solo si la solicitud está `completed` y sin encuesta previa |
| GET | `/surveys` | customer | — | Encuestas propias |
| GET | `/admin/surveys?page=&per_page=` | administrator/super_admin | — | Paginado, solo lectura |

## Administración (`/admin/dashboard`, `/admin/ratings`)

| Método | Ruta | Auth/Rol | Params | Notas |
|---|---|---|---|---|
| GET | `/admin/dashboard` | administrator/super_admin | — | Agregados: usuarios, PQR, encuestas, rating promedio, solicitudes por estado |
| GET | `/admin/ratings?mechanic_id=&customer_id=&min_rating=&date_from=&date_to=&page=&per_page=` | administrator/super_admin | — | Paginado, filtrable |

---

## Resumen de conteo

- **46 rutas totales** (1 web + 45 API), verificado contra `config/routes.php`.
- Middleware de autenticación (`AuthMiddleware`) requerido en todas salvo: health checks, `register`, `login`, `forgot-password`, `reset-password`.
- Middleware RBAC (`RBACMiddleware`) aplicado por grupo de rol en: `/service-requests/*` (customer), `/mechanic/*` (mechanic), `/pqr` y `/pqr/{id}` (customer+mechanic), `/admin/*` (administrator+super_admin).

**Fuente:** `config/routes.php` completo, `app/Controllers/*.php`, `app/Infrastructure/{Dominio}/*Validator.php` para los cuerpos de petición. Ver [`../architecture/PARCE_AS_BUILT_ARCHITECTURE.md`](../architecture/PARCE_AS_BUILT_ARCHITECTURE.md) para el detalle de reglas de negocio por endpoint.
