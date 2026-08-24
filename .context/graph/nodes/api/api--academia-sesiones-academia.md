---
id: api--academia-sesiones-academia
tipo: API
nombre: SesionesAcademiaController
nivel: L2
dominio: academia
resumen: Sesiones/jornadas de una actividad academica -- cada una es un operaciones.eventos_asistencia enlazado. La asistencia por sesion (participantes, marcaciones, calculo de solapamiento) se gestiona con los endpoints ya existentes de operaciones/eventos/:id/..., no se duplican aqui (seccion 9-10 del pedido).
prefijo: /api/v1/academia/actividades
capa: backend
permisos: [academia:ver, academia:registrar_asistencia]
archivos:
  - backend/src/modules/academia/sesiones-academia.controller.ts
edges:
  - [belongs_to, domain--academia]
  - [exposes, service--academia-sesiones-academia]
terminos: [sesiones, academia, actividades, ver, registrar, asistencia]
---

# SesionesAcademiaController

Sesiones/jornadas de una actividad academica -- cada una es un operaciones.eventos_asistencia enlazado. La asistencia por sesion (participantes, marcaciones, calculo de solapamiento) se gestiona con los endpoints ya existentes de operaciones/eventos/:id/..., no se duplican aqui (seccion 9-10 del pedido).

- **Prefijo:** `/api/v1/academia/actividades`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/academia/actividades/:id/sesiones` | `academia:ver` |
| POST | `/academia/actividades/:id/sesiones` | `academia:registrar_asistencia` |

## Archivos

- `backend/src/modules/academia/sesiones-academia.controller.ts`

## Relaciones

- `belongs_to` → [[domain--academia|Academia]]
- `exposes` → [[service--academia-sesiones-academia|SesionesAcademiaService]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
