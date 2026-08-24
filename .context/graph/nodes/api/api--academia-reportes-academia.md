---
id: api--academia-reportes-academia
tipo: API
nombre: ReportesAcademiaController
nivel: L2
dominio: academia
resumen: Superficie HTTP de reportes academia bajo /api/v1/academia/actividades.
prefijo: /api/v1/academia/actividades
capa: backend
permisos: [academia:ver]
archivos:
  - backend/src/modules/academia/reportes-academia.controller.ts
edges:
  - [belongs_to, domain--academia]
  - [exposes, service--academia-reportes-academia]
terminos: [reportes, academia, actividades, ver]
---

# ReportesAcademiaController

Superficie HTTP de reportes academia bajo /api/v1/academia/actividades.

- **Prefijo:** `/api/v1/academia/actividades`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/academia/actividades/:id/reporte.pdf` | `academia:ver` |
| GET | `/academia/actividades/:id/reporte.docx` | `academia:ver` |

## Archivos

- `backend/src/modules/academia/reportes-academia.controller.ts`

## Relaciones

- `belongs_to` → [[domain--academia|Academia]]
- `exposes` → [[service--academia-reportes-academia|ReportesAcademiaService]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
