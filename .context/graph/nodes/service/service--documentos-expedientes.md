---
id: service--documentos-expedientes
tipo: SERVICE
nombre: ExpedientesService
nivel: L2
dominio: documentos
resumen: Agrupador de documentos ordenados cronologicamente (seccion 23).
capa: backend
archivos:
  - backend/src/modules/documentos/expedientes.service.ts
edges:
  - [belongs_to, domain--documentos]
  - [uses, component--modulo-documentos]
  - [uses, entity--expediente]
  - [reads, table--documentos-expedientes]
  - [uses, entity--documento]
  - [reads, table--documentos-documentos-institucionales]
  - [uses, service--seguridad-auditoria]
terminos: [expedientes, documentos, expediente, documento]
---

# ExpedientesService

Agrupador de documentos ordenados cronologicamente (seccion 23).


## Metodos

`findAll()` · `findOne()` · `documentos()` · `create()` · `update()`

## Archivos

- `backend/src/modules/documentos/expedientes.service.ts`

## Relaciones

- `belongs_to` → [[domain--documentos|Documentos]]
- `uses` → [[component--modulo-documentos|documentos (modulo NestJS)]]
- `uses` → [[entity--expediente|Expediente]]
- `reads` → [[table--documentos-expedientes|documentos.expedientes]]
- `uses` → [[entity--documento|Documento]]
- `reads` → [[table--documentos-documentos-institucionales|documentos.documentos_institucionales]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[api--documentos-expedientes|ExpedientesController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
