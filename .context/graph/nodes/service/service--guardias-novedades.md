---
id: service--guardias-novedades
tipo: SERVICE
nombre: NovedadesService
nivel: L2
dominio: guardias
resumen: Logica de negocio de novedades (modulo guardias).
capa: backend
archivos:
  - backend/src/modules/guardias/novedades.service.ts
edges:
  - [belongs_to, domain--guardias]
  - [uses, component--modulo-guardias]
  - [uses, entity--novedad-guardia]
  - [reads, table--operaciones-novedades-guardia]
  - [uses, entity--guardia]
  - [reads, table--operaciones-guardias]
  - [uses, entity--bombero]
  - [reads, table--personal-bomberos]
  - [uses, service--seguridad-auditoria]
terminos: [novedades, guardias, novedad, guardia, bombero]
---

# NovedadesService

Logica de negocio de novedades (modulo guardias).


## Metodos

`listar()` · `crear()`

## Archivos

- `backend/src/modules/guardias/novedades.service.ts`

## Relaciones

- `belongs_to` → [[domain--guardias|Guardias]]
- `uses` → [[component--modulo-guardias|guardias (modulo NestJS)]]
- `uses` → [[entity--novedad-guardia|NovedadGuardia]]
- `reads` → [[table--operaciones-novedades-guardia|operaciones.novedades_guardia]]
- `uses` → [[entity--guardia|Guardia]]
- `reads` → [[table--operaciones-guardias|operaciones.guardias]]
- `uses` → [[entity--bombero|Bombero]]
- `reads` → [[table--personal-bomberos|personal.bomberos]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[api--guardias-novedades|NovedadesController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
