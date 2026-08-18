# Política de seguridad — P.A.R.C.E

## Reporte de vulnerabilidades

Si encuentras una vulnerabilidad de seguridad en P.A.R.C.E, repórtala de forma privada al equipo mantenedor del repositorio (por ejemplo, mediante un mensaje directo al propietario del repositorio en GitHub, o a través de la funcionalidad de "Security Advisories" de GitHub si está habilitada).

**No abras un issue público** para reportar una vulnerabilidad — usa un canal privado hasta que exista una corrección disponible.

Un canal de contacto formal (correo o formulario dedicado) todavía **no está definido** y se establecerá más adelante. Este documento se actualizará cuando exista.

## Qué información incluir

- Descripción del problema y su impacto potencial.
- Pasos para reproducirlo.
- Versión/commit del código afectado.
- Cualquier evidencia relevante (sin incluir datos personales de terceros).

## Qué esperar

Este es un proyecto en fase de MVP/desarrollo activo, mantenido sin un equipo de seguridad dedicado ni un SLA formal de respuesta. Se hará el mejor esfuerzo razonable por revisar y corregir reportes válidos, pero **no se garantiza un tiempo de respuesta específico**.

## Alcance

Aplica al código de este repositorio (`app/`, `frontend/`, `database/`, `config/`, `scripts/`). No cubre servicios de terceros integrados (por ejemplo, Resend) — esos deben reportarse directamente a sus respectivos proveedores.

## Estado de auditorías de seguridad

No se ha realizado una prueba de penetración (pentesting) formal ni una auditoría de seguridad externa sobre este proyecto. Ver [`docs/release/RELEASE_READINESS.md`](docs/release/RELEASE_READINESS.md) y [`docs/security/OPERATIONAL_SECURITY.md`](docs/security/OPERATIONAL_SECURITY.md) para el detalle de controles verificados y pendientes.
