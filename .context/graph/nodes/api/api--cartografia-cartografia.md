---
id: api--cartografia-cartografia
tipo: API
nombre: CartografiaController
nivel: L2
dominio: servicios
resumen: Hidrantes, puntos de riesgo y pre-planes. Reutiliza servicios:ver / crear / editar.
prefijo: /api/v1/cartografia
capa: backend
permisos: [servicios:ver, servicios:crear, servicios:editar]
archivos:
  - backend/src/modules/cartografia/cartografia.controller.ts
edges:
  - [belongs_to, domain--servicios]
  - [exposes, service--cartografia-cartografia]
terminos: [cartografia, servicios, ver, crear, editar]
---

# CartografiaController

Hidrantes, puntos de riesgo y pre-planes. Reutiliza servicios:ver / crear / editar.

- **Prefijo:** `/api/v1/cartografia`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/cartografia/cercanos` | `servicios:ver` |
| GET | `/cartografia/hidrantes` | `servicios:ver` |
| POST | `/cartografia/hidrantes` | `servicios:crear` |
| PATCH | `/cartografia/hidrantes/:id` | `servicios:editar` |
| GET | `/cartografia/puntos-riesgo` | `servicios:ver` |
| POST | `/cartografia/puntos-riesgo` | `servicios:crear` |
| PATCH | `/cartografia/puntos-riesgo/:id` | `servicios:editar` |
| GET | `/cartografia/puntos-riesgo/:id/preplan` | `servicios:ver` |
| GET | `/cartografia/puntos-riesgo/:id/preplan/historial` | `servicios:ver` |
| POST | `/cartografia/puntos-riesgo/:id/preplan` | `servicios:editar` |

## Archivos

- `backend/src/modules/cartografia/cartografia.controller.ts`

## Relaciones

- `belongs_to` → [[domain--servicios|Servicios]]
- `exposes` → [[service--cartografia-cartografia|CartografiaService]]

## Referenciado por

- [[component--front-cartografia|cartografia]] `calls` →
- [[component--front-cartografia|cartografia]] `calls` →
- [[component--front-cartografia|cartografia]] `calls` →
- [[component--front-cartografia|cartografia]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
