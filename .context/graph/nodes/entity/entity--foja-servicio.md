---
id: entity--foja-servicio
tipo: ENTITY
nombre: FojaServicio
nivel: L1
dominio: personal
resumen: Entidad FojaServicio, persistida en personal.fojas_servicio.
tabla: personal.fojas_servicio
archivos:
  - backend/src/shared/entities/foja-servicio.entity.ts
edges:
  - [belongs_to, domain--personal]
  - [persisted_in, table--personal-fojas-servicio]
terminos: [foja, servicio, fojas, personal]
---

# FojaServicio

Entidad FojaServicio, persistida en personal.fojas_servicio.

- **Tabla:** [[table--personal-fojas-servicio|personal.fojas_servicio]]
- **Columnas mapeadas:** 7

## Donde se usa

- **Pantallas:** — (sin pantalla que llegue hasta aca)
- **Endpoints:** FojaServicioController
- **Servicios:** FojaServicioService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/foja-servicio.entity.ts`

## Relaciones

- `belongs_to` → [[domain--personal|Personal]]
- `persisted_in` → [[table--personal-fojas-servicio|personal.fojas_servicio]]

## Referenciado por

- [[service--personal-foja-servicio|FojaServicioService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
