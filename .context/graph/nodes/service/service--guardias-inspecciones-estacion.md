---
id: service--guardias-inspecciones-estacion
tipo: SERVICE
nombre: InspeccionesEstacionService
nivel: L2
dominio: guardias
resumen: Logica de negocio de inspecciones estacion (modulo guardias).
capa: backend
archivos:
  - backend/src/modules/guardias/inspecciones-estacion.service.ts
edges:
  - [belongs_to, domain--guardias]
  - [uses, component--modulo-guardias]
  - [uses, entity--inspeccion-estacion]
  - [reads, table--operaciones-inspecciones-estacion]
  - [uses, entity--guardia]
  - [reads, table--operaciones-guardias]
  - [uses, entity--parametro]
  - [reads, table--organizacion-parametros]
  - [uses, service--seguridad-auditoria]
terminos: [inspecciones, estacion, guardias, inspeccion, guardia, parametro]
---

# InspeccionesEstacionService

Logica de negocio de inspecciones estacion (modulo guardias).


## Metodos

`listar()` · `crear()`

## Archivos

- `backend/src/modules/guardias/inspecciones-estacion.service.ts`

## Relaciones

- `belongs_to` → [[domain--guardias|Guardias]]
- `uses` → [[component--modulo-guardias|guardias (modulo NestJS)]]
- `uses` → [[entity--inspeccion-estacion|InspeccionEstacion]]
- `reads` → [[table--operaciones-inspecciones-estacion|operaciones.inspecciones_estacion]]
- `uses` → [[entity--guardia|Guardia]]
- `reads` → [[table--operaciones-guardias|operaciones.guardias]]
- `uses` → [[entity--parametro|Parametro]]
- `reads` → [[table--organizacion-parametros|organizacion.parametros]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[api--guardias-inspecciones-estacion|InspeccionesEstacionController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
