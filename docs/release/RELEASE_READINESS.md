# P.A.R.C.E — Release Readiness Checklist

> Estado real verificado en esta auditoría (branch `Angel`). `[x]` solo se usa cuando hay evidencia directa (código, ejecución de comando, o archivo verificado) — no se marca nada por suposición. `[~]` = parcial/existe pero incompleto. `[ ]` = pendiente. `[N/A]` = no aplica al alcance actual del proyecto.
>
> **Este checklist NO certifica que P.A.R.C.E esté listo para producción comercial.** Certifica el estado real de cada punto, con evidencia.

## Código

- [x] Working tree sin cambios de código de negocio durante esta auditoría — solo documentación nueva (verificado con `git status --porcelain`).
- [x] `composer validate` pasa (con 1 advertencia: sin campo `license` — ver `THIRD_PARTY.md`).
- [x] Build de frontend limpio (`npm run build` — `tsc && vite build`, 0 errores).
- [~] Lint de frontend: `npm run lint` reporta 9 errores (`@typescript-eslint/no-explicit-any` en 5 archivos) y 16 warnings (`react-hooks/exhaustive-deps`, `react-refresh/only-export-components`) — preexistentes, no introducidos por esta auditoría, no corregidos automáticamente (requieren tocar código de negocio, fuera del alcance "solo documentación" de esta tarea).
- [ ] `declare(strict_types=1)` — no auditado archivo por archivo en esta pasada (evaluación explícitamente fuera de alcance de una auditoría no invasiva).

## Seguridad

- [x] Sin secretos versionados en Git — verificado con `git ls-files` + grep de patrones de secretos (AWS keys, private keys, API keys conocidas) sobre `app/` y `frontend/src/`: cero coincidencias.
- [x] `.env` correctamente ignorado por Git (`.gitignore` línea 2) y no rastreado (`git ls-files` no lo lista).
- [x] `.env.example` contiene solo placeholders, sin credenciales reales.
- [x] Contraseñas con Argon2id (`PasswordHasher`).
- [x] Tokens de reseteo de contraseña almacenados solo como hash SHA-256, de un solo uso, con expiración de 1 hora.
- [x] RBAC aplicado por middleware en todas las rutas que lo requieren (verificado contra `config/routes.php`).
- [x] Protección IDOR verificada en evidencias (`ServiceRequestEvidenceService::getEvidences`) y en solicitudes de servicio (ownership checks en `ServiceRequestService`).
- [x] CORS sin wildcard + credenciales (corregido en commit `cb1ac23`, verificado presente en `CORSMiddleware`).
- [x] Cabeceras de seguridad (`SecurityHeadersMiddleware`: CSP, X-Frame-Options, X-Content-Type-Options, HSTS condicional).
- [x] Rate limiting en login/registro/forgot-password/reset-password.
- [x] Condiciones de carrera cerradas en operaciones críticas (aceptar/cancelar/completar solicitud, registro concurrente, reseteo de contraseña, unicidad de placa/VIN, evidencias) — verificado por historial de commits `fix(*)`de esta misma rama.
- [ ] Pentesting — no realizado. **Pendiente.**
- [ ] `SECURITY.md` (política de reporte de vulnerabilidades) — no existe en la raíz del proyecto. **Pendiente.**
- [~] Autorización de mecánico: rol autodeclarado en registro, sin aprobación administrativa — **decisión de producto pendiente**, no un defecto de implementación (ver `docs/roadmap/PARCE_ROADMAP_AS_BUILT.md` sección A.1).

## Base de datos

- [x] ERD real documentado y verificado contra las 17 migraciones (`docs/architecture/ERD_AS_BUILT.md`).
- [x] Integridad referencial: FKs con `ON DELETE` explícito en la gran mayoría de relaciones (CASCADE/RESTRICT/SET NULL según corresponda al dominio).
- [x] Migraciones ejecutables de forma determinista y versionadas (`database/migrations/`, `MigrationRunner`).
- [~] Deriva de esquema histórica no explicada (migraciones 11 y 15 restauran columnas que desaparecieron de una BD viva sin migración de eliminación registrada) — documentado, no resuelto, no bloqueante para el estado actual.
- [ ] Backups automatizados — no existen. **Pendiente** (ver `docs/security/OPERATIONAL_SECURITY.md`).
- [ ] Prueba de restauración de backup — no realizada. **Pendiente.**

## Frontend

- [x] Build de producción funcional (`npm run build`).
- [x] Guardas de ruta por rol (`ProtectedRoute`) verificadas contra las 18 páginas y `App.tsx`.
- [x] Manejo global de expiración de sesión (evento `parce:session-expired`).
- [~] Calidad de tipos: 9 usos de `any` explícito detectados por ESLint — no corregidos en esta auditoría (requiere tocar código de negocio).
- [ ] Tests automatizados de frontend (Jest/Vitest/Testing Library) — no confirmados en el repositorio.
- [ ] Accesibilidad (a11y) — no auditada en esta pasada.

