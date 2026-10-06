---
id: api--prevencion-prevencion
tipo: API
nombre: PrevencionController
nivel: L2
dominio: servicios
resumen: Inspecciones de prevencion y certificados (4.5). Reutiliza servicios:ver / crear.
prefijo: /api/v1/prevencion
capa: backend
permisos: [servicios:ver, servicios:crear]
archivos:
  - backend/src/modules/prevencion/prevencion.controller.ts
edges:
  - [belongs_to, domain--servicios]
  - [exposes, service--prevencion-prevencion]
terminos: [prevencion, servicios, ver, crear]
---

# PrevencionController

Inspecciones de prevencion y certificados (4.5). Reutiliza servicios:ver / crear.

- **Prefijo:** `/api/v1/prevencion`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/prevencion/inspecciones` | `servicios:ver` |
| GET | `/prevencion/estado` | `servicios:ver` |
| POST | `/prevencion/inspecciones` | `servicios:crear` |

## Archivos

- `backend/src/modules/prevencion/prevencion.controller.ts`

## Relaciones

- `belongs_to` → [[domain--servicios|Servicios]]
- `exposes` → [[service--prevencion-prevencion|PrevencionService]]

## Referenciado por

- [[component--front-reservas|reservas]] `calls` →
- [[component--front-reservas|reservas]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
