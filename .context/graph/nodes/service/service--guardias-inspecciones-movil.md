---
id: service--guardias-inspecciones-movil
tipo: SERVICE
nombre: InspeccionesMovilService
nivel: L2
dominio: guardias
resumen: "Condicion de moviles dentro de una guardia (secciones 12/31/36-40 del pedido): Guardias solo CONSULTA los vehiculos/equipos ya administrados en sus propios modulos (Vehiculos/Equipos, ya construidos) -- nunca duplica su almacenamiento, solo agrega el registro de \"se reviso, resultado X\" propio del checklist de la guardia."
capa: backend
archivos:
  - backend/src/modules/guardias/inspecciones-movil.service.ts
edges:
  - [belongs_to, domain--guardias]
  - [uses, component--modulo-guardias]
  - [uses, entity--inspeccion-movil]
  - [reads, table--operaciones-inspecciones-movil]
  - [uses, entity--guardia]
  - [reads, table--operaciones-guardias]
  - [uses, entity--vehiculo]
  - [reads, table--vehiculos-vehiculos]
  - [uses, entity--checklist-item-vehiculo]
  - [reads, table--vehiculos-checklist-items]
  - [uses, entity--equipo]
  - [reads, table--equipos-equipos]
  - [uses, service--seguridad-auditoria]
terminos: [inspecciones, movil, guardias, inspeccion, guardia, vehiculo, checklist, item, equipo]
---

# InspeccionesMovilService

Condicion de moviles dentro de una guardia (secciones 12/31/36-40 del pedido): Guardias solo CONSULTA los vehiculos/equipos ya administrados en sus propios modulos (Vehiculos/Equipos, ya construidos) -- nunca duplica su almacenamiento, solo agrega el registro de "se reviso, resultado X" propio del checklist de la guardia.


## Metodos

`movilesARevisar()` · `listar()` · `crear()`

## Archivos

- `backend/src/modules/guardias/inspecciones-movil.service.ts`

## Relaciones

- `belongs_to` → [[domain--guardias|Guardias]]
- `uses` → [[component--modulo-guardias|guardias (modulo NestJS)]]
- `uses` → [[entity--inspeccion-movil|InspeccionMovil]]
- `reads` → [[table--operaciones-inspecciones-movil|operaciones.inspecciones_movil]]
- `uses` → [[entity--guardia|Guardia]]
- `reads` → [[table--operaciones-guardias|operaciones.guardias]]
- `uses` → [[entity--vehiculo|Vehiculo]]
- `reads` → [[table--vehiculos-vehiculos|vehiculos.vehiculos]]
- `uses` → [[entity--checklist-item-vehiculo|ChecklistItemVehiculo]]
- `reads` → [[table--vehiculos-checklist-items|vehiculos.checklist_items]]
- `uses` → [[entity--equipo|Equipo]]
- `reads` → [[table--equipos-equipos|equipos.equipos]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[api--guardias-inspecciones-movil|InspeccionesMovilController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
