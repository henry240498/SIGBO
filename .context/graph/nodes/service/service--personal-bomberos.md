---
id: service--personal-bomberos
tipo: SERVICE
nombre: BomberosService
nivel: L2
dominio: personal
resumen: Logica de negocio de bomberos (modulo personal).
capa: backend
archivos:
  - backend/src/modules/personal/bomberos.service.ts
edges:
  - [belongs_to, domain--personal]
  - [uses, component--modulo-personal]
  - [uses, entity--bombero]
  - [reads, table--personal-bomberos]
  - [uses, entity--historial-codigo]
  - [reads, table--personal-historial-codigo]
  - [uses, entity--historial-institucional]
  - [reads, table--personal-historial-institucional]
  - [uses, service--seguridad-auditoria]
terminos: [bomberos, personal, bombero, historial, codigo, institucional]
---

# BomberosService

Logica de negocio de bomberos (modulo personal).


## Metodos

`if()` · `if()` · `if()` · `findAll()` · `filasExportables()` · `findOne()` · `create()` · `update()` · `darBaja()` · `eliminarFisico()`

## Archivos

- `backend/src/modules/personal/bomberos.service.ts`

## Relaciones

- `belongs_to` → [[domain--personal|Personal]]
- `uses` → [[component--modulo-personal|personal (modulo NestJS)]]
- `uses` → [[entity--bombero|Bombero]]
- `reads` → [[table--personal-bomberos|personal.bomberos]]
- `uses` → [[entity--historial-codigo|HistorialCodigo]]
- `reads` → [[table--personal-historial-codigo|personal.historial_codigo]]
- `uses` → [[entity--historial-institucional|HistorialInstitucional]]
- `reads` → [[table--personal-historial-institucional|personal.historial_institucional]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[api--personal-bomberos|BomberosController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
