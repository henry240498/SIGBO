---
id: api--seguridad-auditoria
tipo: API
nombre: AuditoriaController
nivel: L2
dominio: seguridad
resumen: Superficie HTTP de auditoria bajo /api/v1/seguridad/auditoria.
prefijo: /api/v1/seguridad/auditoria
capa: backend
permisos: [seguridad:ver_logs]
archivos:
  - backend/src/modules/seguridad/auditoria.controller.ts
edges:
  - [belongs_to, domain--seguridad]
  - [exposes, service--seguridad-auditoria]
terminos: [auditoria, seguridad, ver, logs]
---

# AuditoriaController

Superficie HTTP de auditoria bajo /api/v1/seguridad/auditoria.

- **Prefijo:** `/api/v1/seguridad/auditoria`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/seguridad/auditoria` | `seguridad:ver_logs` |

## Archivos

- `backend/src/modules/seguridad/auditoria.controller.ts`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]
- `exposes` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[screen--dashboard-asistencia-auditoria|/dashboard/asistencia/auditoria]] `calls` →
- [[screen--dashboard-guardias-auditoria|/dashboard/guardias/auditoria]] `calls` →
- [[screen--dashboard-seguridad-auditoria|/dashboard/seguridad/auditoria]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
