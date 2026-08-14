---
id: service--guardias-ordenes-guardia
tipo: SERVICE
nombre: OrdenesGuardiaService
nivel: L2
dominio: guardias
resumen: "Documento oficial de Orden de Guardia -- capa de lectura/agregacion sobre la planificacion ya existente (Guardia/AsignacionGuardia/ GrupoGuardia/EsquemaHorarioGuardia), nunca una fuente de datos propia. `armarSnapshot` nunca escribe nada: es puramente de lectura, se puede llamar tantas veces como haga falta mientras la Orden siga en BORRADOR."
capa: backend
archivos:
  - backend/src/modules/guardias/ordenes-guardia.service.ts
edges:
  - [belongs_to, domain--guardias]
  - [uses, component--modulo-guardias]
  - [uses, entity--orden-guardia]
  - [reads, table--operaciones-ordenes-guardia]
  - [uses, entity--guardia]
  - [reads, table--operaciones-guardias]
  - [uses, entity--asignacion-guardia]
  - [reads, table--operaciones-asignacion-guardias]
  - [uses, entity--grupo-guardia]
  - [reads, table--operaciones-grupos-guardia]
  - [uses, entity--grupo-guardia-miembro]
  - [reads, table--operaciones-grupos-guardia-miembros]
  - [uses, entity--esquema-horario-guardia]
  - [reads, table--operaciones-esquemas-horario-guardia]
  - [uses, entity--bombero]
  - [reads, table--personal-bomberos]
  - [uses, entity--rango]
  - [reads, table--organizacion-rangos]
  - [uses, entity--vehiculo-autorizado]
  - [reads, table--personal-vehiculos-autorizados]
  - [uses, entity--cargo]
  - [reads, table--organizacion-cargos]
  - [uses, entity--designacion]
  - [reads, table--organizacion-designaciones]
  - [uses, entity--orden-guardia-modificacion]
  - [reads, table--operaciones-ordenes-guardia-modificaciones]
  - [uses, service--seguridad-auditoria]
  - [uses, service--guardias-orden-guardia-configuracion]
terminos: [ordenes, guardia, guardias, orden, asignacion, grupo, miembro, esquema, horario, bombero, rango, vehiculo, autorizado, cargo, designacion, modificacion]
---

# OrdenesGuardiaService

Documento oficial de Orden de Guardia -- capa de lectura/agregacion sobre la planificacion ya existente (Guardia/AsignacionGuardia/ GrupoGuardia/EsquemaHorarioGuardia), nunca una fuente de datos propia. `armarSnapshot` nunca escribe nada: es puramente de lectura, se puede llamar tantas veces como haga falta mientras la Orden siga en BORRADOR.


## Metodos

`findAll()` · `findOne()` · `crear()` · `regenerarPreview()` · `generarDocumentos()` · `revisar()` · `volverABorrador()` · `aprobar()` · `publicar()` · `anular()` · `listarModificaciones()` · `registrarModificacion()`

## Archivos

- `backend/src/modules/guardias/ordenes-guardia.service.ts`

## Relaciones

- `belongs_to` → [[domain--guardias|Guardias]]
- `uses` → [[component--modulo-guardias|guardias (modulo NestJS)]]
- `uses` → [[entity--orden-guardia|OrdenGuardia]]
- `reads` → [[table--operaciones-ordenes-guardia|operaciones.ordenes_guardia]]
- `uses` → [[entity--guardia|Guardia]]
- `reads` → [[table--operaciones-guardias|operaciones.guardias]]
- `uses` → [[entity--asignacion-guardia|AsignacionGuardia]]
- `reads` → [[table--operaciones-asignacion-guardias|operaciones.asignacion_guardias]]
- `uses` → [[entity--grupo-guardia|GrupoGuardia]]
- `reads` → [[table--operaciones-grupos-guardia|operaciones.grupos_guardia]]
- `uses` → [[entity--grupo-guardia-miembro|GrupoGuardiaMiembro]]
- `reads` → [[table--operaciones-grupos-guardia-miembros|operaciones.grupos_guardia_miembros]]
- `uses` → [[entity--esquema-horario-guardia|EsquemaHorarioGuardia]]
- `reads` → [[table--operaciones-esquemas-horario-guardia|operaciones.esquemas_horario_guardia]]
- `uses` → [[entity--bombero|Bombero]]
- `reads` → [[table--personal-bomberos|personal.bomberos]]
- `uses` → [[entity--rango|Rango]]
- `reads` → [[table--organizacion-rangos|organizacion.rangos]]
- `uses` → [[entity--vehiculo-autorizado|VehiculoAutorizado]]
- `reads` → [[table--personal-vehiculos-autorizados|personal.vehiculos_autorizados]]
- `uses` → [[entity--cargo|Cargo]]
- `reads` → [[table--organizacion-cargos|organizacion.cargos]]
- `uses` → [[entity--designacion|Designacion]]
- `reads` → [[table--organizacion-designaciones|organizacion.designaciones]]
- `uses` → [[entity--orden-guardia-modificacion|OrdenGuardiaModificacion]]
- `reads` → [[table--operaciones-ordenes-guardia-modificaciones|operaciones.ordenes_guardia_modificaciones]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]
- `uses` → [[service--guardias-orden-guardia-configuracion|OrdenGuardiaConfiguracionService]]

## Referenciado por

- [[api--guardias-ordenes-guardia|OrdenesGuardiaController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
