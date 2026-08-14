---
id: component--modulo-organizacion
tipo: COMPONENT
nombre: organizacion (modulo NestJS)
nivel: L1
dominio: organizacion
resumen: Modulo NestJS que cablea controladores, servicios y repositorios de organizacion.
capa: backend
archivos:
  - backend/src/modules/organizacion/organizacion.module.ts
edges:
  - [belongs_to, domain--organizacion]
terminos: [organizacion, modulo]
---

# organizacion (modulo NestJS)

Modulo NestJS que cablea controladores, servicios y repositorios de organizacion.


## Entidades registradas (forFeature)

Rango, Cargo, Especialidad, Compania, Cuartel, Brigada, Departamento, Unidad, Turno, TipoGuardia, Designacion, Ascenso, Bombero, Parametro, Feriado, Guardia

## Archivos

- `backend/src/modules/organizacion/organizacion.module.ts`

## Relaciones

- `belongs_to` → [[domain--organizacion|Organización Institucional]]

## Referenciado por

- [[service--organizacion-ascensos|AscensosService]] `uses` →
- [[service--organizacion-brigadas|BrigadasService]] `uses` →
- [[service--organizacion-cargos|CargosService]] `uses` →
- [[service--organizacion-companias|CompaniasService]] `uses` →
- [[service--organizacion-cuarteles|CuartelsService]] `uses` →
- [[service--organizacion-dashboard|DashboardService]] `uses` →
- [[service--organizacion-departamentos|DepartamentosService]] `uses` →
- [[service--organizacion-designaciones|DesignacionesService]] `uses` →
- [[service--organizacion-especialidades|EspecialidadesService]] `uses` →
- [[service--organizacion-feriados|FeriadosService]] `uses` →
- [[service--organizacion-parametros|ParametrosService]] `uses` →
- [[service--organizacion-rangos|RangosService]] `uses` →
- [[service--organizacion-tipos-guardia|TiposGuardiaService]] `uses` →
- [[service--organizacion-turnos|TurnosService]] `uses` →
- [[service--organizacion-unidades|UnidadesService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
