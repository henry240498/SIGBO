---
id: api--reportes-reportes
tipo: API
nombre: ReportesController
nivel: L2
dominio: seguridad
resumen: Errores y sugerencias sobre la app o el sistema, guardados como texto plano en el servidor.
prefijo: /api/v1/reportes
capa: backend
permisos: [reportes:enviar]
archivos:
  - backend/src/modules/reportes/reportes.controller.ts
edges:
  - [belongs_to, domain--seguridad]
  - [exposes, service--reportes-reportes]
terminos: [reportes, enviar]
---

# ReportesController

Errores y sugerencias sobre la app o el sistema, guardados como texto plano en el servidor.

- **Prefijo:** `/api/v1/reportes`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| POST | `/reportes` | `reportes:enviar` |

## Archivos

- `backend/src/modules/reportes/reportes.controller.ts`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]
- `exposes` → [[service--reportes-reportes|ReportesService]]

## Referenciado por

- [[screen--dashboard-reportar|/dashboard/reportar]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
