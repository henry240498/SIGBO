---
id: service--organizacion-dashboard
tipo: SERVICE
nombre: DashboardService
nivel: L2
dominio: organizacion
resumen: Logica de negocio de dashboard (modulo organizacion).
capa: backend
archivos:
  - backend/src/modules/organizacion/dashboard.service.ts
edges:
  - [belongs_to, domain--organizacion]
  - [uses, component--modulo-organizacion]
  - [uses, entity--rango]
  - [reads, table--organizacion-rangos]
  - [uses, entity--cargo]
  - [reads, table--organizacion-cargos]
  - [uses, entity--especialidad]
  - [reads, table--organizacion-especialidades]
  - [uses, entity--compania]
  - [reads, table--organizacion-companias]
  - [uses, entity--cuartel]
  - [reads, table--organizacion-cuarteles]
  - [uses, entity--brigada]
  - [reads, table--organizacion-brigadas]
  - [uses, entity--departamento]
  - [reads, table--organizacion-departamentos]
  - [uses, entity--unidad]
  - [reads, table--organizacion-unidades]
  - [uses, entity--turno]
  - [reads, table--organizacion-turnos]
  - [uses, entity--tipo-guardia]
  - [reads, table--organizacion-tipos-guardia]
  - [uses, entity--designacion]
  - [reads, table--organizacion-designaciones]
  - [uses, entity--ascenso]
  - [reads, table--organizacion-ascensos]
terminos: [organizacion, rango, cargo, especialidad, compania, cuartel, brigada, departamento, unidad, turno, tipo, guardia, designacion, ascenso]
---

# DashboardService

Logica de negocio de dashboard (modulo organizacion).


## Metodos

`obtener()`

## Archivos

- `backend/src/modules/organizacion/dashboard.service.ts`

## Relaciones

- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `uses` → [[component--modulo-organizacion|organizacion (modulo NestJS)]]
- `uses` → [[entity--rango|Rango]]
- `reads` → [[table--organizacion-rangos|organizacion.rangos]]
- `uses` → [[entity--cargo|Cargo]]
- `reads` → [[table--organizacion-cargos|organizacion.cargos]]
- `uses` → [[entity--especialidad|Especialidad]]
- `reads` → [[table--organizacion-especialidades|organizacion.especialidades]]
- `uses` → [[entity--compania|Compania]]
- `reads` → [[table--organizacion-companias|organizacion.companias]]
- `uses` → [[entity--cuartel|Cuartel]]
- `reads` → [[table--organizacion-cuarteles|organizacion.cuarteles]]
- `uses` → [[entity--brigada|Brigada]]
- `reads` → [[table--organizacion-brigadas|organizacion.brigadas]]
- `uses` → [[entity--departamento|Departamento]]
- `reads` → [[table--organizacion-departamentos|organizacion.departamentos]]
- `uses` → [[entity--unidad|Unidad]]
- `reads` → [[table--organizacion-unidades|organizacion.unidades]]
- `uses` → [[entity--turno|Turno]]
- `reads` → [[table--organizacion-turnos|organizacion.turnos]]
- `uses` → [[entity--tipo-guardia|TipoGuardia]]
- `reads` → [[table--organizacion-tipos-guardia|organizacion.tipos_guardia]]
- `uses` → [[entity--designacion|Designacion]]
- `reads` → [[table--organizacion-designaciones|organizacion.designaciones]]
- `uses` → [[entity--ascenso|Ascenso]]
- `reads` → [[table--organizacion-ascensos|organizacion.ascensos]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
