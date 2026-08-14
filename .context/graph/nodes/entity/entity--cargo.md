---
id: entity--cargo
tipo: ENTITY
nombre: Cargo
nivel: L1
dominio: organizacion
resumen: Entidad Cargo, persistida en organizacion.cargos.
tabla: organizacion.cargos
archivos:
  - backend/src/shared/entities/cargo.entity.ts
edges:
  - [belongs_to, domain--organizacion]
  - [persisted_in, table--organizacion-cargos]
terminos: [cargo, cargos, organizacion]
---

# Cargo

Entidad Cargo, persistida en organizacion.cargos.

- **Tabla:** [[table--organizacion-cargos|organizacion.cargos]]
- **Columnas mapeadas:** 10

## Donde se usa

- **Pantallas:** `/dashboard/guardias`, `/dashboard/guardias/[id]`, `/dashboard/guardias/esquemas-horario`, `/dashboard/guardias/generar`, `/dashboard/guardias/grupos`, `/dashboard/guardias/grupos/[id]`, `/dashboard/guardias/ordenes`, `/dashboard/guardias/ordenes/[id]`, `/dashboard/guardias/ordenes/configuracion`, `/dashboard/guardias/ordenes/nueva`, `/dashboard/guardias/pernoctes`, `/dashboard/guardias/requisitos`, `/dashboard/guardias/sorteos`, `/dashboard/guardias/sorteos/[id]`, `/dashboard/organizacion/cargos`, `/dashboard/organizacion/designaciones`, `/dashboard/organizacion/feriados`, `/dashboard/personal/[id]`
- **Endpoints:** CargosController, DesignacionesController, FojaServicioController, OrdenesGuardiaController
- **Servicios:** CargosService, DashboardService, DesignacionesService, FojaServicioService, OrdenesGuardiaService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/cargo.entity.ts`

## Relaciones

- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `persisted_in` → [[table--organizacion-cargos|organizacion.cargos]]

## Referenciado por

- [[service--guardias-ordenes-guardia|OrdenesGuardiaService]] `uses` →
- [[service--organizacion-cargos|CargosService]] `uses` →
- [[service--organizacion-dashboard|DashboardService]] `uses` →
- [[service--organizacion-designaciones|DesignacionesService]] `uses` →
- [[service--personal-foja-servicio|FojaServicioService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
