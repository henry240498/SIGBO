---
id: api--vehiculos-vehiculos-autorizados
tipo: API
nombre: VehiculosAutorizadosController
nivel: L2
dominio: vehiculos
resumen: Superficie HTTP de vehiculos autorizados bajo /api/v1/personal/bomberos.
prefijo: /api/v1/personal/bomberos
capa: backend
permisos: [personal:ver, personal:editar]
archivos:
  - backend/src/modules/vehiculos/vehiculos-autorizados.controller.ts
edges:
  - [belongs_to, domain--vehiculos]
  - [exposes, service--vehiculos-vehiculos-autorizados]
terminos: [vehiculos, autorizados, personal, bomberos, ver, editar]
---

# VehiculosAutorizadosController

Superficie HTTP de vehiculos autorizados bajo /api/v1/personal/bomberos.

- **Prefijo:** `/api/v1/personal/bomberos`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/personal/bomberos/:id/vehiculos-autorizados` | `personal:ver` |
| PUT | `/personal/bomberos/:id/vehiculos-autorizados` | `personal:editar` |

## Archivos

- `backend/src/modules/vehiculos/vehiculos-autorizados.controller.ts`

## Relaciones

- `belongs_to` → [[domain--vehiculos|Vehículos]]
- `exposes` → [[service--vehiculos-vehiculos-autorizados|VehiculosAutorizadosService]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
