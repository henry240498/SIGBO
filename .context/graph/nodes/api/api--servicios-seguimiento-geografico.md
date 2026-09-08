---
id: api--servicios-seguimiento-geografico
tipo: API
nombre: SeguimientoGeograficoController
nivel: L2
dominio: servicios
resumen: "Seguimiento Geografico y Operativo del Servicio: ruta planificada, eventos del recorrido y pruebas de comunicacion sobre un mapa. `servicios:ver_gps` gatea la seccion completa (igual que `denuncias:ver_datos_tecnicos` gatea IP/GPS en Denuncias -- mismo patron, ya probado en el sistema); `servicios:despachar` gatea cualquier escritura. Ambos permisos ya existian sembrados y asignados a roles, sin ningun endpoint que los usara."
prefijo: /api/v1/servicios/:servicioId/seguimiento
capa: backend
permisos: [servicios:ver_gps, servicios:despachar]
archivos:
  - backend/src/modules/servicios/seguimiento/seguimiento-geografico.controller.ts
edges:
  - [belongs_to, domain--servicios]
  - [exposes, service--servicios-seguimiento-geografico]
terminos: [seguimiento, geografico, servicios, servicio, ver, gps, despachar]
---

# SeguimientoGeograficoController

Seguimiento Geografico y Operativo del Servicio: ruta planificada, eventos del recorrido y pruebas de comunicacion sobre un mapa. `servicios:ver_gps` gatea la seccion completa (igual que `denuncias:ver_datos_tecnicos` gatea IP/GPS en Denuncias -- mismo patron, ya probado en el sistema); `servicios:despachar` gatea cualquier escritura. Ambos permisos ya existian sembrados y asignados a roles, sin ningun endpoint que los usara.

- **Prefijo:** `/api/v1/servicios/:servicioId/seguimiento`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/servicios/:servicioId/seguimiento` | `servicios:ver_gps` |
| POST | `/servicios/:servicioId/seguimiento/ruta-planificada` | `servicios:despachar` |
| DELETE | `/servicios/:servicioId/seguimiento/ruta-planificada` | `servicios:despachar` |
| POST | `/servicios/:servicioId/seguimiento/eventos` | `servicios:despachar` |
| DELETE | `/servicios/:servicioId/seguimiento/eventos/:eventoId` | `servicios:despachar` |
| POST | `/servicios/:servicioId/seguimiento/pruebas-comunicacion` | `servicios:despachar` |
| DELETE | `/servicios/:servicioId/seguimiento/pruebas-comunicacion/:pruebaId` | `servicios:despachar` |

## Archivos

- `backend/src/modules/servicios/seguimiento/seguimiento-geografico.controller.ts`

## Relaciones

- `belongs_to` → [[domain--servicios|Servicios]]
- `exposes` → [[service--servicios-seguimiento-geografico|SeguimientoGeograficoService]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
