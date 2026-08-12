---
id: api--personal-consultas-cruzadas
tipo: API
nombre: ConsultasCruzadasController
nivel: L2
dominio: personal
resumen: Superficie HTTP de consultas cruzadas bajo /api/v1/personal/bomberos.
prefijo: /api/v1/personal/bomberos
capa: backend
permisos: [personal:ver]
archivos:
  - backend/src/modules/personal/consultas-cruzadas.controller.ts
edges:
  - [belongs_to, domain--personal]
  - [exposes, service--personal-consultas-cruzadas]
terminos: [consultas, cruzadas, personal, bomberos, ver]
---

# ConsultasCruzadasController

Superficie HTTP de consultas cruzadas bajo /api/v1/personal/bomberos.

- **Prefijo:** `/api/v1/personal/bomberos`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/personal/bomberos/:id/guardias` | `personal:ver` |
| GET | `/personal/bomberos/:id/servicios` | `personal:ver` |
| GET | `/personal/bomberos/:id/formacion-academia` | `personal:ver` |

## Archivos

- `backend/src/modules/personal/consultas-cruzadas.controller.ts`

## Relaciones

- `belongs_to` → [[domain--personal|Personal]]
- `exposes` → [[service--personal-consultas-cruzadas|ConsultasCruzadasService]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
