---
id: entity--rango
tipo: ENTITY
nombre: Rango
nivel: L1
dominio: organizacion
resumen: Entidad Rango, persistida en organizacion.rangos.
tabla: organizacion.rangos
archivos:
  - backend/src/shared/entities/rango.entity.ts
edges:
  - [belongs_to, domain--organizacion]
  - [persisted_in, table--organizacion-rangos]
terminos: [rango, rangos, organizacion]
---

# Rango

Entidad Rango, persistida en organizacion.rangos.

- **Tabla:** [[table--organizacion-rangos|organizacion.rangos]]
- **Columnas mapeadas:** 12

## Donde se usa

- **Pantallas:** `/dashboard/guardias`, `/dashboard/guardias/[id]`, `/dashboard/guardias/esquemas-horario`, `/dashboard/guardias/generar`, `/dashboard/guardias/grupos`, `/dashboard/guardias/grupos/[id]`, `/dashboard/guardias/ordenes`, `/dashboard/guardias/ordenes/[id]`, `/dashboard/guardias/ordenes/configuracion`, `/dashboard/guardias/ordenes/nueva`, `/dashboard/guardias/pernoctes`, `/dashboard/guardias/requisitos`, `/dashboard/guardias/sorteos`, `/dashboard/guardias/sorteos/[id]`, `/dashboard/organizacion/ascensos`, `/dashboard/organizacion/feriados`, `/dashboard/organizacion/rangos`, `/dashboard/personal/[id]`
- **Endpoints:** AscensosController, FojaServicioController, GuardiasController, OrdenesGuardiaController, RangosController
- **Servicios:** AscensosService, DashboardService, ElegibilidadService, FojaServicioService, GeneracionService, OrdenesGuardiaService, RangosService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/rango.entity.ts`

## Relaciones

- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `persisted_in` → [[table--organizacion-rangos|organizacion.rangos]]

## Referenciado por

- [[service--guardias-elegibilidad|ElegibilidadService]] `uses` →
- [[service--guardias-generacion|GeneracionService]] `uses` →
- [[service--guardias-ordenes-guardia|OrdenesGuardiaService]] `uses` →
- [[service--organizacion-ascensos|AscensosService]] `uses` →
- [[service--organizacion-dashboard|DashboardService]] `uses` →
- [[service--organizacion-rangos|RangosService]] `uses` →
- [[service--personal-foja-servicio|FojaServicioService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
