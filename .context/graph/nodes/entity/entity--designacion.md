---
id: entity--designacion
tipo: ENTITY
nombre: Designacion
nivel: L1
dominio: organizacion
resumen: Entidad Designacion, persistida en organizacion.designaciones.
tabla: organizacion.designaciones
archivos:
  - backend/src/shared/entities/designacion.entity.ts
edges:
  - [belongs_to, domain--organizacion]
  - [persisted_in, table--organizacion-designaciones]
terminos: [designacion, designaciones, organizacion]
---

# Designacion

Entidad Designacion, persistida en organizacion.designaciones.

- **Tabla:** [[table--organizacion-designaciones|organizacion.designaciones]]
- **Columnas mapeadas:** 13

## Donde se usa

- **Pantallas:** `/dashboard/guardias`, `/dashboard/guardias/[id]`, `/dashboard/guardias/esquemas-horario`, `/dashboard/guardias/generar`, `/dashboard/guardias/grupos`, `/dashboard/guardias/grupos/[id]`, `/dashboard/guardias/ordenes`, `/dashboard/guardias/ordenes/[id]`, `/dashboard/guardias/ordenes/configuracion`, `/dashboard/guardias/ordenes/nueva`, `/dashboard/guardias/pernoctes`, `/dashboard/guardias/requisitos`, `/dashboard/guardias/sorteos`, `/dashboard/guardias/sorteos/[id]`, `/dashboard/organizacion/designaciones`, `/dashboard/organizacion/feriados`, `/dashboard/personal/[id]`
- **Endpoints:** DesignacionesController, FojaServicioController, OrdenesGuardiaController
- **Servicios:** DashboardService, DesignacionesService, FojaServicioService, OrdenesGuardiaService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/designacion.entity.ts`

## Relaciones

- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `persisted_in` → [[table--organizacion-designaciones|organizacion.designaciones]]

## Referenciado por

- [[service--guardias-ordenes-guardia|OrdenesGuardiaService]] `uses` →
- [[service--organizacion-dashboard|DashboardService]] `uses` →
- [[service--organizacion-designaciones|DesignacionesService]] `uses` →
- [[service--personal-foja-servicio|FojaServicioService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
