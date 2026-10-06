---
id: service--prevencion-prevencion
tipo: SERVICE
nombre: PrevencionService
nivel: L2
dominio: servicios
resumen: Logica de negocio de prevencion (modulo prevencion).
capa: backend
archivos:
  - backend/src/modules/prevencion/prevencion.service.ts
edges:
  - [belongs_to, domain--servicios]
  - [uses, component--modulo-prevencion]
  - [uses, service--seguridad-auditoria]
terminos: [prevencion]
---

# PrevencionService

Logica de negocio de prevencion (modulo prevencion).


## Metodos

`registrar()` · `listar()` · `estadoActual()`

## Archivos

- `backend/src/modules/prevencion/prevencion.service.ts`

## Relaciones

- `belongs_to` → [[domain--servicios|Servicios]]
- `uses` → [[component--modulo-prevencion|prevencion (modulo NestJS)]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[api--prevencion-prevencion|PrevencionController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
