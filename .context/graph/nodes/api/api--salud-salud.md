---
id: api--salud-salud
tipo: API
nombre: SaludController
nivel: L2
dominio: seguridad
resumen: Superficie HTTP de salud bajo /api/v1/salud.
prefijo: /api/v1/salud
capa: backend
archivos:
  - backend/src/modules/salud/salud.controller.ts
edges:
  - [belongs_to, domain--seguridad]
terminos: [salud]
---

# SaludController

Superficie HTTP de salud bajo /api/v1/salud.

- **Prefijo:** `/api/v1/salud`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/salud` | — |

## Archivos

- `backend/src/modules/salud/salud.controller.ts`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
