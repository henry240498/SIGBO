---
id: service--ia-ia-propuestas-mejora
tipo: SERVICE
nombre: IaPropuestasMejoraService
nivel: L2
dominio: inteligencia
resumen: Logica de negocio de ia propuestas mejora (modulo ia).
capa: backend
archivos:
  - backend/src/modules/ia/ia-propuestas-mejora.service.ts
edges:
  - [belongs_to, domain--inteligencia]
  - [uses, component--modulo-ia]
  - [uses, entity--ia-propuesta-mejora]
  - [reads, table--ia-propuestas-mejora]
  - [uses, service--seguridad-auditoria]
terminos: [propuestas, mejora, propuesta]
---

# IaPropuestasMejoraService

Logica de negocio de ia propuestas mejora (modulo ia).


## Metodos

`findAll()` · `findOne()` · `crear()` · `enviarARevision()` · `aprobar()` · `rechazar()` · `publicar()`

## Archivos

- `backend/src/modules/ia/ia-propuestas-mejora.service.ts`

## Relaciones

- `belongs_to` → [[domain--inteligencia|Inteligencia Artificial]]
- `uses` → [[component--modulo-ia|ia (modulo NestJS)]]
- `uses` → [[entity--ia-propuesta-mejora|PropuestaMejoraIa]]
- `reads` → [[table--ia-propuestas-mejora|ia.propuestas_mejora]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[api--ia-ia-propuestas-mejora|IaPropuestasMejoraController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
