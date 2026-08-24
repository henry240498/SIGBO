---
id: entity--consumo-combustible
tipo: ENTITY
nombre: ConsumoCombustible
nivel: L1
dominio: vehiculos
resumen: Entidad ConsumoCombustible, persistida en vehiculos.consumos_combustible.
tabla: vehiculos.consumos_combustible
archivos:
  - backend/src/shared/entities/consumo-combustible.entity.ts
edges:
  - [belongs_to, domain--vehiculos]
  - [persisted_in, table--vehiculos-consumos-combustible]
terminos: [consumo, combustible, consumos, vehiculos]
---

# ConsumoCombustible

Entidad ConsumoCombustible, persistida en vehiculos.consumos_combustible.

- **Tabla:** [[table--vehiculos-consumos-combustible|vehiculos.consumos_combustible]]
- **Columnas mapeadas:** 9

## Donde se usa

- **Pantallas:** `/dashboard/deposito/articulos/[id]`, `/dashboard/deposito/bajas`, `/dashboard/deposito/incidencias`, `/dashboard/deposito/movimientos`, `/dashboard/equipos/[id]`, `/dashboard/personal/[id]`, `/dashboard/servicios/nuevo`, `/dashboard/vehiculos`, `/dashboard/vehiculos/[id]`, `/dashboard/vehiculos/checklist-items`
- **Endpoints:** VehiculosController
- **Servicios:** VehiculosService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/consumo-combustible.entity.ts`

## Relaciones

- `belongs_to` → [[domain--vehiculos|Vehículos]]
- `persisted_in` → [[table--vehiculos-consumos-combustible|vehiculos.consumos_combustible]]

## Referenciado por

- [[service--vehiculos-vehiculos|VehiculosService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