## Backend

- [x] Estructura verificada y documentada (`PARCE_AS_BUILT_ARCHITECTURE.md`).
- [x] Sin dependencias de producción de terceros (0 paquetes en `composer.json` `require`) — superficie de ataque de supply-chain mínima.
- [x] Manejo de errores centralizado (`ErrorHandler`) sin filtrar detalles internos en producción (`APP_DEBUG` controla esto — confirmado en `.env.example` con advertencia explícita).

## Tests

- [x] Suite ejecutada realmente en esta auditoría: `vendor/bin/phpunit --no-coverage` → **134 tests, 202 aserciones, 0 fallos, 0 errores.**
- [~] Cobertura real: exclusivamente `*Validator`/DTOs (11 archivos). **0% de cobertura en `*Service.php`, Controllers y Middleware** — declarado explícitamente, no se infla esta métrica.
- [ ] Tests de integración/feature — no existen (`tests/Feature/`, `tests/Integration/` no existen).
- [ ] Reporte de cobertura de código (`--coverage-html` o similar) — no generado en esta auditoría (requeriría Xdebug/PCOV, no confirmado instalado).

## Documentación

- [x] Arquitectura AS-BUILT completa y validada cruzadamente (`docs/architecture/PARCE_AS_BUILT_ARCHITECTURE.md`, `ERD_AS_BUILT.md`, `AS_DESIGNED_VS_AS_BUILT.md`, 10 diagramas UML).
- [x] Roadmap AS-BUILT sin conversión automática de pendientes en tareas aprobadas (`docs/roadmap/PARCE_ROADMAP_AS_BUILT.md`).
- [x] Documentación de API generada desde `config/routes.php` real (`docs/api/API_REFERENCE.md`).
- [x] `THIRD_PARTY.md` con licencias verificadas desde metadatos reales de paquetes instalados.
- [x] `CHANGELOG.md` sin versiones inventadas.
- [x] Documentación de privacidad y seguridad operacional AS-BUILT (`docs/security/`).
- [x] `README.md` revisado — no afirma funcionalidades inexistentes (pagos, tracking en tiempo real, notificaciones, aprobación de mecánicos).

## Configuración

- [x] `.env.example` completo y documentado con advertencias de producción inline.
- [x] `.gitignore` cubre `.env`, `vendor/`, `node_modules/`, logs, cache, sesiones, backups locales.
- [ ] Separación explícita de configuración dev/staging/producción más allá de `APP_ENV` — no existe un mecanismo de perfiles adicional. **N/A para el alcance actual** (proyecto de un solo entorno de despliegue documentado).

## Privacidad

- [x] Datos personales tratados identificados y documentados (`docs/security/PRIVACY_AND_DATA_PROTECTION.md`).
- [x] Controles técnicos de acceso/minimización documentados.
- [ ] Aviso de privacidad / política de tratamiento de datos visible al usuario — no existe.
- [ ] Mecanismo de consentimiento explícito — no existe.
- [ ] Revisión jurídica de cumplimiento (Ley 1581 de 2012, Colombia) — **pendiente de validación jurídica**, no realizada.

## Deployment

- [x] `DEPLOYMENT.md` existe en la raíz del proyecto (no auditado línea por línea en esta pasada).
- [N/A] Infraestructura cloud/contenedores — no existe en este repositorio; no se documenta como si existiera.
- [ ] Pipeline de entrega continua (CD) — no existe, solo CI (tests + build).

## Backups

- [ ] Backups automatizados de base de datos — no existen.
- [ ] Backups fuera de sitio — no existen.

## Observabilidad

- [x] Logs de request con correlación `X-Request-Id` (commit `3521884`).
- [x] Logs de error sin argumentos de función sensibles.
- [ ] Métricas/monitoreo (APM, dashboards de infraestructura) — no existen.
- [ ] Alertas automatizadas — no existen.

## Pendientes que requieren decisión humana (no técnica)

Ver `docs/roadmap/PARCE_ROADMAP_AS_BUILT.md` sección A — resumen:
1. ¿Mecánico autodeclarado o aprobación administrativa?
2. ¿Rating bidireccional (mecánico → cliente)?
3. Infraestructura real de subida de archivos.
4. Destino de `vehicle_documents`/`vehicle_maintenance_records`.
5. ¿Validar vencimiento de SOAT/Tecnomecánica como bloqueo?
6. Licencia del propio proyecto (campo `license` ausente en `composer.json`, sin archivo `LICENSE`).

---

**Conclusión honesta:** P.A.R.C.E está en un estado técnico sólido para un **MVP funcional, demostrable y documentado** — no para una operación comercial real. Los pendientes marcados `[ ]` arriba (backups, CD, pentesting, revisión legal, política de privacidad, aprobación de mecánicos, cobertura de tests de Services/Controllers) son gaps reales, no detalles menores, y deben tratarse como tales antes de cualquier lanzamiento comercial.
