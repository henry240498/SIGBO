---
id: api--equipos-equipamiento-bombero
tipo: API
nombre: EquipamientoBomberoController
nivel: L2
dominio: equipos
resumen: Superficie HTTP de equipamiento bombero bajo /api/v1/personal/bomberos.
prefijo: /api/v1/personal/bomberos
capa: backend
permisos: [personal:ver, equipos:prestar]
archivos:
  - backend/src/modules/equipos/equipamiento-bombero.controller.ts
edges:
  - [belongs_to, domain--equipos]
  - [exposes, service--equipos-equipamiento-bombero]
terminos: [equipamiento, bombero, equipos, personal, bomberos, ver, prestar]
---

# EquipamientoBomberoController

Superficie HTTP de equipamiento bombero bajo /api/v1/personal/bomberos.

- **Prefijo:** `/api/v1/personal/bomberos`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/personal/bomberos/:id/equipamiento` | `personal:ver` |
| POST | `/personal/bomberos/:id/equipamiento` | `equipos:prestar` |
| PATCH | `/personal/bomberos/equipamiento/:prestamoId/devolucion` | `equipos:prestar` |

## Archivos

- `backend/src/modules/equipos/equipamiento-bombero.controller.ts`

## Relaciones

- `belongs_to` → [[domain--equipos|Equipos]]
- `exposes` → [[service--equipos-equipamiento-bombero|EquipamientoBomberoService]]

## Referenciado por

- [[screen--dashboard-organizacion-ascensos|/dashboard/organizacion/ascensos]] `calls` →
- [[screen--dashboard-organizacion-cuarteles|/dashboard/organizacion/cuarteles]] `calls` →
- [[screen--dashboard-organizacion-designaciones|/dashboard/organizacion/designaciones]] `calls` →
- [[screen--dashboard-organizacion-turnos|/dashboard/organizacion/turnos]] `calls` →
- [[screen--dashboard-personal-nuevo|/dashboard/personal/nuevo]] `calls` →
- [[screen--dashboard-personal|/dashboard/personal]] `calls` →
- [[screen--dashboard-personal-id|/dashboard/personal/[id]]] `calls` →
- [[screen--dashboard-seguridad-usuarios|/dashboard/seguridad/usuarios]] `calls` →
- [[component--front-academia|academia]] `calls` →
- [[component--front-equipos|equipos]] `calls` →
- [[component--front-equipos|equipos]] `calls` →
- [[component--front-personal|personal]] `calls` →
- [[component--front-personal|personal]] `calls` →
- [[component--front-vehiculos|vehiculos]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
