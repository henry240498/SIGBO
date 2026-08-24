---
id: api--academia-certificaciones-academia
tipo: API
nombre: CertificacionesAcademiaController
nivel: L2
dominio: academia
resumen: "No todas las rutas usan @RequirePermission: la creacion/edicion/borrado permiten autoservicio (el bombero gestiona SU PROPIA certificacion sin academia:certificar) -- el chequeo real vive en el service, que compara el bombero objetivo contra el usuario autenticado (seccion 15 del pedido)."
prefijo: /api/v1
capa: backend
permisos: [personal:ver]
archivos:
  - backend/src/modules/academia/certificaciones-academia.controller.ts
edges:
  - [belongs_to, domain--academia]
  - [exposes, service--academia-certificaciones-academia]
terminos: [certificaciones, academia, personal, ver]
---

# CertificacionesAcademiaController

No todas las rutas usan @RequirePermission: la creacion/edicion/borrado permiten autoservicio (el bombero gestiona SU PROPIA certificacion sin academia:certificar) -- el chequeo real vive en el service, que compara el bombero objetivo contra el usuario autenticado (seccion 15 del pedido).

- **Prefijo:** `/api/v1`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/personal/bomberos/:bomberoId/certificaciones` | `personal:ver` |
| POST | `/academia/certificaciones` | — |
| DELETE | `/academia/certificaciones/:id` | — |

## Archivos

- `backend/src/modules/academia/certificaciones-academia.controller.ts`

## Relaciones

- `belongs_to` → [[domain--academia|Academia]]
- `exposes` → [[service--academia-certificaciones-academia|CertificacionesAcademiaService]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
