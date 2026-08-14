---
id: entity--orden-guardia-modificacion
tipo: ENTITY
nombre: OrdenGuardiaModificacion
nivel: L1
dominio: asistencia
resumen: "Historial de cambios a una Orden de Guardia ya PUBLICADA (seccion 15 del pedido): nunca modifica `OrdenGuardia.contenidoJson` -- solo agrega un registro de que cambio, por que, y quien lo hizo."
tabla: operaciones.ordenes_guardia_modificaciones
archivos:
  - backend/src/shared/entities/orden-guardia-modificacion.entity.ts
edges:
  - [belongs_to, domain--asistencia]
  - [persisted_in, table--operaciones-ordenes-guardia-modificaciones]
terminos: [orden, guardia, modificacion, ordenes, modificaciones, operaciones]
---

# OrdenGuardiaModificacion

Historial de cambios a una Orden de Guardia ya PUBLICADA (seccion 15 del pedido): nunca modifica `OrdenGuardia.contenidoJson` -- solo agrega un registro de que cambio, por que, y quien lo hizo.

- **Tabla:** [[table--operaciones-ordenes-guardia-modificaciones|operaciones.ordenes_guardia_modificaciones]]
- **Columnas mapeadas:** 7

## Donde se usa

- **Pantallas:** `/dashboard/guardias`, `/dashboard/guardias/[id]`, `/dashboard/guardias/esquemas-horario`, `/dashboard/guardias/generar`, `/dashboard/guardias/grupos`, `/dashboard/guardias/grupos/[id]`, `/dashboard/guardias/ordenes`, `/dashboard/guardias/ordenes/[id]`, `/dashboard/guardias/ordenes/configuracion`, `/dashboard/guardias/ordenes/nueva`, `/dashboard/guardias/pernoctes`, `/dashboard/guardias/requisitos`, `/dashboard/guardias/sorteos`, `/dashboard/guardias/sorteos/[id]`, `/dashboard/organizacion/feriados`, `/dashboard/personal/[id]`
- **Endpoints:** OrdenesGuardiaController
- **Servicios:** OrdenesGuardiaService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/orden-guardia-modificacion.entity.ts`

## Relaciones

- `belongs_to` → [[domain--asistencia|Asistencia]]
- `persisted_in` → [[table--operaciones-ordenes-guardia-modificaciones|operaciones.ordenes_guardia_modificaciones]]

## Referenciado por

- [[service--guardias-ordenes-guardia|OrdenesGuardiaService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
